'use client';

import React, { useEffect, useState } from 'react';
import { X, Activity, CheckCircle2, AlertTriangle, RefreshCw, Database, Server, Clock } from 'lucide-react';
import { ProviderHealth } from '@/types/job';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProviderHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HealthPayload {
  status: string;
  latencyMs: number;
  database: { provider: string; status: string };
  providers: ProviderHealth[];
}

export function ProviderHealthModal({ isOpen, onClose }: ProviderHealthModalProps) {
  const [data, setData] = useState<HealthPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchHealth = () => {
    setLoading(true);
    setError(false);
    fetch('/api/health')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl p-6 rounded-2xl border border-purple-500/40 bg-[#160e26] shadow-2xl space-y-6 relative text-left">
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Activity className="w-5 h-5 text-purple-400 animate-spin-slow" />
            <span>Worldwide Network & Database Diagnostics</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3 text-purple-300">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
            <span className="text-sm font-medium">Querying distributed feed latency...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>Could not establish communication with /api/health monitoring service.</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Database & System Status Card */}
            <div className="bg-purple-950/40 p-4 rounded-xl border border-purple-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-6 h-6 text-indigo-400" />
                <div>
                  <div className="text-sm font-bold text-white capitalize">{data?.database.provider}</div>
                  <div className="text-xs text-gray-400">Query Analytics & Fallback Resilience Cache</div>
                </div>
              </div>
              <Badge variant={data?.database.status === 'connected' ? 'green' : 'purple'} className="px-3 py-1 text-xs">
                {data?.database.status === 'connected' ? '● PostgreSQL Active' : '● Degraded / Offline Cache'}
              </Badge>
            </div>

            {/* Provider Matrix Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-purple-400" /> Integrated API Endpoints ({data?.providers.length})
              </h4>
              <div className="divide-y divide-purple-900/30 border border-purple-900/30 rounded-xl overflow-hidden bg-black/30">
                {data?.providers.map((p) => (
                  <div key={p.provider} className="p-3.5 flex items-center justify-between text-sm hover:bg-white/5 transition-colors">
                    <div className="font-semibold text-white flex items-center gap-2 capitalize">
                      {p.status === 'online' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                      <span>{p.provider}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {p.latencyMs}ms
                      </span>
                      <Badge variant={p.status === 'online' ? 'green' : 'purple'} className="w-20 justify-center">
                        {p.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-purple-900/40 text-xs text-gray-400">
          <span>Total Roundtrip Latency: <strong className="text-white font-mono">{data?.latencyMs || 0}ms</strong></span>
          <Button size="sm" variant="secondary" onClick={fetchHealth}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Recheck Feeds
          </Button>
        </div>
      </div>
    </div>
  );
}
