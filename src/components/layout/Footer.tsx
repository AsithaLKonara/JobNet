import React from 'react';
import { Globe, Shield, Terminal } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-purple-900/30 bg-[#0a0612]/90 text-gray-400 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Globe className="w-4 h-4 text-purple-400" />
            <span>JobNet Worldwide Platform</span>
          </div>
          <p className="text-xs text-gray-500 max-w-md text-center md:text-left">
            Empowered by real-time aggregated feeds across RemoteOK, USAJOBS, Arbeitnow, and Adzuna with high-speed PostgreSQL query analytics & fallback circuit breaker resilience.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
          <span className="flex items-center gap-1 hover:text-purple-300 transition-colors">
            <Shield className="w-3.5 h-3.5 text-purple-400" /> 100% TOS Compliant Proxy
          </span>
          <span className="flex items-center gap-1 hover:text-purple-300 transition-colors">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Next.js 15 & Prisma 7
          </span>
        </div>

        <div className="text-xs text-gray-500 text-center md:text-right">
          <p>© 2026 JobNet Global Discovery. Built with engineering discipline.</p>
        </div>
      </div>
    </footer>
  );
}
