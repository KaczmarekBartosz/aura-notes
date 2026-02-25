import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-none border-2 px-3 py-1 text-xs font-black uppercase tracking-wider w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-0 focus-visible:border-primary aria-invalid:border-destructive transition-transform hover:-translate-y-0.5 hover:shadow-[2px_2px_0_var(--foreground)]",
  {
    variants: {
      variant: {
        default: "border-foreground bg-primary text-primary-foreground hover:bg-foreground hover:text-background shadow-[2px_2px_0_var(--foreground)]",
        secondary:
          "border-foreground bg-secondary text-secondary-foreground hover:bg-foreground hover:text-background shadow-[2px_2px_0_var(--foreground)]",
        destructive:
          "border-destructive bg-destructive text-white hover:bg-foreground hover:text-background hover:border-foreground shadow-[2px_2px_0_var(--destructive)]",
        outline:
          "border-foreground text-foreground bg-background shadow-[2px_2px_0_var(--foreground)] hover:bg-foreground hover:text-background",
        ghost: "border-transparent text-foreground hover:bg-foreground hover:text-background",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
