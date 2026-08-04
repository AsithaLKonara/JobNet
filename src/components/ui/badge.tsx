import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'purple' | 'green' | 'blue';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-white/10 text-gray-200 border-transparent hover:bg-white/15',
    outline: 'bg-transparent text-gray-300 border border-purple-500/30 hover:border-purple-400',
    purple: 'bg-purple-900/40 text-purple-200 border border-purple-500/30 font-medium',
    green: 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 font-medium',
    blue: 'bg-sky-900/40 text-sky-300 border border-sky-500/30 font-medium',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
