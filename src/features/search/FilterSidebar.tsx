'use client';

import React from 'react';
import { SlidersHorizontal, RotateCcw, CheckCircle2, Globe, Briefcase, DollarSign, Award, Database } from 'lucide-react';
import { ExperienceLevel } from '@/types/job';

interface FilterSidebarProps {
  remoteOnly: boolean;
  onToggleRemote: (val: boolean) => void;
  selectedEmployment: string;
  onSelectEmployment: (type: string) => void;
  selectedExperience: ExperienceLevel | string;
  onSelectExperience: (level: string) => void;
  selectedMinSalary: number;
  onSelectMinSalary: (val: number) => void;
  selectedDatePosted: string;
  onSelectDatePosted: (val: string) => void;
  selectedProvider: string;
  onSelectProvider: (provider: string) => void;
  onReset: () => void;
  totalResults: number;
  providersCount: number;
  isRagMode?: boolean;
}

export function FilterSidebar({
  remoteOnly,
  onToggleRemote,
  selectedEmployment,
  onSelectEmployment,
  selectedExperience,
  onSelectExperience,
  selectedMinSalary,
  onSelectMinSalary,
  selectedDatePosted,
  onSelectDatePosted,
  selectedProvider,
  onSelectProvider,
  onReset,
  totalResults,
  providersCount,
  isRagMode = false
}: FilterSidebarProps) {
  const empTypes = [
    { label: 'All Types', value: '' },
    { label: 'Full-time', value: 'Full-time' },
    { label: 'Contract', value: 'Contract' },
    { label: 'Part-time', value: 'Part-time' }
  ];

  const expLevels: { label: string; value: string }[] = [
    { label: 'All Seniorities', value: 'any' },
    { label: 'Junior / Entry Level', value: 'junior' },
    { label: 'Mid-Level', value: 'mid' },
    { label: 'Senior & Staff', value: 'senior' },
    { label: 'Executive / Lead', value: 'executive' }
  ];

  const salaryFloors = [
    { label: 'Any Salary', value: 0 },
    { label: '$60k+ / year', value: 60000 },
    { label: '$100k+ / year', value: 100000 },
    { label: '$140k+ / year', value: 140000 },
    { label: '$180k+ / year', value: 180000 }
  ];

  const dateOptions = [
    { label: 'Anytime', value: 'any' },
    { label: 'Past 24 Hours', value: '24h' },
    { label: 'Past 7 Days', value: '7d' },
    { label: 'Past 30 Days', value: '30d' }
  ];

  const feedSources = [
    { label: 'All Feeds (8 Networks + Cache)', value: 'all' },
    { label: 'RemoteOK', value: 'remoteok' },
    { label: 'Findwork (Tech & Dev)', value: 'findwork' },
    { label: 'Jooble (Global)', value: 'jooble' },
    { label: 'Careerjet (Worldwide)', value: 'careerjet' },
    { label: 'Reed.co.uk (UK Market)', value: 'reed' },
    { label: 'USAJOBS (Federal)', value: 'usajobs' },
    { label: 'Arbeitnow (EU/Remote)', value: 'arbeitnow' },
    { label: 'Adzuna Network', value: 'adzuna' },
    { label: 'Postgres Cache', value: 'postgres-cache' }
  ];

  return (
    <aside className="w-full lg:w-72 glass-panel p-5 space-y-6 self-start h-fit border border-purple-500/30">
      <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
        <div className="flex items-center gap-2 text-white font-bold">
          <SlidersHorizontal className="w-4 h-4 text-purple-400" />
          <span>Advanced Filters</span>
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
      <div className="bg-purple-950/40 p-3.5 rounded-xl border border-purple-800/40 space-y-1.5 shadow-inner">
        <div className="text-xs text-gray-300 font-medium">
          {isRagMode ? '✨ RAG Analyzed Vacancies' : 'Verified Active Matches'}
        </div>
        <div className="text-2xl font-extrabold text-white flex items-baseline justify-between">
          <span>{totalResults.toLocaleString()}</span>
          <span className="text-[11px] font-normal text-purple-300 font-mono">from {providersCount} networks</span>
        </div>
      </div>

      {/* Remote Toggle */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
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

      {/* Minimum Salary Floor Selector */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Minimum Salary Floor
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {salaryFloors.map(item => {
            const active = selectedMinSalary === item.value;
            return (
              <button
                key={item.label}
                onClick={() => onSelectMinSalary(item.value)}
                type="button"
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all text-center ${
                  active 
                    ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-200 font-bold shadow-sm' 
                    : 'bg-black/20 hover:bg-white/5 border border-white/10 text-gray-400'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Seniority / Experience Level */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-amber-400" /> Seniority Level
        </h3>
        <div className="space-y-1">
          {expLevels.map(item => {
            const active = (selectedExperience || 'any') === item.value;
            return (
              <button
                key={item.value}
                onClick={() => onSelectExperience(item.value)}
                type="button"
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                  active 
                    ? 'bg-purple-600/30 border border-purple-500/60 text-white shadow-sm font-bold' 
                    : 'bg-black/20 hover:bg-white/5 border border-transparent text-gray-400'
                }`}
              >
                <span>{item.label}</span>
                {active && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Posted Timeframe */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
          Publication Date
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {dateOptions.map(item => {
            const active = (selectedDatePosted || 'any') === item.value;
            return (
              <button
                key={item.value}
                onClick={() => onSelectDatePosted(item.value)}
                type="button"
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all text-center ${
                  active
                    ? 'bg-purple-600/30 border border-purple-500 text-purple-200 font-bold'
                    : 'bg-black/20 hover:bg-white/5 border border-white/10 text-gray-400'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Provider Feed Source */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-purple-400" /> Integrated Feed Source
        </h3>
        <select
          value={selectedProvider || 'all'}
          onChange={(e) => onSelectProvider(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-black/50 border border-purple-500/40 text-gray-200 text-xs font-medium focus:outline-none focus:border-purple-400 transition-colors"
        >
          {feedSources.map(f => (
            <option key={f.value} value={f.value} className="bg-[#140c24] text-white">
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Employment Type Selection */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-purple-400" /> Employment Type
        </h3>
        <div className="space-y-1">
          {empTypes.map(item => {
            const active = selectedEmployment === item.value;
            return (
              <button
                key={item.label}
                onClick={() => onSelectEmployment(item.value)}
                type="button"
                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                  active 
                    ? 'bg-purple-600/30 border border-purple-500/60 text-white shadow-sm font-bold' 
                    : 'bg-black/20 hover:bg-white/5 border border-transparent text-gray-400'
                }`}
              >
                <span>{item.label}</span>
                {active && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-purple-900/30 text-[11px] text-gray-400 font-light leading-relaxed">
        Real-time multi-dimensional vector evaluation over active global feeds & Postgres cache.
      </div>
    </aside>
  );
}
