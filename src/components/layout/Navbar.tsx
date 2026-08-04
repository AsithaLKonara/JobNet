'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Activity, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NavbarProps {
  onOpenHealthModal: () => void;
}

export function Navbar({ onOpenHealthModal }: NavbarProps) {
  const [dbHealthy, setDbHealthy] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setDbHealthy(data.status !== 'unhealthy');
      })
      .catch(() => setDbHealthy(false));
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0e0918]/85 border-b border-purple-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-purple-500/30">
            <Globe className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              Job<span className="text-gradient font-extrabold">Net</span>
              <Badge variant="purple" className="text-[10px] uppercase font-bold tracking-widest px-2 py-0">Worldwide</Badge>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onOpenHealthModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-purple-950/60 border border-purple-500/30 text-purple-200 hover:bg-purple-900/80 transition-all shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
            <span className="font-medium">API Network: Active</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 font-mono bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>Postgres Cache</span>
            <span className={`w-2 h-2 rounded-full ${dbHealthy ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </div>
        </div>
      </div>
    </header>
  );
}
