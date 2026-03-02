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
  supportsBackdropFilter,
  prefersReducedMotion,
  getNextTheme,
  isValidTheme,
} from '@/types/theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Get initial theme from localStorage or default to air-power */
function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'air-power';
  
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (isValidTheme(saved)) {
      return saved;
    }
  } catch {
    // localStorage not available
  }
  
  return 'air-power';
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
  defaultTheme = 'air-power',
  respectReducedMotion = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);
  const [hasBackdropSupport, setHasBackdropSupport] = useState(true);

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
    
    // Handle dark mode for glass-dark
    if (newTheme === 'glass-dark') {
      html.classList.add('dark');
    } else if (newTheme === 'glass-light' || newTheme === 'air-power' || newTheme === 'crystalline') {
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

  // Initialize theme on mount
  useEffect(() => {
    setHasBackdropSupport(supportsBackdropFilter());

    const initial = getInitialTheme();
    setThemeState(initial);
    applyThemeClasses(initial);
  }, [applyThemeClasses]);

  // Set theme with persistence
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // localStorage not available
    }
    
    applyThemeClasses(newTheme);
  }, [applyThemeClasses]);

  // Cycle through themes
  const cycleTheme = useCallback(() => {
    setTheme(getNextTheme(theme));
  }, [theme, setTheme]);

  // Computed values
  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    setTheme,
    isGlass: theme === 'glass-light' || theme === 'glass-dark' || theme === 'air-power' || theme === 'crystalline',
    isGlassLight: theme === 'glass-light',
    isGlassDark: theme === 'glass-dark',
    isBrutalist: theme === 'brutalist',
    isAirPower: theme === 'air-power',
    isCrystalline: theme === 'crystalline',
    cycleTheme,
  }), [theme, setTheme, cycleTheme]);


  return (
    <ThemeContext.Provider value={value}>
      {children}
      {/* CSS fallback for no backdrop-filter support */}
      {!hasBackdropSupport && (
        <style>{
          `
          .theme-glass-light, .theme-glass-dark, .theme-air-power, .theme-crystalline {
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
  const [reduced, setReduced] = useState(false);
  
  useEffect(() => {
    setReduced(prefersReducedMotion());
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return reduced;
}
