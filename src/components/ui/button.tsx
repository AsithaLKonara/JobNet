import * as React from 'react';
import { cn } from '@/components/ui/badge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/40 border border-purple-400/30',
      secondary: 'bg-purple-950/50 hover:bg-purple-900/60 text-purple-200 border border-purple-500/30',
      outline: 'bg-transparent border border-gray-600/60 hover:border-purple-400 hover:text-white text-gray-300',
      ghost: 'bg-transparent hover:bg-white/5 text-gray-300 hover:text-white'
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs rounded-md font-medium',
      md: 'h-10 px-4 py-2 text-sm rounded-lg font-medium',
      lg: 'h-12 px-6 py-3 text-base rounded-xl font-semibold'
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
