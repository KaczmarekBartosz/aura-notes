import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-offset-white placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-700',
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
