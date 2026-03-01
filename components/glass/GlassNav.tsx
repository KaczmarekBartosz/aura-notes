'use client';

import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { type ReactNode } from 'react';

interface GlassNavProps {
  children: ReactNode;
  className?: string;
  /** Position variant */
  position?: 'top' | 'bottom' | 'floating';
  /** Full width or contained */
  width?: 'full' | 'auto' | 'contained';
  /** Show shadow */
  shadow?: boolean;
}

/**
 * GlassNav - Floating navigation with glassmorphism
 * 
 * Creates a blurred navigation bar that floats above content.
 * Automatically adapts to brutalist or glass theme.
 */
export function GlassNav({
  children,
  className,
  position = 'floating',
  width = 'contained',
  shadow = true,
}: GlassNavProps) {
  const { isGlass } = useTheme();

  // Position styles
  const positionStyles = {
    top: 'fixed top-0 left-0 right-0 z-50 rounded-none',
    bottom: 'fixed bottom-0 left-0 right-0 z-50 rounded-none',
    floating: 'fixed left-1/2 -translate-x-1/2 z-50 rounded-full',
  };

  // Width styles
  const widthStyles = {
    full: 'w-full',
    auto: 'w-auto',
    contained: position === 'floating' ? 'max-w-2xl w-[calc(100%-2rem)]' : 'max-w-4xl mx-auto',
  };

  // Brutalist fallback
  if (!isGlass) {
    return (
      <nav
        className={cn(
          // Position
          positionStyles[position],
          // Width
          widthStyles[width],
          // Brutalist styling
          'bg-background border-4 border-foreground',
          position === 'floating' && 'rounded-none px-6 py-3',
          position !== 'floating' && 'px-4 py-3',
          shadow && 'shadow-[8px_8px_0_var(--foreground)]',
          className
        )}
      >
        {children}
      </nav>
    );
  }

  // Glass styling
  return (
    <nav
      className={cn(
        // Base glass styles
        'glass-nav',
        // Position
        positionStyles[position],
        // Width
        widthStyles[width],
        // Spacing
        position === 'floating' ? 'px-6 py-3' : 'px-4 py-3',
        // Margin for floating nav pill
        position === 'floating' && 'mb-4',
        className
      )}
    >
      {children}
    </nav>
  );
}

/**
 * GlassNavItem - Individual nav item
 */
interface GlassNavItemProps {
  children: ReactNode;
  className?: string;
  /** Is currently active */
  active?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Render as anchor if href provided */
  href?: string;
}

export function GlassNavItem({
  children,
  className,
  active = false,
  onClick,
  href,
}: GlassNavItemProps) {
  const { isGlass } = useTheme();

  const baseClasses = cn(
    'inline-flex items-center gap-2 px-4 py-2 font-semibold text-sm',
    'transition-all duration-200',
    isGlass ? 'rounded-full' : 'rounded-none',
    className
  );

  const brutalistClasses = cn(
    baseClasses,
    active
      ? 'bg-foreground text-background'
      : 'hover:bg-foreground hover:text-background text-foreground'
  );

  const glassClasses = cn(
    baseClasses,
    active
      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
      : 'hover:bg-[var(--glass-bg-hover)] text-[var(--foreground)]'
  );

  const Component = href ? 'a' : 'button';

  return (
    <Component
      href={href}
      onClick={onClick}
      className={isGlass ? glassClasses : brutalistClasses}
    >
      {children}
    </Component>
  );
}

/**
 * GlassNavGroup - Group nav items together
 */
export function GlassNavGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {children}
    </div>
  );
}

/**
 * GlassNavDivider - Visual separator between groups
 */
export function GlassNavDivider({ className }: { className?: string }) {
  const { isGlass } = useTheme();

  return (
    <div
      className={cn(
        'w-px h-6 mx-2',
        isGlass
          ? 'bg-[var(--glass-border)]'
          : 'bg-foreground/20',
        className
      )}
    />
  );
}

/**
 * GlassBottomNav - Mobile-optimized bottom navigation
 */
interface GlassBottomNavProps {
  items: {
    icon: ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
    badge?: number;
  }[];
  className?: string;
}

export function GlassBottomNav({ items, className }: GlassBottomNavProps) {
  const { isGlass } = useTheme();

  return (
    <GlassNav
      position="bottom"
      width="full"
      className={cn('pb-safe px-safe', className)}
    >
      <div className="flex items-center justify-around w-full max-w-lg mx-auto">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-2 px-4 min-w-[64px]',
              'transition-all duration-200',
              isGlass ? 'rounded-2xl' : 'rounded-none',
              isGlass
                ? item.active
                  ? 'text-[var(--primary)] bg-[var(--glass-bg-hover)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                : item.active
                  ? 'bg-foreground text-background'
                  : 'text-foreground hover:bg-foreground/10'
            )}
          >
            <div className="relative">
              <span className={isGlass ? 'text-xl' : 'text-lg'}>{item.icon}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={cn(
                    'absolute -top-1 -right-2 min-w-[18px] h-[18px]',
                    'flex items-center justify-center',
                    'text-[10px] font-bold rounded-full',
                    isGlass
                      ? 'bg-[var(--accent-coral)] text-white'
                      : 'bg-foreground text-background'
                  )}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </GlassNav>
  );
}
