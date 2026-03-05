'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useTheme, useReducedMotion } from '@/lib/theme';
import { GlassCard, GlassCardTitle } from './GlassCard';
import { GlassIconButton } from './GlassButton';
import { THEMES, type ThemeMode, type ThemeMetadata } from '@/types/theme';
import { Palette, Check, Sparkles } from 'lucide-react';

interface ThemeSwitcherProps {
  /** Show as compact button (opens modal) or inline selector */
  variant?: 'compact' | 'inline' | 'preview';
  /** Additional classes */
  className?: string;
  /** Called when theme changes */
  onThemeChange?: (theme: ThemeMode) => void;
}

/**
 * ThemeSwitcher - Beautiful glassmorphic theme picker
 * 
 * Displays available themes with visual previews.
 * Supports compact button, inline selector, or preview cards.
 */
export function ThemeSwitcher({
  variant = 'compact',
  className,
  onThemeChange,
}: ThemeSwitcherProps) {
  const { theme, setTheme, isGlass } = useTheme();
  const reducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const canUseDOM = typeof document !== 'undefined';

  useEffect(() => {
    if (!canUseDOM) return;

    const body = document.body;
    if (isOpen) {
      body.classList.add('theme-picker-open');
    } else {
      body.classList.remove('theme-picker-open');
    }

    return () => {
      body.classList.remove('theme-picker-open');
    };
  }, [canUseDOM, isOpen]);

  const handleThemeChange = useCallback((newTheme: ThemeMode) => {
    // Add transition class for smooth theme switch
    if (!reducedMotion) {
      document.body.classList.add('theme-transitioning');
    }

    setTheme(newTheme);
    onThemeChange?.(newTheme);
    setIsOpen(false);

    // Remove transition class after animation
    if (!reducedMotion) {
      setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
      }, 400);
    }
  }, [setTheme, onThemeChange, reducedMotion]);

  // Compact variant - button that opens picker
  if (variant === 'compact') {
    const pickerOverlay = (
      <div className="fixed inset-0 z-[120]">
        {/* Backdrop */}
        <button
          className={cn(
            'absolute inset-0 transition-colors duration-200',
            isGlass
              ? theme === 'glass-dark'
                ? 'bg-black/60 backdrop-blur-[2px]'
                : 'bg-black/45 backdrop-blur-[2px]'
              : 'bg-black/50'
          )}
          aria-label="Zamknij wybór motywu"
          onClick={() => setIsOpen(false)}
        />

        {/* Picker panel */}
        <div
          className={cn(
            'absolute p-4 max-h-[min(72vh,420px)] overflow-y-auto custom-scrollbar',
            'left-[max(0.75rem,env(safe-area-inset-left))] right-[max(0.75rem,env(safe-area-inset-right))]',
            'top-[calc(env(safe-area-inset-top,0px)+4rem)] sm:left-auto sm:right-[max(0.75rem,env(safe-area-inset-right))] sm:w-[320px]',
            isGlass
              ? 'theme-picker-panel rounded-2xl border border-[var(--glass-border)] bg-[var(--popover)] text-[var(--foreground)] shadow-[0_24px_56px_rgba(8,18,32,0.34)] backdrop-blur-[24px]'
              : 'bg-card border-4 border-foreground shadow-[8px_8px_0_var(--foreground)]',
            !reducedMotion && 'animate-in fade-in duration-200'
          )}
          role="listbox"
          aria-label="Wybierz motyw"
          onClick={(e) => e.stopPropagation()}
        >
          <h4 className={cn(
            'font-bold mb-4',
            isGlass ? 'text-sm text-[var(--muted-foreground)]' : 'text-xs uppercase tracking-wider'
          )}>
            Wybierz motyw
          </h4>

          <div className="space-y-2">
            {THEMES.map((t) => (
              <ThemeOption
                key={t.id}
                theme={t}
                isActive={theme === t.id}
                onSelect={() => handleThemeChange(t.id)}
              />
            ))}
          </div>
        </div>
      </div>
    );

    return (
      <div className={cn('relative', className)}>
        <GlassIconButton
          size="md"
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            '!hover:translate-x-0 !hover:translate-y-0 !active:translate-x-0 !active:translate-y-0 !hover:scale-100 !active:scale-100',
            isOpen && isGlass && 'bg-[var(--glass-bg-hover)]',
            isOpen && !isGlass && 'bg-foreground text-background'
          )}
          aria-label="Zmień motyw"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <Palette className="size-5" />
        </GlassIconButton>

        {/* Theme picker dropdown */}
        {isOpen && canUseDOM && createPortal(pickerOverlay, document.body)}
      </div>
    );
  }

  // Inline variant - horizontal selector
  if (variant === 'inline') {
    return (
      <div className={cn('flex gap-3', className)} role="radiogroup" aria-label="Wybierz motyw">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => handleThemeChange(t.id)}
            role="radio"
            aria-checked={theme === t.id}
            className={cn(
              'relative flex flex-col gap-2 p-3',
              'transition-all duration-200',
              isGlass
                ? cn(
                    'rounded-xl glass-card',
                    theme === t.id && 'ring-2 ring-[var(--accent-teal)]'
                  )
                : cn(
                    'border-4 border-foreground bg-card',
                    theme === t.id && 'ring-2 ring-primary shadow-[4px_4px_0_var(--foreground)]'
                  ),
              'hover:scale-[1.02]'
            )}
          >
            {/* Preview */}
            <div
              className={cn(
                'w-16 h-12 rounded-lg border overflow-hidden',
                isGlass ? 'border-[var(--glass-border)]' : 'border-2 border-foreground'
              )}
              style={{ background: t.preview.bg }}
            >
              <div
                className="w-10 h-6 m-1 rounded"
                style={{ background: t.preview.card }}
              />
            </div>

            {/* Label */}
            <span className={cn(
              'text-xs font-semibold',
              isGlass ? 'text-[var(--foreground)]' : ''
            )}>
              {t.label}
            </span>

            {/* Active indicator */}
            {theme === t.id && (
              <span className={cn(
                'absolute top-1 right-1',
                isGlass
                  ? 'text-[var(--accent-teal)]'
                  : 'text-primary'
              )}>
                <Check className="size-4" />
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Preview variant - larger cards with descriptions
  return (
    <div className={cn('grid gap-4 sm:grid-cols-3', className)}>
      {THEMES.map((t) => (
        <GlassCard
          key={t.id}
          onClick={() => handleThemeChange(t.id)}
          hoverLift
          className={cn(
            'cursor-pointer transition-all',
            theme === t.id && (isGlass
              ? 'ring-2 ring-[var(--accent-teal)]'
              : 'ring-2 ring-primary'
            )
          )}
        >
          {/* Preview area */}
          <div
            className={cn(
              'h-24 rounded-lg mb-4 border overflow-hidden relative',
              isGlass ? 'border-[var(--glass-border)]' : 'border-2 border-foreground'
            )}
            style={{ background: t.preview.bg }}
          >
            {/* Sample glass effect */}
            <div
              className={cn(
                'absolute bottom-3 left-3 right-3 h-10 rounded-lg',
                t.id !== 'brutalist' && 'backdrop-blur-md'
              )}
              style={{
                background: t.preview.card,
                border: t.id !== 'brutalist' ? '1px solid rgba(255,255,255,0.2)' : 'none'
              }}
            />

            {/* Active badge */}
            {theme === t.id && (
              <div className={cn(
                'absolute top-2 right-2',
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold',
                isGlass
                  ? 'bg-[var(--accent-teal)] text-white'
                  : 'bg-primary text-primary-foreground'
              )}>
                <Check className="size-3" />
                Aktywny
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex items-start gap-2">
            {t.id !== 'brutalist' && (
              <Sparkles className={cn(
                'size-4 mt-0.5',
                isGlass ? 'text-[var(--accent-lavender)]' : 'text-primary'
              )} />
            )}
            <div>
              <GlassCardTitle className="text-base">{t.label}</GlassCardTitle>
              <p className={cn(
                'text-sm mt-1',
                isGlass ? 'text-[var(--muted-foreground)]' : 'opacity-70'
              )}>
                {t.description}
              </p>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

/**
 * Individual theme option for dropdown
 */
function ThemeOption({
  theme,
  isActive,
  onSelect,
}: {
  theme: ThemeMetadata;
  isActive: boolean;
  onSelect: () => void;
}) {
  const { isGlass } = useTheme();

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 p-3',
        isGlass ? 'rounded-xl' : 'rounded-none',
        'transition-all duration-200',
        isGlass
          ? cn(
              'hover:bg-[var(--glass-bg-hover)]',
              isActive && 'bg-[var(--glass-bg-hover)] ring-1 ring-[var(--accent-teal)]'
            )
          : cn(
              'hover:bg-muted',
              isActive && 'bg-foreground text-background'
            )
      )}
      role="option"
      aria-selected={isActive}
    >
      {/* Preview thumbnail */}
      <div
        className={cn(
          'w-12 h-10 rounded-lg border flex-shrink-0 overflow-hidden',
          isGlass ? 'border-[var(--glass-border)]' : 'border-2 border-foreground'
        )}
        style={{ background: theme.preview.bg }}
      >
        <div
          className="w-6 h-4 m-1 rounded"
          style={{ background: theme.preview.card }}
        />
      </div>

      {/* Label */}
      <div className="flex-1 text-left">
        <div className={cn(
          'font-semibold text-sm',
          isGlass && !isActive && 'text-[var(--foreground)]'
        )}>
          {theme.label}
        </div>
        <div className={cn(
          'text-xs',
          isGlass
            ? 'text-[var(--muted-foreground)]'
            : isActive ? 'opacity-80' : 'opacity-60'
        )}>
          {theme.description}
        </div>
      </div>

      {/* Checkmark */}
      {isActive && (
        <Check className={cn(
          'size-4',
          isGlass ? 'text-[var(--accent-teal)]' : 'text-primary'
        )} />
      )}
    </button>
  );
}

/**
 * ThemeBadge - Small badge showing current theme
 */
export function ThemeBadge({ className }: { className?: string }) {
  const { theme, isGlass } = useTheme();
  const currentTheme = THEMES.find(t => t.id === theme);

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium',
      isGlass
        ? 'glass-badge'
        : 'border-2 border-foreground bg-card',
      className
    )}>
      <Palette className="size-3" />
      {currentTheme?.label ?? theme}
    </span>
  );
}
