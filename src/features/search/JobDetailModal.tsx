'use client';

import React from 'react';
import { X, ExternalLink, Building2, MapPin, DollarSign, Calendar, ShieldCheck, Share2, Sparkles, Tag } from 'lucide-react';
import { NormalizedJob } from '@/types/job';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface JobDetailModalProps {
  job: NormalizedJob | null;
  onClose: () => void;
}

export function JobDetailModal({ job, onClose }: JobDetailModalProps) {
  if (!job) return null;

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div 
        className="glass-panel w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-purple-500/40 bg-[#140c24] shadow-2xl relative overflow-hidden text-left my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Section */}
        <div className="p-6 border-b border-purple-900/50 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-transparent flex items-start justify-between gap-4 relative">
          <div className="space-y-2 max-w-[85%]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> {job.company}
              </span>
              <Badge variant="purple">{job.provider}</Badge>
              {job.remote && <Badge variant="green">Worldwide Remote Option</Badge>}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              {job.title}
            </h2>
            <div className="flex items-center flex-wrap gap-4 text-xs text-gray-300 pt-1">
              <span className="flex items-center gap-1 text-gray-300">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {job.location} ({job.country || 'Global'})
              </span>
              {job.salary?.text && (
                <span className="flex items-center gap-1 font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                  <DollarSign className="w-3.5 h-3.5" /> {job.salary.text}
                </span>
              )}
              <span className="flex items-center gap-1 text-gray-400 font-mono">
                <Calendar className="w-3.5 h-3.5" /> {new Date(job.postedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-gray-300 leading-relaxed font-light flex-1">
          <div className="bg-purple-950/30 p-4 rounded-xl border border-purple-800/30 flex items-center justify-between gap-4">
            <div className="text-xs text-purple-200">
              <span className="font-semibold">Application Protection Notice:</span> You will be securely transitioned directly to the official employer vacancy portal.
            </div>
            <ShieldCheck className="w-6 h-6 text-purple-400 shrink-0" />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-1">
              <Sparkles className="w-4 h-4 text-purple-400" /> Complete Role Specifications & Description
            </h4>
            <div className="whitespace-pre-wrap text-gray-200 text-sm sm:text-base leading-relaxed font-normal selection:bg-purple-600 selection:text-white">
              {job.description}
            </div>
          </div>

          {job.tags && job.tags.length > 0 && (
            <div className="space-y-2 pt-2">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-indigo-400" /> Associated Technologies & Skills
              </h5>
              <div className="flex flex-wrap gap-2">
                {job.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="px-3 py-1 font-mono text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-4 sm:p-6 border-t border-purple-900/50 bg-[#10081d] flex items-center justify-between gap-4 flex-wrap">
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl border border-white/10 transition-colors font-medium"
          >
            <Share2 className="w-3.5 h-3.5" /> Share Listing
          </button>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} size="md">
              Dismiss
            </Button>
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-purple-900/50 transition-all hover:scale-[1.02]"
            >
              Apply at Official Site <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
