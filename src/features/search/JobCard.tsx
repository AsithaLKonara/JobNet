'use client';

import React from 'react';
import { Building2, MapPin, DollarSign, Clock, ArrowUpRight } from 'lucide-react';
import { NormalizedJob } from '@/types/job';
import { Badge } from '@/components/ui/badge';

interface JobCardProps {
  job: NormalizedJob;
  onSelect: (job: NormalizedJob) => void;
}

export function JobCard({ job, onSelect }: JobCardProps) {
  const isCacheHit = job.provider === 'postgres-cache';
  const providerLabel = isCacheHit ? 'Postgres Cache' : job.provider;

  const getDaysAgo = (dateStr: string) => {
    try {
      const ms = Date.now() - new Date(dateStr).getTime();
      const days = Math.floor(ms / (1000 * 60 * 60 * 24));
      if (days <= 0) return 'Today';
      if (days === 1) return 'Yesterday';
      return `${days} days ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div
      onClick={() => onSelect(job)}
      className="glass-panel p-5 sm:p-6 rounded-2xl flex flex-col justify-between cursor-pointer group hover:bg-purple-950/30 transition-all duration-300 border border-purple-900/40 relative overflow-hidden"
    >
      {/* Top subtle highlight gradient on hover */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="space-y-3">
        {/* Header line with employer & status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 max-w-[75%]">
            <div className="w-9 h-9 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold shrink-0 shadow-inner overflow-hidden">
              {job.companyLogo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-4 h-4 text-purple-400" />
              )}
            </div>
            <div className="truncate">
              <div className="text-xs text-gray-400 font-medium flex items-center gap-1.5 truncate">
                <span className="truncate">{job.company}</span>
                {job.remote && (
                  <Badge variant="purple" className="px-1.5 py-0 text-[10px]">Remote</Badge>
                )}
              </div>
            </div>
          </div>

          <Badge variant={isCacheHit ? 'blue' : 'green'} className="text-[10px] font-mono capitalize shrink-0 shadow-sm">
            {providerLabel}
          </Badge>
        </div>

        {/* Job Title */}
        <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
          {job.title}
        </h3>

        {/* Location & Salary pills */}
        <div className="flex items-center flex-wrap gap-3 text-xs text-gray-300 pt-1">
          <span className="flex items-center gap-1 text-gray-300 bg-black/30 px-2.5 py-1 rounded-md border border-white/5">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate max-w-[150px]">{job.location}</span>
          </span>

          {job.salary?.text && (
            <span className="flex items-center gap-1 text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-500/30 font-semibold">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{job.salary.text}</span>
            </span>
          )}

          <span className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3 h-3 text-gray-500" />
            <span>{getDaysAgo(job.postedAt)}</span>
          </span>
        </div>

        {/* Snippet preview */}
        <p className="text-xs text-gray-400 line-clamp-2 font-light leading-relaxed pt-1">
          {job.description || 'Click to examine complete vacancy details, requirements, and direct application links.'}
        </p>
      </div>

      {/* Footer tags and action link */}
      <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-purple-900/30">
        <div className="flex items-center gap-1.5 flex-wrap overflow-hidden max-w-[70%]">
          {job.tags.slice(0, 3).map(tag => (
            <span key={tag} className="bg-white/5 text-gray-300 px-2 py-0.5 rounded text-[10px] font-mono border border-white/10">
              {tag}
            </span>
          ))}
          {job.tags.length > 3 && (
            <span className="text-gray-500 text-[10px] font-mono">+{job.tags.length - 3}</span>
          )}
        </div>

        <span className="inline-flex items-center text-xs font-semibold text-purple-400 group-hover:text-white transition-colors gap-0.5 shrink-0">
          Inspect <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </div>
  );
}
