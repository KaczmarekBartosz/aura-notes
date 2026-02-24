import * as React from 'react';
import { cn } from '@/lib/utils';

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-zinc-200 bg-white/80 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300',
        className,
      )}
      {...props}
    />
  );
}
