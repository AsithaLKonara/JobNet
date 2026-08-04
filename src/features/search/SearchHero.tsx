'use client';

import React, { useState } from 'react';
import { Search, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SearchHeroProps {
  initialKeyword?: string;
  initialLocation?: string;
  onSearch: (keyword: string, location: string, remoteOnly: boolean) => void;
  isLoading?: boolean;
}

const QUICK_KEYWORDS = [
  'React', 'Next.js 15', 'TypeScript', 'Python AI', 'Golang', 'Product Manager', 'Remote DevOps'
];

const POPULAR_LOCATIONS = [
  'Worldwide Remote', 'San Francisco', 'Berlin', 'London', 'New York', 'Tokyo'
];

export function SearchHero({ initialKeyword = '', initialLocation = '', onSearch, isLoading = false }: SearchHeroProps) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState(initialLocation);
  const [remoteOnly, setRemoteOnly] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(keyword.trim(), location.trim(), remoteOnly);
  };

  const handleQuickKeyword = (kw: string) => {
    setKeyword(kw);
    onSearch(kw, location, remoteOnly);
  };

  const handleQuickLocation = (loc: string) => {
    const isRem = loc.toLowerCase().includes('remote');
    setLocation(isRem ? '' : loc);
    if (isRem) setRemoteOnly(true);
    onSearch(keyword, isRem ? '' : loc, isRem || remoteOnly);
  };

  return (
    <section className="relative w-full py-12 md:py-20 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Subtle glowing halo orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <Badge variant="purple" className="mb-4 px-4 py-1 text-xs sm:text-sm font-semibold shadow-lg shadow-purple-900/20 border-purple-400/40">
        <Sparkles className="w-4 h-4 mr-1.5 text-amber-300 animate-bounce" />
        Real-Time Multi-Provider Aggregation & Analytics
      </Badge>

      <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.15] mb-4">
        Discover Your Next Big <br />
        <span className="text-gradient">Worldwide Opportunity</span>
      </h1>

      <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mb-8 font-light">
        Seamlessly search across global tech leaders, remote startups, and federal institutions. Ultra-fast caching, zero clutter, 100% verified listings.
      </p>

      {/* Interactive Glassmorphism Search Container */}
      <form
        onSubmit={handleSubmit}
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
            placeholder="City, state, country, or remote..."
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

      {/* Popular Query & Location Badges */}
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
    </section>
  );
}
