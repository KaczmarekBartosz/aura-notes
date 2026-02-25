import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-0 focus-visible:border-primary focus-visible:shadow-[4px_4px_0_var(--primary)] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:translate-y-0 active:translate-x-0 active:shadow-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-foreground hover:text-background border-2 border-transparent hover:border-foreground hover:-translate-y-1 hover:shadow-[4px_4px_0_var(--foreground)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 border-2 border-transparent hover:border-foreground hover:-translate-y-1 hover:shadow-[4px_4px_0_var(--destructive)]",
        outline:
          "border-2 border-foreground bg-transparent hover:bg-foreground hover:text-background hover:-translate-y-1 hover:shadow-[4px_4px_0_var(--foreground)] text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-foreground hover:text-background border-2 border-transparent hover:border-foreground hover:-translate-y-1 hover:shadow-[4px_4px_0_var(--foreground)]",
        ghost:
          "hover:bg-foreground hover:text-background text-foreground transition-all",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2 has-[>svg]:px-4 font-bold uppercase tracking-wider",
        xs: "h-7 gap-1 rounded-none px-3 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3 font-bold uppercase",
        sm: "h-9 rounded-none gap-1.5 px-4 has-[>svg]:px-3 font-bold uppercase",
        lg: "h-14 rounded-none px-8 text-base has-[>svg]:px-5 font-black uppercase text-lg",
        icon: "size-11",
        "icon-xs": "size-7 rounded-none [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 rounded-none",
        "icon-lg": "size-12 rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
