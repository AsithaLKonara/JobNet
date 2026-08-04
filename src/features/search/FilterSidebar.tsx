'use client';

import React from 'react';
import { SlidersHorizontal, RotateCcw, CheckCircle2, Globe, Briefcase } from 'lucide-react';

interface FilterSidebarProps {
  remoteOnly: boolean;
  onToggleRemote: (val: boolean) => void;
  selectedEmployment: string;
  onSelectEmployment: (type: string) => void;
  onReset: () => void;
  totalResults: number;
  providersCount: number;
}

export function FilterSidebar({
  remoteOnly,
  onToggleRemote,
  selectedEmployment,
  onSelectEmployment,
  onReset,
  totalResults,
  providersCount
}: FilterSidebarProps) {
  const empTypes = [
    { label: 'All Types', value: '' },
    { label: 'Full-time', value: 'Full-time' },
    { label: 'Contract', value: 'Contract' },
    { label: 'Part-time', value: 'Part-time' }
  ];

  return (
    <aside className="w-full lg:w-72 glass-panel p-5 space-y-6 self-start h-fit border border-purple-500/30">
      <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
        <div className="flex items-center gap-2 text-white font-bold">
          <SlidersHorizontal className="w-4 h-4 text-purple-400" />
          <span>Search Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors font-medium"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Result Metrics Box */}
      <div className="bg-purple-950/30 p-3 rounded-xl border border-purple-800/30 space-y-1.5">
        <div className="text-xs text-gray-400 font-medium">Verified Active Matches</div>
        <div className="text-2xl font-extrabold text-white flex items-baseline gap-2">
          {totalResults.toLocaleString()}
          <span className="text-xs font-normal text-purple-300">from {providersCount} feeds</span>
        </div>
      </div>

      {/* Remote Toggle Option */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-indigo-400" /> Work Flexibility
        </h3>
        <label className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/10 hover:border-purple-500/40 cursor-pointer transition-all">
          <span className="text-sm font-medium text-gray-200">Remote Work Only</span>
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => onToggleRemote(e.target.checked)}
            className="rounded w-4 h-4 text-purple-600 bg-black/60 border-purple-500/50 focus:ring-0"
          />
        </label>
      </div>

      {/* Employment Type Selection */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-purple-400" /> Employment Type
        </h3>
        <div className="space-y-1.5">
          {empTypes.map(item => {
            const active = selectedEmployment === item.value;
            return (
              <button
                key={item.label}
                onClick={() => onSelectEmployment(item.value)}
                type="button"
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                  active 
                    ? 'bg-purple-600/25 border border-purple-500/60 text-white shadow-sm' 
                    : 'bg-black/20 hover:bg-white/5 border border-transparent text-gray-400'
                }`}
              >
                <span>{item.label}</span>
                {active && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-purple-900/30 text-[11px] text-gray-500 font-light leading-relaxed">
        Our deduplication hashing algorithm removes duplicate vacancies across external board networks in real time.
      </div>
    </aside>
  );
}
