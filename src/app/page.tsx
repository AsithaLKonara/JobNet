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
import { NormalizedJob, SearchResultPayload } from '@/types/job';
import { Button } from '@/components/ui/button';
import { Inbox, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage() {
  // Application State
  const [jobs, setJobs] = useState<NormalizedJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedJob, setSelectedJob] = useState<NormalizedJob | null>(null);
  const [healthModalOpen, setHealthModalOpen] = useState<boolean>(false);

  // Search Filter State
  const [keyword, setKeyword] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [remoteOnly, setRemoteOnly] = useState<boolean>(false);
  const [employmentType, setEmploymentType] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Result Metrics
  const [totalResults, setTotalResults] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [providersUsed, setProvidersUsed] = useState<string[]>([]);

  const executeSearch = useCallback(async (kw: string, loc: string, rem: boolean, emp: string, page: number) => {
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

      const response = await fetch(`/api/jobs/search?${query.toString()}`);
      const json = await response.json();

      if (json.success && json.data) {
        const payload: SearchResultPayload = json.data;
        setJobs(payload.jobs || []);
        setTotalResults(payload.total || 0);
        setTotalPages(payload.totalPages || 1);
        setProvidersUsed(payload.providersUsed || []);
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

  // Initial dashboard hydration
  useEffect(() => {
    executeSearch(keyword, location, remoteOnly, employmentType, currentPage);
  }, [executeSearch, keyword, location, remoteOnly, employmentType, currentPage]);

  const handleHeroSearch = (kw: string, loc: string, rem: boolean) => {
    setKeyword(kw);
    setLocation(loc);
    setRemoteOnly(rem);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setLocation('');
    setRemoteOnly(false);
    setEmploymentType('');
    setCurrentPage(1);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#0e0918]">
      <Navbar onOpenHealthModal={() => setHealthModalOpen(true)} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20">
        {/* Top Hero Banner */}
        <SearchHero
          initialKeyword={keyword}
          initialLocation={location}
          onSearch={handleHeroSearch}
          isLoading={loading}
        />

        {/* Dashboard Grid Content */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Filter Sidebar */}
          <FilterSidebar
            remoteOnly={remoteOnly}
            onToggleRemote={(val) => { setRemoteOnly(val); setCurrentPage(1); }}
            selectedEmployment={employmentType}
            onSelectEmployment={(val) => { setEmploymentType(val); setCurrentPage(1); }}
            onReset={handleResetFilters}
            totalResults={totalResults}
            providersCount={providersUsed.length || 4}
          />

          {/* Listings Display Grid */}
          <section className="flex-1 w-full space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/30 text-xs sm:text-sm text-gray-400">
              <span className="font-semibold text-white">
                Showing <strong className="text-purple-300">{jobs.length}</strong> listings on Page {currentPage} of {totalPages}
              </span>
              {providersUsed.length > 0 && (
                <span className="hidden sm:inline-block bg-purple-950/50 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 text-[11px]">
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

                {/* Pagination bar */}
                {totalPages > 1 && (
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
                  We scanned across our primary real-time provider networks and Postgres cache, but found zero results matching your strict parameters.
                </p>
                <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-2">
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
