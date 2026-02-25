import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-11 w-full min-w-0 rounded-none border-2 border-foreground bg-background px-4 py-2 text-base shadow-[4px_4px_0_var(--foreground)] transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-bold disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-bold",
        "focus-visible:border-primary focus-visible:ring-0 focus-visible:-translate-y-1 focus-visible:-translate-x-1 focus-visible:shadow-[8px_8px_0_var(--primary)]",
        "aria-invalid:border-destructive aria-invalid:shadow-[4px_4px_0_var(--destructive)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
