/**
 * Theme type definitions for Aura Notes
 * Single-registry architecture: to add a new theme, update THEME_REGISTRY only.
 */

export type ThemeAppearance = 'light' | 'dark' | 'system';

export interface ThemeMeta<TId extends string = string> {
  id: TId;
  label: string;
  description: string;
  className: string;
  isGlass: boolean;
  appearance: ThemeAppearance;
  preview: {
    bg: string;
    card: string;
    accent: string;
  };
}

const THEME_REGISTRY = [
  {
    id: 'brutalist',
    label: 'Brutalist',
    description: 'Klasyczny, surowy styl z ostrymi krawędziami',
    className: 'theme-brutalist',
    isGlass: false,
    appearance: 'system',
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
    className: 'theme-glass-light',
    isGlass: true,
    appearance: 'light',
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
    className: 'theme-glass-dark',
    isGlass: true,
    appearance: 'dark',
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
    className: 'theme-air-power',
    isGlass: true,
    appearance: 'light',
    preview: {
      bg: 'linear-gradient(180deg, #a5c3e8 0%, #cbdcf0 40%, #e8edf3 100%)',
      card: 'rgba(255,255,255,0.35)',
      accent: '#3c6ea0',
    },
  },
  {
    id: 'crystal-line',
    label: 'Crystal Line',
    description: 'Frezowane szkło optyczne z refrakcją i pryzmatycznym blaskiem',
    className: 'theme-crystal-line',
    isGlass: true,
    appearance: 'light',
    preview: {
      bg: 'radial-gradient(125% 140% at 8% 0%, rgba(126, 197, 255, 0.44) 0%, rgba(198, 173, 255, 0.36) 38%, rgba(244, 253, 255, 0.92) 100%)',
      card: 'rgba(255, 255, 255, 0.44)',
      accent: '#123f7a',
    },
  },
  {
    id: 'obsidian-gold',
    label: 'Obsidian Gold',
    description: 'Luksusowy onyks, grafit i złoto z metalicznym połyskiem',
    className: 'theme-obsidian-gold',
    isGlass: true,
    appearance: 'dark',
    preview: {
      bg: 'linear-gradient(145deg, #050505 0%, #171717 42%, #2b2516 100%)',
      card: 'rgba(22, 20, 15, 0.62)',
      accent: '#d9b66c',
    },
  },
] as const satisfies readonly ThemeMeta[];

export type ThemeMode = (typeof THEME_REGISTRY)[number]['id'];
export type ThemeMetadata = (typeof THEME_REGISTRY)[number];

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
  /** Check if current theme is crystal-line */
  isCrystalLine: boolean;
  /** Backward compatibility alias for historical "crystalline" naming */
  isCrystalline: boolean;
  /** Cycle to next theme */
  cycleTheme: () => void;
}

/** Theme configuration for UI display and runtime behavior */
export const THEMES = THEME_REGISTRY;

/** LocalStorage key for theme persistence */
export const THEME_STORAGE_KEY = 'aura-theme-v2';

/** Fast metadata lookup by id */
export const THEME_METADATA_BY_ID = Object.fromEntries(
  THEMES.map((theme) => [theme.id, theme] as const)
) as Record<ThemeMode, ThemeMetadata>;

/** CSS class names applied to document element */
export const THEME_CLASSNAMES = Object.fromEntries(
  THEMES.map((theme) => [theme.id, theme.className] as const)
) as Record<ThemeMode, string>;

/** Theme ids that should be rendered as glass */
export const GLASS_THEME_IDS = THEMES.filter((theme) => theme.isGlass).map((theme) => theme.id) as ThemeMode[];

/** Get metadata for a specific theme id */
export function getThemeMeta(theme: ThemeMode): ThemeMetadata {
  return THEME_METADATA_BY_ID[theme];
}

/** Get next theme in cycle order */
export function getNextTheme(current: ThemeMode): ThemeMode {
  const currentIndex = THEMES.findIndex((t) => t.id === current);
  if (currentIndex === -1) return THEMES[0].id;
  const nextIndex = (currentIndex + 1) % THEMES.length;
  return THEMES[nextIndex].id;
}

/** Validate if value is a supported theme */
export function isValidTheme(value: string | null | undefined): value is ThemeMode {
  if (!value) return false;
  return Object.hasOwn(THEME_METADATA_BY_ID, value);
}

/** Check if a theme is a glass variant */
export function isGlassTheme(theme: ThemeMode): boolean {
  return THEME_METADATA_BY_ID[theme].isGlass;
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
