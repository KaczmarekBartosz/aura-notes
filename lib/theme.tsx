'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import {
  type ThemeMode,
  type ThemeContextValue,
  THEME_STORAGE_KEY,
  THEME_CLASSNAMES,
  GLASS_THEME_IDS,
  supportsBackdropFilter,
  prefersReducedMotion,
  getNextTheme,
  getThemeMeta,
  isGlassTheme,
  isValidTheme,
} from '@/types/theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);
const GLASS_THEME_CLASS_SELECTORS = GLASS_THEME_IDS.map((id) => `.${THEME_CLASSNAMES[id]}`).join(', ');

const THEME_DEFAULT_MIGRATION_KEY = 'aura-theme-default-v3-migrated';

/** Get initial theme from localStorage or default to crystal-line */
function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'crystal-line';
  
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'crystalline') {
      return 'crystal-line';
    }
    // One-time migration from old default to new default.
    // If user explicitly sets air-power later, we respect it.
    if (saved === 'air-power') {
      const migrated = localStorage.getItem(THEME_DEFAULT_MIGRATION_KEY);
      if (!migrated) {
        localStorage.setItem(THEME_DEFAULT_MIGRATION_KEY, '1');
        localStorage.setItem(THEME_STORAGE_KEY, 'crystal-line');
        return 'crystal-line';
      }
    }
    if (isValidTheme(saved)) {
      return saved;
    }
  } catch {
    // localStorage not available
  }
  
  return 'crystal-line';
}

interface ThemeProviderProps {
  children: ReactNode;
  /** Default theme if no saved preference */
  defaultTheme?: ThemeMode;
  /** Disable animations for reduced motion */
  respectReducedMotion?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = 'crystal-line',
  respectReducedMotion = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    typeof window === 'undefined' ? defaultTheme : getInitialTheme()
  );
  const [hasBackdropSupport] = useState(() => supportsBackdropFilter());

  // Apply theme classes to document
  const applyThemeClasses = useCallback((newTheme: ThemeMode) => {
    const html = document.documentElement;
    const body = document.body;
    
    // Remove all theme classes
    Object.values(THEME_CLASSNAMES).forEach(cls => {
      html.classList.remove(cls);
      body?.classList.remove(cls);
    });
    
    // Add new theme class
    html.classList.add(THEME_CLASSNAMES[newTheme]);
    body?.classList.add(THEME_CLASSNAMES[newTheme]);
    html.dataset.theme = newTheme;
    if (body) {
      body.dataset.theme = newTheme;
    }
    
    const meta = getThemeMeta(newTheme);

    if (meta.appearance === 'dark') {
      html.classList.add('dark');
    } else if (meta.appearance === 'light') {
      html.classList.remove('dark');
    } else {

      // brutalist - keep existing dark/light behavior
      // Check if user previously had dark mode
      const savedLegacy = localStorage.getItem('aura-theme') as 'light' | 'dark' | null;
      if (savedLegacy === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }, []);

  useEffect(() => {
    applyThemeClasses(theme);

    const html = document.documentElement;
    const body = document.body;
    const motionPreference = respectReducedMotion ? 'system' : 'full';
    html.dataset.motionPreference = motionPreference;
    if (body) {
      body.dataset.motionPreference = motionPreference;
    }

    return () => {
      html.removeAttribute('data-motion-preference');
      body?.removeAttribute('data-motion-preference');
    };
  }, [applyThemeClasses, respectReducedMotion, theme]);

  // Set theme with persistence
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // localStorage not available
    }
  }, []);

  // Cycle through themes
  const cycleTheme = useCallback(() => {
    setTheme(getNextTheme(theme));
  }, [theme, setTheme]);

  // Computed values
  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    setTheme,
    isGlass: isGlassTheme(theme),
    isGlassLight: theme === 'glass-light',
    isGlassDark: theme === 'glass-dark',
    isBrutalist: theme === 'brutalist',
    isAirPower: theme === 'air-power',
    isCrystalLine: theme === 'crystal-line',
    isCrystalline: theme === 'crystal-line',
    cycleTheme,
  }), [theme, setTheme, cycleTheme]);


  return (
    <ThemeContext.Provider value={value}>
      {children}
      {/* CSS fallback for no backdrop-filter support */}
      {!hasBackdropSupport && (
        <style>{
          `
          ${GLASS_THEME_CLASS_SELECTORS} {
            --glass-backdrop: transparent !important;
            --glass-bg-fallback: var(--background) !important;
          }
          .glass-card, .glass-button, .glass-nav {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
          `
        }</style>
      )}

    </ThemeContext.Provider>
  );
}

/** Hook to access theme context */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

/** Hook for reduced motion preference */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => prefersReducedMotion());
  
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }

    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, []);
  
  return reduced;
}
