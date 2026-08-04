'use client';

import React from 'react';
import { Building2, MapPin, DollarSign, Clock, ArrowUpRight, Sparkles, Award } from 'lucide-react';
import { NormalizedJob } from '@/types/job';
import { Badge } from '@/components/ui/badge';

interface JobCardProps {
  job: NormalizedJob;
  onSelect: (job: NormalizedJob) => void;
}

export function JobCard({ job, onSelect }: JobCardProps) {
  const isCacheHit = job.provider === 'postgres-cache';
  const providerLabel = isCacheHit ? 'Postgres Cache' : job.provider;
  const hasAiScore = typeof job.aiScore === 'number';

  const getDaysAgo = (dateStr: string) => {
    try {
      const ms = Date.now() - new Date(dateStr).getTime();
      const days = Math.floor(ms / (1000 * 60 * 60 * 24));
      if (days <= 0) return 'Today';
      if (days === 1) return 'Yesterday';
      return `${days}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div
      onClick={() => onSelect(job)}
      className={`glass-panel p-5 sm:p-6 rounded-2xl flex flex-col justify-between cursor-pointer group hover:bg-purple-950/35 transition-all duration-300 border relative overflow-hidden ${
        hasAiScore && (job.aiScore || 0) >= 85
          ? 'border-purple-400/60 shadow-lg shadow-purple-900/30 bg-[#19112b]'
          : 'border-purple-900/40'
      }`}
    >
      {/* Top subtle highlight gradient on hover */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="space-y-3">
        {/* Header line with employer & status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 max-w-[70%]">
            <div className="w-9 h-9 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold shrink-0 shadow-inner overflow-hidden">
              {job.companyLogo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-4 h-4 text-purple-400" />
              )}
            </div>
            <div className="truncate">
              <div className="text-xs text-gray-300 font-medium flex items-center gap-1.5 truncate">
                <span className="truncate">{job.company}</span>
                {job.remote && (
                  <Badge variant="purple" className="px-1.5 py-0 text-[9px]">Remote</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {hasAiScore && (
              <Badge variant="green" className="bg-gradient-to-r from-emerald-950 to-purple-950 border-emerald-400/50 text-emerald-300 px-2.5 py-0.5 text-xs font-extrabold shadow-md">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300 animate-bounce" />
                {job.aiScore}% Match
              </Badge>
            )}
            <Badge variant={isCacheHit ? 'blue' : 'outline'} className="text-[10px] font-mono capitalize shrink-0">
              {providerLabel}
            </Badge>
          </div>
        </div>

        {/* Job Title */}
        <h3 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
          {job.title}
        </h3>

        {/* AI Rationale Highlight Box (if evaluated) */}
        {job.aiRationale && (
          <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/30 text-xs text-purple-200 space-y-1 my-2 shadow-inner">
            <div className="flex items-center justify-between font-bold text-[11px] text-amber-300 uppercase tracking-wider">
              <span>⚡ RAG Alignment Diagnostic:</span>
              <span className="text-purple-300 font-mono text-[10px]">{job.aiKeyStrength || 'Synergy Verified'}</span>
            </div>
            <p className="font-light leading-relaxed text-gray-200 line-clamp-2">{job.aiRationale}</p>
          </div>
        )}

        {/* Location, Salary & Seniority pills */}
        <div className="flex items-center flex-wrap gap-2 text-xs text-gray-300 pt-1">
          <span className="flex items-center gap-1 text-gray-300 bg-black/30 px-2.5 py-1 rounded-md border border-white/5">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate max-w-[140px]">{job.location}</span>
          </span>

          {job.salary?.text && (
            <span className="flex items-center gap-1 text-emerald-300 bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-500/30 font-semibold">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{job.salary.text}</span>
            </span>
          )}

          {job.experienceLevel && job.experienceLevel !== 'mid' && (
            <span className="flex items-center gap-1 text-amber-200 bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-500/30 font-medium capitalize">
              <Award className="w-3 h-3 text-amber-400" /> {job.experienceLevel} Level
            </span>
          )}

          <span className="flex items-center gap-1 text-gray-400 ml-auto font-mono text-[11px]">
            <Clock className="w-3 h-3 text-gray-500" />
            <span>{getDaysAgo(job.postedAt)}</span>
          </span>
        </div>

        {/* Snippet preview */}
        {!job.aiRationale && (
          <p className="text-xs text-gray-400 line-clamp-2 font-light leading-relaxed pt-1">
            {job.description || 'Click to examine complete vacancy details, requirements, and direct application links.'}
          </p>
        )}
      </div>

      {/* Footer tags and action link */}
      <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-purple-900/30">
        <div className="flex items-center gap-1.5 flex-wrap overflow-hidden max-w-[70%]">
          {job.tags.slice(0, 3).map(tag => (
            <span key={tag} className="bg-white/5 hover:bg-purple-900/30 text-gray-300 px-2 py-0.5 rounded text-[10px] font-mono border border-white/10 transition-colors">
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
