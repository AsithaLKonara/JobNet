'use client';

import React, { useState } from 'react';
import { Search, MapPin, Sparkles, Zap, Bot, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SearchHeroProps {
  initialKeyword?: string;
  initialLocation?: string;
  onStandardSearch: (keyword: string, location: string, remoteOnly: boolean) => void;
  onRagSearch: (prompt: string) => void;
  isLoading?: boolean;
  activeMode: 'standard' | 'rag';
  onSwitchMode: (mode: 'standard' | 'rag') => void;
}

const QUICK_KEYWORDS = [
  'React', 'Next.js 15', 'TypeScript', 'Python AI', 'Golang', 'Product Manager', 'Remote DevOps'
];

const POPULAR_LOCATIONS = [
  'Worldwide Remote', 'San Francisco', 'Berlin', 'London', 'New York', 'Tokyo'
];

const SAMPLE_PROMPTS = [
  "Senior Full Stack Engineer with 6+ years experience in Next.js 15, React, and TypeScript. Looking for a fully remote opportunity at a global startup paying over $130,000.",
  "AI & Machine Learning developer specialized in Python, PyTorch, and LLM orchestration (RAG, Groq, LangChain). Seeking a fast-paced role in the US or Europe.",
  "Product Manager and Agile Lead with extensive background in SaaS and distributed cloud architectures. Looking for executive or team leadership positions."
];

export function SearchHero({
  initialKeyword = '',
  initialLocation = '',
  onStandardSearch,
  onRagSearch,
  isLoading = false,
  activeMode,
  onSwitchMode
}: SearchHeroProps) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState(initialLocation);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [ragPrompt, setRagPrompt] = useState('');

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStandardSearch(keyword.trim(), location.trim(), remoteOnly);
  };

  const handleRagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragPrompt.trim()) {
      alert('Please enter a natural language career objective or paste your CV text.');
      return;
    }
    onRagSearch(ragPrompt.trim());
  };

  const handleQuickKeyword = (kw: string) => {
    setKeyword(kw);
    if (activeMode === 'rag') onSwitchMode('standard');
    onStandardSearch(kw, location, remoteOnly);
  };

  const handleQuickLocation = (loc: string) => {
    const isRem = loc.toLowerCase().includes('remote');
    setLocation(isRem ? '' : loc);
    if (isRem) setRemoteOnly(true);
    if (activeMode === 'rag') onSwitchMode('standard');
    onStandardSearch(keyword, isRem ? '' : loc, isRem || remoteOnly);
  };

  return (
    <section className="relative w-full py-10 md:py-16 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Subtle glowing halo orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[420px] bg-purple-600/15 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-purple-950/60 border border-purple-500/30 mb-6 shadow-xl">
        <button
          onClick={() => onSwitchMode('standard')}
          type="button"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeMode === 'standard'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/50 scale-[1.02]'
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
          Standard Discovery
        </button>
        <button
          onClick={() => onSwitchMode('rag')}
          type="button"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeMode === 'rag'
              ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/50 scale-[1.02] border border-purple-300/40'
              : 'text-purple-300 hover:text-white hover:bg-purple-900/30'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-200 animate-bounce" />
          Groq AI RAG Smart Match
          <Badge variant="purple" className="ml-1 text-[9px] px-1.5 py-0 uppercase bg-black/40 text-purple-200 border-purple-400/30">Llama-3</Badge>
        </button>
      </div>

      {activeMode === 'standard' ? (
        <>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.15] mb-4">
            Discover Your Next Big <br />
            <span className="text-gradient">Worldwide Opportunity</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mb-8 font-light">
            Seamlessly search across global tech leaders, remote startups, and federal institutions. Ultra-fast Postgres caching, zero clutter, 100% verified listings.
          </p>

          <form
            onSubmit={handleStandardSubmit}
            className="w-full max-w-3xl glass-panel p-3 sm:p-4 rounded-2xl flex flex-col md:flex-row items-center gap-3 shadow-2xl border border-purple-500/30 bg-[#161024]/85"
          >
            <div className="flex-1 w-full flex items-center gap-2 bg-black/40 px-3.5 py-2.5 rounded-xl border border-white/10 focus-within:border-purple-500 transition-colors">
              <Search className="w-4 h-4 text-purple-400 shrink-0" />
              <input
                type="text"
                placeholder="Job title, keywords, or company..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
              />
            </div>

            <div className="flex-1 w-full flex items-center gap-2 bg-black/40 px-3.5 py-2.5 rounded-xl border border-white/10 focus-within:border-purple-500 transition-colors">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
              <input
                type="text"
                placeholder="City, country, or remote..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
              <label className="flex items-center gap-2 text-xs text-gray-300 bg-purple-950/50 px-3 py-2.5 rounded-xl border border-purple-500/30 cursor-pointer select-none hover:bg-purple-900/60 transition-colors">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  className="rounded bg-black/50 border-purple-500 text-purple-600 focus:ring-0"
                />
                <span className="font-medium text-white">Remote Only</span>
              </label>

              <Button type="submit" size="lg" disabled={isLoading} className="w-full sm:w-auto font-bold shadow-purple-600/40">
                {isLoading ? 'Searching...' : 'Find Jobs'}
              </Button>
            </div>
          </form>

          {/* Trending Topics & Locations */}
          <div className="mt-6 flex flex-col items-center justify-center gap-2.5 text-xs text-gray-400 w-full max-w-4xl">
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <span className="text-gray-500 font-semibold uppercase tracking-wider text-[10px] mr-1">Trending Topics:</span>
              {QUICK_KEYWORDS.map(kw => (
                <button
                  key={kw}
                  onClick={() => handleQuickKeyword(kw)}
                  type="button"
                  className="bg-white/5 hover:bg-purple-600/20 hover:text-purple-200 text-gray-300 px-2.5 py-1 rounded-full border border-white/10 transition-all text-xs"
                >
                  {kw}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <span className="text-gray-500 font-semibold uppercase tracking-wider text-[10px] mr-1">Top Locations:</span>
              {POPULAR_LOCATIONS.map(loc => (
                <button
                  key={loc}
                  onClick={() => handleQuickLocation(loc)}
                  type="button"
                  className="bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/20 transition-all text-[11px]"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.15] mb-4">
            AI Talent Alignment & <br />
            <span className="text-gradient">CV RAG Matching Engine</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-purple-200 max-w-2xl mb-6 font-light">
            Paste your full CV text or describe your ideal career goal in natural language. Our Groq Llama 3.3 engine evaluates semantic synergy across 4 global feeds instantly.
          </p>

          <form
            onSubmit={handleRagSubmit}
            className="w-full max-w-3xl glass-panel p-5 sm:p-6 rounded-2xl flex flex-col gap-4 shadow-2xl border-2 border-purple-500/50 bg-[#140c24]/95"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span className="flex items-center gap-1.5 font-bold text-purple-300">
                  <Bot className="w-4 h-4 text-purple-400" /> Natural Language & CV Processor
                </span>
                <span className="text-gray-400 font-mono text-[11px]">Supports text up to 5,000 characters</span>
              </div>
              <textarea
                rows={4}
                placeholder="Example: I'm a Senior Staff React & TypeScript Architect with 8 years of scalable UI and system design experience. Looking for a high-paying remote opportunity ($150k+) anywhere worldwide..."
                value={ragPrompt}
                onChange={(e) => setRagPrompt(e.target.value)}
                className="w-full p-4 rounded-xl bg-black/50 border border-purple-500/40 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-400 font-sans leading-relaxed resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-purple-900/40">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1 shrink-0">
                  <FileText className="w-3 h-3 text-indigo-400" /> Sample Prompts:
                </span>
                {SAMPLE_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRagPrompt(p)}
                    className="bg-purple-950/50 hover:bg-purple-800/60 text-purple-300 text-[10px] px-2.5 py-1 rounded-lg border border-purple-500/30 whitespace-nowrap transition-colors"
                  >
                    Sample {idx + 1}
                  </button>
                ))}
              </div>

              <Button type="submit" size="lg" disabled={isLoading} className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 font-extrabold px-8 shadow-purple-600/50">
                <Sparkles className="w-4 h-4 mr-1.5 animate-spin-slow" />
                {isLoading ? 'Running Groq AI Inference...' : 'Analyze & Score Vacancies'}
              </Button>
            </div>
          </form>

          <div className="mt-4 text-xs text-gray-400 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Hybrid TF-IDF Retrieval + Llama-3.3-70B Structured Json Inference Active</span>
          </div>
        </>
      )}
    </section>
  );
}
