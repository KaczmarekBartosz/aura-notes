/**
 * Theme type definitions for Aura Notes
 * Supports multi-theme system: brutalist (default), glass-light, glass-dark, air-power, crystalline
 */

export type ThemeMode = 'brutalist' | 'glass-light' | 'glass-dark' | 'air-power' | 'crystalline';

export interface ThemeContextValue {
  /** Current active theme */
  theme: ThemeMode;
  /** Set theme directly */
  setTheme: (theme: ThemeMode) => void;
  /** Check if current theme is a glass variant */
  isGlass: boolean;
  /** Check if current theme is glass-light */
  isGlassLight: boolean;
  /** Check if current theme is glass-dark */
  isGlassDark: boolean;
  /** Check if current theme is brutalist */
  isBrutalist: boolean;
  /** Check if current theme is air-power */
  isAirPower: boolean;
  /** Check if current theme is crystalline */
  isCrystalline: boolean;
  /** Cycle to next theme */
  cycleTheme: () => void;
}

/** Theme metadata for UI display */
export interface ThemeMeta {
  id: ThemeMode;
  label: string;
  description: string;
  preview: {
    bg: string;
    card: string;
    accent: string;
  };
}

/** Theme configuration */
export const THEMES: ThemeMeta[] = [
  {
    id: 'brutalist',
    label: 'Brutalist',
    description: 'Klasyczny, surowy styl z ostrymi krawędziami',
    preview: {
      bg: '#f2f3f7',
      card: '#ffffff',
      accent: '#2a2b33',
    },
  },
  {
    id: 'glass-light',
    label: 'Liquid Glass Light',
    description: 'iOS 26 glassmorphism - jasny, płynny szkło',
    preview: {
      bg: 'linear-gradient(135deg, #e8f4f8 0%, #f5f0f8 50%, #f8f0e8 100%)',
      card: 'rgba(255,255,255,0.7)',
      accent: '#5c9aff',
    },
  },
  {
    id: 'glass-dark',
    label: 'Liquid Glass Dark',
    description: 'iOS 26 glassmorphism - ciemny, głęboki szkło',
    preview: {
      bg: 'linear-gradient(135deg, #0f1729 0%, #1a1025 50%, #0d1f1f 100%)',
      card: 'rgba(30,30,45,0.6)',
      accent: '#7ee8fa',
    },
  },
  {
    id: 'air-power',
    label: 'Air Power',
    description: 'Lekki, powietrzny styl z niebieskimi akcentami',
    preview: {
      bg: 'linear-gradient(180deg, #A5C3E8 0%, #CBDCF0 40%, #E8EDF3 100%)',
      card: 'rgba(255,255,255,0.35)',
      accent: '#3C6EA0',
    },
  },
  {
    id: 'crystalline',
    label: 'Crystalline',
    description: 'Ultra-realistyczne szkło optyczne z efektami pryzmatu',
    preview: {
      bg: 'radial-gradient(at 0% 0%, rgba(200, 220, 255, 0.4) 0px, transparent 50%)',
      card: 'rgba(255, 255, 255, 0.65)',
      accent: '#0f172a',
    },
  },
];

/** LocalStorage key for theme persistence */
export const THEME_STORAGE_KEY = 'aura-theme-v2';

/** CSS class names applied to document element */
export const THEME_CLASSNAMES: Record<ThemeMode, string> = {
  'brutalist': 'theme-brutalist',
  'glass-light': 'theme-glass-light',
  'glass-dark': 'theme-glass-dark',
  'air-power': 'theme-air-power',
  'crystalline': 'theme-crystalline',
};

/** Get next theme in cycle order */
export function getNextTheme(current: ThemeMode): ThemeMode {
  const currentIndex = THEMES.findIndex(t => t.id === current);
  if (currentIndex === -1) return THEMES[0].id;
  const nextIndex = (currentIndex + 1) % THEMES.length;
  return THEMES[nextIndex].id;
}

/** Validate if value is a supported theme */
export function isValidTheme(value: string | null | undefined): value is ThemeMode {
  if (!value) return false;
  return THEMES.some(t => t.id === value);
}

/** Check if browser supports backdrop-filter */
export function supportsBackdropFilter(): boolean {
  if (typeof window === 'undefined') return true; // SSR default
  return CSS.supports('backdrop-filter', 'blur(10px)') ||
         CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
}

/** Reduced motion preference */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
