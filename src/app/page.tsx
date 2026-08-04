'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SearchHero } from '@/features/search/SearchHero';
import { FilterSidebar } from '@/features/search/FilterSidebar';
import { JobCard } from '@/features/search/JobCard';
import { JobDetailModal } from '@/features/search/JobDetailModal';
import { ProviderHealthModal } from '@/features/search/ProviderHealthModal';
import { JobCardSkeleton } from '@/components/ui/skeleton';
import { NormalizedJob, SearchResultPayload, ExperienceLevel } from '@/types/job';
import { Button } from '@/components/ui/button';
import { Inbox, ChevronLeft, ChevronRight, Sparkles, Bot, Zap } from 'lucide-react';

export default function HomePage() {
  // Application Mode
  const [searchMode, setSearchMode] = useState<'standard' | 'rag'>('standard');

  // Application State
  const [jobs, setJobs] = useState<NormalizedJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedJob, setSelectedJob] = useState<NormalizedJob | null>(null);
  const [healthModalOpen, setHealthModalOpen] = useState<boolean>(false);
  const [ragExecutionTime, setRagExecutionTime] = useState<number | undefined>(undefined);
  const [engineMeta, setEngineMeta] = useState<string>('JobNet Multi-Provider Aggregation');

  // Search Filter State
  const [keyword, setKeyword] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [remoteOnly, setRemoteOnly] = useState<boolean>(false);
  const [employmentType, setEmploymentType] = useState<string>('');
  const [experience, setExperience] = useState<ExperienceLevel | string>('any');
  const [minSalary, setMinSalary] = useState<number>(0);
  const [datePosted, setDatePosted] = useState<string>('any');
  const [provider, setProvider] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastRagPrompt, setLastRagPrompt] = useState<string>('');

  // Result Metrics
  const [totalResults, setTotalResults] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [providersUsed, setProvidersUsed] = useState<string[]>([]);

  // Execute standard multi-provider search with advanced filters
  const executeStandardSearch = useCallback(async (
    kw: string,
    loc: string,
    rem: boolean,
    emp: string,
    exp: string,
    minSal: number,
    dateP: string,
    prov: string,
    page: number
  ) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });
      if (kw) query.set('keyword', kw);
      if (loc) query.set('location', loc);
      if (rem) query.set('remote', 'true');
      if (emp) query.set('employmentType', emp.toLowerCase().replace('-', '_'));
      if (exp && exp !== 'any') query.set('experience', exp);
      if (minSal > 0) query.set('minSalary', minSal.toString());
      if (dateP && dateP !== 'any') query.set('datePosted', dateP);
      if (prov && prov !== 'all') query.set('provider', prov);

      const response = await fetch(`/api/jobs/search?${query.toString()}`);
      const json = await response.json();

      if (json.success && json.data) {
        const payload: SearchResultPayload = json.data;
        setJobs(payload.jobs || []);
        setTotalResults(payload.total || 0);
        setTotalPages(payload.totalPages || 1);
        setProvidersUsed(payload.providersUsed || []);
        setEngineMeta(json.meta?.engine || 'JobNet Aggregator');
        setRagExecutionTime(undefined);
      } else {
        setJobs([]);
        setTotalResults(0);
      }
    } catch (err) {
      console.error('Failed to fetch jobs from backend proxy:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Execute Groq AI RAG Smart Match
  const executeRagSearch = useCallback(async (prompt: string, filtersObj: Record<string, string | number | boolean | undefined>) => {
    setLoading(true);
    try {
      const response = await fetch('/api/jobs/rag-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, filters: filtersObj })
      });
      const json = await response.json();

      if (json.success && json.data) {
        const payload: SearchResultPayload = json.data;
        setJobs(payload.jobs || []);
        setTotalResults(payload.total || 0);
        setTotalPages(1); // RAG returns top scored matches directly
        setProvidersUsed(payload.providersUsed || []);
        setRagExecutionTime(payload.ragExecutionMs);
        setEngineMeta(json.meta?.engine || 'Groq AI Llama-3.3-70B Engine');
      } else {
        setJobs([]);
        setTotalResults(0);
      }
    } catch (err) {
      console.error('Failed to execute Groq AI RAG match:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Hydrate standard search on filter modifications when in standard mode
  useEffect(() => {
    if (searchMode === 'standard') {
      executeStandardSearch(keyword, location, remoteOnly, employmentType, experience, minSalary, datePosted, provider, currentPage);
    } else if (searchMode === 'rag' && lastRagPrompt) {
      const filterArgs = {
        remote: remoteOnly,
        employmentType,
        experience: experience === 'any' ? undefined : experience,
        minSalary: minSalary > 0 ? minSalary : undefined,
        datePosted: datePosted === 'any' ? undefined : datePosted,
        provider: provider === 'all' ? undefined : provider
      };
      executeRagSearch(lastRagPrompt, filterArgs);
    }
  }, [executeStandardSearch, executeRagSearch, searchMode, keyword, location, remoteOnly, employmentType, experience, minSalary, datePosted, provider, currentPage, lastRagPrompt]);

  const handleHeroStandardSearch = (kw: string, loc: string, rem: boolean) => {
    setKeyword(kw);
    setLocation(loc);
    setRemoteOnly(rem);
    setCurrentPage(1);
    setSearchMode('standard');
  };

  const handleHeroRagSearch = (prompt: string) => {
    setLastRagPrompt(prompt);
    setSearchMode('rag');
    setCurrentPage(1);
    const filterArgs = {
      remote: remoteOnly,
      employmentType,
      experience: experience === 'any' ? undefined : experience,
      minSalary: minSalary > 0 ? minSalary : undefined,
      datePosted: datePosted === 'any' ? undefined : datePosted,
      provider: provider === 'all' ? undefined : provider
    };
    executeRagSearch(prompt, filterArgs);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setLocation('');
    setRemoteOnly(false);
    setEmploymentType('');
    setExperience('any');
    setMinSalary(0);
    setDatePosted('any');
    setProvider('all');
    setCurrentPage(1);
    setSearchMode('standard');
    setLastRagPrompt('');
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#0e0918]">
      <Navbar onOpenHealthModal={() => setHealthModalOpen(true)} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-20">
        {/* Top Hero Banner */}
        <SearchHero
          initialKeyword={keyword}
          initialLocation={location}
          onStandardSearch={handleHeroStandardSearch}
          onRagSearch={handleHeroRagSearch}
          isLoading={loading}
          activeMode={searchMode}
          onSwitchMode={(m) => { setSearchMode(m); setCurrentPage(1); }}
        />

        {/* Active Engine Status Ribbon */}
        <div className="w-full bg-purple-950/40 p-3 rounded-xl border border-purple-500/30 flex items-center justify-between text-xs sm:text-sm font-medium text-gray-300 px-4 shadow-sm">
          <div className="flex items-center gap-2">
            {searchMode === 'rag' ? (
              <Bot className="w-5 h-5 text-amber-300 animate-pulse" />
            ) : (
              <Zap className="w-5 h-5 text-purple-400" />
            )}
            <span>Active Discovery Engine: <strong className="text-white font-mono">{engineMeta}</strong></span>
          </div>
          {typeof ragExecutionTime === 'number' && (
            <span className="bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40 font-mono text-xs font-bold">
              ⚡ AI Inference: {ragExecutionTime}ms
            </span>
          )}
        </div>

        {/* Dashboard Grid Content */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Advanced Filter Sidebar */}
          <FilterSidebar
            remoteOnly={remoteOnly}
            onToggleRemote={(val) => { setRemoteOnly(val); setCurrentPage(1); }}
            selectedEmployment={employmentType}
            onSelectEmployment={(val) => { setEmploymentType(val); setCurrentPage(1); }}
            selectedExperience={experience}
            onSelectExperience={(val) => { setExperience(val); setCurrentPage(1); }}
            selectedMinSalary={minSalary}
            onSelectMinSalary={(val) => { setMinSalary(val); setCurrentPage(1); }}
            selectedDatePosted={datePosted}
            onSelectDatePosted={(val) => { setDatePosted(val); setCurrentPage(1); }}
            selectedProvider={provider}
            onSelectProvider={(val) => { setProvider(val); setCurrentPage(1); }}
            onReset={handleResetFilters}
            totalResults={totalResults}
            providersCount={providersUsed.length || 4}
            isRagMode={searchMode === 'rag'}
          />

          {/* Listings Display Grid */}
          <section className="flex-1 w-full space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/30 text-xs sm:text-sm text-gray-300">
              <span className="font-semibold text-white flex items-center gap-1.5">
                {searchMode === 'rag' ? <Sparkles className="w-4 h-4 text-purple-400" /> : null}
                Showing <strong className="text-purple-300 font-extrabold">{jobs.length}</strong> {searchMode === 'rag' ? 'top compatibility matches' : `listings on Page ${currentPage} of ${totalPages}`}
              </span>
              {providersUsed.length > 0 && (
                <span className="hidden sm:inline-block bg-purple-950/50 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 text-[11px] font-mono">
                  ⚡ Feeds: {providersUsed.join(', ')}
                </span>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[...Array(6)].map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {jobs.map(job => (
                    <JobCard key={job.id} job={job} onSelect={(selected) => setSelectedJob(selected)} />
                  ))}
                </div>

                {/* Pagination bar (Only shown in standard mode when totalPages > 1) */}
                {searchMode === 'standard' && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-8">
                    <Button
                      variant="secondary"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <span className="text-sm font-semibold text-white bg-purple-950/60 px-4 py-2 rounded-xl border border-purple-500/30">
                      Page {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-panel py-16 px-6 text-center rounded-2xl border border-purple-900/40 space-y-4 max-w-lg mx-auto my-12">
                <div className="w-12 h-12 rounded-2xl bg-purple-950/80 text-purple-400 mx-auto flex items-center justify-center border border-purple-500/30">
                  <Inbox className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">No Matching Vacancies Found</h3>
                <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto">
                  We evaluated across our primary global feeds and AI RAG vectors, but found zero results matching your strict filtering thresholds.
                </p>
                <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2 font-semibold">
                  Reset Search Criteria
                </Button>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />

      {/* Modals */}
      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      <ProviderHealthModal isOpen={healthModalOpen} onClose={() => setHealthModalOpen(false)} />
    </div>
  );
}
