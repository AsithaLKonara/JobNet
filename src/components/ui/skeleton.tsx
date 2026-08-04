import * as React from 'react';
import { cn } from '@/components/ui/badge';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-purple-950/40 border border-purple-900/20', className)}
      {...props}
    />
  );
}

export function JobCardSkeleton() {
  return (
    <div className="glass-panel p-6 flex flex-col justify-between h-56 w-full">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-7 w-4/5" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="flex items-center gap-2 pt-4 border-t border-purple-900/30">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  );
}
