'use client';

import { cn } from '@/lib/utils';
import { useTheme, useReducedMotion } from '@/lib/theme';
import { type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** Visual elevation level */
  elevation?: 'low' | 'medium' | 'high';
  /** Hover lift effect */
  hoverLift?: boolean;
  /** Click/tap scale effect */
  pressScale?: boolean;
  /** Additional padding */
  padded?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Click handler */
  onClick?: () => void;
}

/**
 * GlassCard - Frosted glass container component
 * 
 * Renders a card with backdrop blur effect when glass theme is active.
 * Falls back to standard styling for brutalist theme.
 */
export function GlassCard({
  children,
  className,
  elevation = 'medium',
  hoverLift = true,
  pressScale = false,
  padded = true,
  fullWidth = false,
  onClick,
}: GlassCardProps) {
  const { isGlass } = useTheme();
  const reducedMotion = useReducedMotion();

  // Brutalist fallback styles
  if (!isGlass) {
    return (
      <div
        className={cn(
          'bg-card border-4 border-foreground shadow-[8px_8px_0_var(--foreground)]',
          hoverLift && 'hover:shadow-[12px_12px_0_var(--foreground)] hover:-translate-y-1 hover:-translate-x-1',
          pressScale && 'active:scale-[0.98]',
          padded && 'p-4 md:p-6',
          fullWidth && 'w-full',
          'transition-all duration-200',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }

  // Glass styles
  const elevationStyles = {
    low: 'shadow-[0_4px_16px_rgba(31,38,135,0.08)]',
    medium: 'shadow-[0_8px_32px_rgba(31,38,135,0.1)]',
    high: 'shadow-[0_12px_48px_rgba(31,38,135,0.15)]',
  };

  return (
    <div
      className={cn(
        // Base glass styles
        'glass-card relative overflow-hidden',
        // Elevation
        elevationStyles[elevation],
        // Interactive states
        hoverLift && !reducedMotion && 'hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(31,38,135,0.15)]',
        pressScale && 'active:scale-[0.98]',
        // Layout
        padded && 'p-5 md:p-6',
        fullWidth && 'w-full',
        // Interaction
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/**
 * GlassCardHeader - Header section for GlassCard
 */
export function GlassCardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { isGlass } = useTheme();

  return (
    <div
      className={cn(
        isGlass
          ? 'border-b border-[var(--glass-border)] pb-4 mb-4'
          : 'border-b-4 border-foreground pb-4 mb-4',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * GlassCardTitle - Title text for GlassCard
 */
export function GlassCardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { isGlass } = useTheme();

  return (
    <h3
      className={cn(
        isGlass
          ? 'text-xl font-bold tracking-tight text-[var(--foreground)]'
          : 'text-xl font-black uppercase tracking-tight',
        className
      )}
    >
      {children}
    </h3>
  );
}

/**
 * GlassCardContent - Body content for GlassCard
 */
export function GlassCardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('text-[var(--muted-foreground)]', className)}>
      {children}
    </div>
  );
}

/**
 * GlassCardFooter - Footer section for GlassCard
 */
export function GlassCardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { isGlass } = useTheme();

  return (
    <div
      className={cn(
        isGlass
          ? 'border-t border-[var(--glass-border)] pt-4 mt-4'
          : 'border-t-4 border-foreground pt-4 mt-4',
        className
      )}
    >
      {children}
    </div>
  );
}
