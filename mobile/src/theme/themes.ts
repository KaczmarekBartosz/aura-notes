export type ThemeMode =
  | "system"
  | "light"
  | "dark"
  | "brutalist"
  | "glass-light"
  | "glass-dark"
  | "air-power"
  | "crystal-line";
export type ThemeAppearance = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export type ThemePalette = {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceElevated: string;
  surfaceOverlay: string;
  border: string;
  borderStrong: string;
  foreground: string;
  muted: string;
  subtle: string;
  primary: string;
  primarySoft: string;
  primaryForeground: string;
  accent: string;
  destructive: string;
  warning: string;
  success: string;
  shadow: string;
  progressTrack: string;
  codeBackground: string;
  codeForeground: string;
  quoteBackground: string;
  quoteBorder: string;
  searchPlaceholder: string;
  tagBackground: string;
  screenGradient: readonly [string, string, ...string[]];
  surfaceGradient: readonly [string, string, ...string[]];
  activeGradient: readonly [string, string, ...string[]];
  orbOne: string;
  orbTwo: string;
  orbThree: string;
};

export type ThemeVisuals = {
  surfaceRadius: number;
  blurIntensity: number;
  heavyBlurIntensity: number;
  surfaceBorderWidth: number;
  pressScale: number;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffsetY: number;
  ambientOverlay: readonly [string, string, ...string[]];
  highlightGradient: readonly [string, string, ...string[]];
  prismGradient: readonly [string, string, ...string[]];
};

export type ThemeDefinition = {
  id: ThemeMode;
  label: string;
  description: string;
  appearance: ThemeAppearance;
  isGlass: boolean;
  preview: {
    bg: string;
    card: string;
    accent: string;
    gradient?: readonly [string, string, ...string[]];
  };
  visuals: ThemeVisuals;
  palettes: {
    light: ThemePalette;
    dark?: ThemePalette;
  };
};

const crystalLight: ThemePalette = {
  background: "#F3F7FF",
  backgroundAlt: "#EEF4FF",
  surface: "rgba(255,255,255,0.30)",
  surfaceElevated: "rgba(255,255,255,0.42)",
  surfaceOverlay: "rgba(255,255,255,0.08)",
  border: "rgba(170,202,240,0.50)",
  borderStrong: "rgba(255,255,255,0.95)",
  foreground: "#071A33",
  muted: "rgba(20,48,80,0.72)",
  subtle: "rgba(20,48,80,0.52)",
  primary: "#17457F",
  primarySoft: "rgba(23,69,127,0.12)",
  primaryForeground: "#FFFFFF",
  accent: "#66BCFF",
  destructive: "#DB4E6D",
  warning: "#D97A35",
  success: "#269E6D",
  shadow: "rgba(10,34,72,0.22)",
  progressTrack: "rgba(12,39,76,0.08)",
  codeBackground: "rgba(255,255,255,0.30)",
  codeForeground: "#102A51",
  quoteBackground: "rgba(255,255,255,0.22)",
  quoteBorder: "rgba(82,131,177,0.60)",
  searchPlaceholder: "rgba(20,48,80,0.46)",
  tagBackground: "rgba(255,255,255,0.18)",
  screenGradient: ["#E4F1FF", "#EEF4FF", "#F4F2FF", "#EEF8FF"],
  surfaceGradient: ["rgba(255,255,255,0.80)", "rgba(255,255,255,0.25)", "rgba(162,199,255,0.10)"],
  activeGradient: ["rgba(20,63,118,0.88)", "rgba(52,120,196,0.82)", "rgba(102,188,255,0.74)"],
  orbOne: "rgba(74,161,255,0.58)",
  orbTwo: "rgba(180,127,255,0.46)",
  orbThree: "rgba(116,230,255,0.52)"
};

const defaultLight: ThemePalette = {
  background: "#F6F8FC",
  backgroundAlt: "#EEF2F8",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  surfaceOverlay: "rgba(255,255,255,1)",
  border: "#D9E0EB",
  borderStrong: "#C7D2E4",
  foreground: "#111827",
  muted: "#5F6C82",
  subtle: "#8692A7",
  primary: "#2563EB",
  primarySoft: "rgba(37,99,235,0.12)",
  primaryForeground: "#FFFFFF",
  accent: "#60A5FA",
  destructive: "#D94E67",
  warning: "#D97706",
  success: "#199669",
  shadow: "rgba(17,24,39,0.12)",
  progressTrack: "rgba(17,24,39,0.08)",
  codeBackground: "#EEF2FF",
  codeForeground: "#1E3A8A",
  quoteBackground: "#F5F7FB",
  quoteBorder: "#93C5FD",
  searchPlaceholder: "#94A3B8",
  tagBackground: "#F8FAFC",
  screenGradient: ["#F6F8FC", "#F3F6FB", "#EEF2F8"],
  surfaceGradient: ["#FFFFFF", "#FFFFFF"],
  activeGradient: ["#2563EB", "#60A5FA"],
  orbOne: "rgba(0,0,0,0)",
  orbTwo: "rgba(0,0,0,0)",
  orbThree: "rgba(0,0,0,0)"
};

const defaultDark: ThemePalette = {
  background: "#0D111B",
  backgroundAlt: "#111827",
  surface: "#151C2C",
  surfaceElevated: "#182132",
  surfaceOverlay: "#151C2C",
  border: "#2D364A",
  borderStrong: "#3B475F",
  foreground: "#EDF2FF",
  muted: "#B3BDD2",
  subtle: "#8D99B2",
  primary: "#60A5FA",
  primarySoft: "rgba(96,165,250,0.14)",
  primaryForeground: "#08111F",
  accent: "#93C5FD",
  destructive: "#FB7185",
  warning: "#F59E0B",
  success: "#34D399",
  shadow: "rgba(0,0,0,0.28)",
  progressTrack: "rgba(237,242,255,0.1)",
  codeBackground: "#111827",
  codeForeground: "#D9E7FF",
  quoteBackground: "#121827",
  quoteBorder: "#60A5FA",
  searchPlaceholder: "#7F8AA5",
  tagBackground: "#101827",
  screenGradient: ["#0D111B", "#101624", "#111827"],
  surfaceGradient: ["#182132", "#151C2C"],
  activeGradient: ["#60A5FA", "#3B82F6"],
  orbOne: "rgba(0,0,0,0)",
  orbTwo: "rgba(0,0,0,0)",
  orbThree: "rgba(0,0,0,0)"
};

const airPowerLight: ThemePalette = {
  background: "#E8EDF3",
  backgroundAlt: "#DCE7F3",
  surface: "rgba(255,255,255,0.28)",
  surfaceElevated: "rgba(255,255,255,0.38)",
  surfaceOverlay: "rgba(255,255,255,0.10)",
  border: "rgba(165,195,232,0.45)",
  borderStrong: "rgba(255,255,255,0.58)",
  foreground: "#16324F",
  muted: "rgba(22,50,79,0.72)",
  subtle: "rgba(23,48,77,0.48)",
  primary: "#2C547E",
  primarySoft: "rgba(44,84,126,0.12)",
  primaryForeground: "#FFFFFF",
  accent: "#70AADC",
  destructive: "#D25252",
  warning: "#D99043",
  success: "#2B9C79",
  shadow: "rgba(22,50,79,0.16)",
  progressTrack: "rgba(17,39,66,0.1)",
  codeBackground: "rgba(255,255,255,0.30)",
  codeForeground: "#1E3A5F",
  quoteBackground: "rgba(255,255,255,0.22)",
  quoteBorder: "rgba(83,131,177,0.60)",
  searchPlaceholder: "rgba(17,39,66,0.44)",
  tagBackground: "rgba(255,255,255,0.16)",
  screenGradient: ["#A5C3E8", "#CBDCF0", "#E8EDF3"],
  surfaceGradient: ["rgba(255,255,255,0.76)", "rgba(255,255,255,0.28)", "rgba(203,220,240,0.14)"],
  activeGradient: ["rgba(44,84,126,0.82)", "rgba(70,114,158,0.78)"],
  orbOne: "rgba(139,178,222,0.52)",
  orbTwo: "rgba(198,216,237,0.48)",
  orbThree: "rgba(124,166,210,0.40)"
};

const glassLight: ThemePalette = {
  background: "#E6EDFB",
  backgroundAlt: "#EEF4FF",
  surface: "rgba(255,255,255,0.24)",
  surfaceElevated: "rgba(255,255,255,0.36)",
  surfaceOverlay: "rgba(255,255,255,0.08)",
  border: "rgba(148,163,184,0.38)",
  borderStrong: "rgba(255,255,255,0.82)",
  foreground: "#0B1530",
  muted: "rgba(30,41,59,0.78)",
  subtle: "rgba(30,41,59,0.54)",
  primary: "#586C92",
  primarySoft: "rgba(88,108,146,0.14)",
  primaryForeground: "#F8FBFF",
  accent: "#5C9AFF",
  destructive: "#E11D48",
  warning: "#E59A47",
  success: "#28A47A",
  shadow: "rgba(30,64,175,0.20)",
  progressTrack: "rgba(11,21,48,0.08)",
  codeBackground: "rgba(255,255,255,0.30)",
  codeForeground: "#0B1530",
  quoteBackground: "rgba(255,255,255,0.22)",
  quoteBorder: "rgba(96,115,150,0.46)",
  searchPlaceholder: "rgba(30,41,59,0.56)",
  tagBackground: "rgba(255,255,255,0.16)",
  screenGradient: ["#E8F4F8", "#F5F0F8", "#F8F0E8"],
  surfaceGradient: ["rgba(255,255,255,0.82)", "rgba(255,255,255,0.44)", "rgba(191,219,254,0.20)"],
  activeGradient: ["rgba(94,114,153,0.96)", "rgba(72,94,136,0.94)"],
  orbOne: "rgba(14,165,233,0.78)",
  orbTwo: "rgba(99,102,241,0.64)",
  orbThree: "rgba(244,114,182,0.58)"
};

const glassDark: ThemePalette = {
  background: "#0B1220",
  backgroundAlt: "#10172B",
  surface: "rgba(10,20,40,0.52)",
  surfaceElevated: "rgba(15,28,52,0.62)",
  surfaceOverlay: "rgba(255,255,255,0.05)",
  border: "rgba(148,163,184,0.34)",
  borderStrong: "rgba(203,213,225,0.55)",
  foreground: "#E9F2FF",
  muted: "rgba(226,232,240,0.86)",
  subtle: "rgba(226,232,240,0.52)",
  primary: "#2DD4BF",
  primarySoft: "rgba(45,212,191,0.16)",
  primaryForeground: "#05221F",
  accent: "#7DD3FC",
  destructive: "#F87171",
  warning: "#F4B469",
  success: "#4ED3A1",
  shadow: "rgba(2,6,23,0.56)",
  progressTrack: "rgba(233,242,255,0.1)",
  codeBackground: "rgba(0,0,0,0.30)",
  codeForeground: "#DDEBFF",
  quoteBackground: "rgba(255,255,255,0.05)",
  quoteBorder: "rgba(45,212,191,0.54)",
  searchPlaceholder: "rgba(226,232,240,0.40)",
  tagBackground: "rgba(255,255,255,0.08)",
  screenGradient: ["#0F1729", "#1A1025", "#0D1F1F"],
  surfaceGradient: ["rgba(255,255,255,0.21)", "rgba(255,255,255,0.09)", "rgba(96,165,250,0.06)"],
  activeGradient: ["rgba(45,212,191,0.64)", "rgba(56,189,248,0.58)"],
  orbOne: "rgba(56,189,248,0.58)",
  orbTwo: "rgba(168,85,247,0.46)",
  orbThree: "rgba(45,212,191,0.50)"
};

const brutalistLight: ThemePalette = {
  background: "#F2F3F7",
  backgroundAlt: "#ECEFF4",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  surfaceOverlay: "rgba(255,255,255,1)",
  border: "rgba(19,25,36,0.14)",
  borderStrong: "#131924",
  foreground: "#131924",
  muted: "rgba(19,25,36,0.72)",
  subtle: "rgba(19,25,36,0.5)",
  primary: "#2A2F38",
  primarySoft: "rgba(42,47,56,0.12)",
  primaryForeground: "#FFFFFF",
  accent: "#5C677D",
  destructive: "#C24E63",
  warning: "#B56E2F",
  success: "#21785A",
  shadow: "rgba(19,25,36,0.18)",
  progressTrack: "rgba(19,25,36,0.1)",
  codeBackground: "#131924",
  codeForeground: "#F8FAFC",
  quoteBackground: "#EEF1F4",
  quoteBorder: "#2A2F38",
  searchPlaceholder: "rgba(19,25,36,0.42)",
  tagBackground: "#EEF1F4",
  screenGradient: ["#F3F5F8", "#F3F5F8", "#ECEFF4"],
  surfaceGradient: ["#FFFFFF", "#FFFFFF"],
  activeGradient: ["#2A2F38", "#2A2F38"],
  orbOne: "rgba(0,0,0,0)",
  orbTwo: "rgba(0,0,0,0)",
  orbThree: "rgba(0,0,0,0)"
};

const brutalistDark: ThemePalette = {
  background: "#171B23",
  backgroundAlt: "#11151C",
  surface: "#1E242E",
  surfaceElevated: "#232A35",
  surfaceOverlay: "#1E242E",
  border: "rgba(238,244,255,0.14)",
  borderStrong: "#EEF4FF",
  foreground: "#EEF4FF",
  muted: "rgba(238,244,255,0.74)",
  subtle: "rgba(238,244,255,0.48)",
  primary: "#EEF4FF",
  primarySoft: "rgba(238,244,255,0.1)",
  primaryForeground: "#11151C",
  accent: "#B7C2D8",
  destructive: "#FF8AA0",
  warning: "#F4C06A",
  success: "#72D1B1",
  shadow: "rgba(0,0,0,0.34)",
  progressTrack: "rgba(238,244,255,0.12)",
  codeBackground: "#0B0F15",
  codeForeground: "#EEF4FF",
  quoteBackground: "#11151C",
  quoteBorder: "#EEF4FF",
  searchPlaceholder: "rgba(238,244,255,0.34)",
  tagBackground: "#11151C",
  screenGradient: ["#171B23", "#171B23", "#11151C"],
  surfaceGradient: ["#232A35", "#1E242E"],
  activeGradient: ["#EEF4FF", "#D6DFEE"],
  orbOne: "rgba(0,0,0,0)",
  orbTwo: "rgba(0,0,0,0)",
  orbThree: "rgba(0,0,0,0)"
};

const defaultVisuals: ThemeVisuals = {
  surfaceRadius: 28,
  blurIntensity: 0,
  heavyBlurIntensity: 0,
  surfaceBorderWidth: 1,
  pressScale: 0.992,
  shadowOpacity: 0.12,
  shadowRadius: 24,
  shadowOffsetY: 16,
  ambientOverlay: ["rgba(255,255,255,0.16)", "rgba(255,255,255,0.04)", "rgba(255,255,255,0)"],
  highlightGradient: ["rgba(255,255,255,0.12)", "rgba(255,255,255,0.02)", "rgba(255,255,255,0)"],
  prismGradient: ["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)"]
};

const brutalistVisuals: ThemeVisuals = {
  surfaceRadius: 20,
  blurIntensity: 0,
  heavyBlurIntensity: 0,
  surfaceBorderWidth: 1.5,
  pressScale: 0.989,
  shadowOpacity: 0.16,
  shadowRadius: 18,
  shadowOffsetY: 12,
  ambientOverlay: ["rgba(19,25,36,0.03)", "rgba(19,25,36,0.01)", "rgba(19,25,36,0)"],
  highlightGradient: ["rgba(255,255,255,0.14)", "rgba(255,255,255,0)", "rgba(255,255,255,0)"],
  prismGradient: ["rgba(0,0,0,0)", "rgba(0,0,0,0)", "rgba(0,0,0,0)"]
};

const glassLightVisuals: ThemeVisuals = {
  surfaceRadius: 30,
  blurIntensity: 30,
  heavyBlurIntensity: 40,
  surfaceBorderWidth: 1,
  pressScale: 0.994,
  shadowOpacity: 0.2,
  shadowRadius: 30,
  shadowOffsetY: 18,
  ambientOverlay: ["rgba(255,255,255,0.26)", "rgba(255,255,255,0.08)", "rgba(191,219,254,0.02)"],
  highlightGradient: ["rgba(255,255,255,0.74)", "rgba(255,255,255,0.18)", "rgba(191,219,254,0.04)"],
  prismGradient: ["rgba(255,255,255,0)", "rgba(191,219,254,0.16)", "rgba(255,255,255,0)"]
};

const glassDarkVisuals: ThemeVisuals = {
  surfaceRadius: 30,
  blurIntensity: 32,
  heavyBlurIntensity: 42,
  surfaceBorderWidth: 1,
  pressScale: 0.994,
  shadowOpacity: 0.28,
  shadowRadius: 32,
  shadowOffsetY: 18,
  ambientOverlay: ["rgba(255,255,255,0.08)", "rgba(96,165,250,0.04)", "rgba(0,0,0,0)"],
  highlightGradient: ["rgba(255,255,255,0.22)", "rgba(255,255,255,0.08)", "rgba(96,165,250,0.04)"],
  prismGradient: ["rgba(255,255,255,0)", "rgba(125,211,252,0.1)", "rgba(255,255,255,0)"]
};

const airPowerVisuals: ThemeVisuals = {
  surfaceRadius: 30,
  blurIntensity: 24,
  heavyBlurIntensity: 34,
  surfaceBorderWidth: 1,
  pressScale: 0.994,
  shadowOpacity: 0.18,
  shadowRadius: 28,
  shadowOffsetY: 16,
  ambientOverlay: ["rgba(255,255,255,0.30)", "rgba(255,255,255,0.08)", "rgba(203,220,240,0.02)"],
  highlightGradient: ["rgba(255,255,255,0.76)", "rgba(255,255,255,0.2)", "rgba(203,220,240,0.06)"],
  prismGradient: ["rgba(255,255,255,0)", "rgba(198,216,237,0.12)", "rgba(255,255,255,0)"]
};

const crystalLineVisuals: ThemeVisuals = {
  surfaceRadius: 32,
  blurIntensity: 34,
  heavyBlurIntensity: 46,
  surfaceBorderWidth: 1,
  pressScale: 0.995,
  shadowOpacity: 0.24,
  shadowRadius: 34,
  shadowOffsetY: 20,
  ambientOverlay: ["rgba(255,255,255,0.34)", "rgba(255,255,255,0.10)", "rgba(198,170,255,0.04)"],
  highlightGradient: ["rgba(255,255,255,0.82)", "rgba(255,255,255,0.22)", "rgba(162,199,255,0.08)"],
  prismGradient: ["rgba(255,91,180,0.16)", "rgba(102,195,255,0.12)", "rgba(139,92,246,0.16)"]
};

export const THEMES: readonly ThemeDefinition[] = [
  {
    id: "system",
    label: "System",
    description: "Domyślny wygląd zgodny z ustawieniem iPhone.",
    appearance: "system",
    isGlass: false,
    preview: {
      bg: "#F6F8FC",
      card: "#FFFFFF",
      accent: "#2563EB",
      gradient: ["#F6F8FC", "#F3F6FB", "#EEF2F8"]
    },
    visuals: defaultVisuals,
    palettes: {
      light: defaultLight,
      dark: defaultDark
    }
  },
  {
    id: "light",
    label: "Light",
    description: "Neutralny jasny tryb bez customowego szkła.",
    appearance: "light",
    isGlass: false,
    preview: {
      bg: "#F6F8FC",
      card: "#FFFFFF",
      accent: "#2563EB",
      gradient: ["#F6F8FC", "#F3F6FB", "#EEF2F8"]
    },
    visuals: defaultVisuals,
    palettes: {
      light: defaultLight
    }
  },
  {
    id: "dark",
    label: "Dark",
    description: "Neutralny ciemny tryb bez customowego szkła.",
    appearance: "dark",
    isGlass: false,
    preview: {
      bg: "#0D111B",
      card: "#151C2C",
      accent: "#60A5FA",
      gradient: ["#0D111B", "#101624", "#111827"]
    },
    visuals: defaultVisuals,
    palettes: {
      light: defaultDark
    }
  },
  {
    id: "brutalist",
    label: "Brutalist",
    description: "Surowy, papierowy i kontrastowy.",
    appearance: "system",
    isGlass: false,
    preview: {
      bg: "#F2F3F7",
      card: "#FFFFFF",
      accent: "#2A2F38",
      gradient: ["#F2F3F7", "#F2F3F7", "#ECEFF4"]
    },
    visuals: brutalistVisuals,
    palettes: {
      light: brutalistLight,
      dark: brutalistDark
    }
  },
  {
    id: "glass-light",
    label: "Liquid Glass Light",
    description: "Jasny, płynny szklisty interfejs.",
    appearance: "light",
    isGlass: true,
    preview: {
      bg: "#E8F4F8",
      card: "rgba(255,255,255,0.36)",
      accent: "#586C92",
      gradient: ["#E8F4F8", "#F5F0F8", "#F8F0E8"]
    },
    visuals: glassLightVisuals,
    palettes: {
      light: glassLight
    }
  },
  {
    id: "glass-dark",
    label: "Liquid Glass Dark",
    description: "Głęboki, nocny glass z chłodnym blaskiem.",
    appearance: "dark",
    isGlass: true,
    preview: {
      bg: "#0F1729",
      card: "rgba(10,20,40,0.56)",
      accent: "#2DD4BF",
      gradient: ["#0F1729", "#1A1025", "#0D1F1F"]
    },
    visuals: glassDarkVisuals,
    palettes: {
      light: glassDark
    }
  },
  {
    id: "air-power",
    label: "Air Power",
    description: "Lekki, powietrzny, chłodny błękit.",
    appearance: "light",
    isGlass: true,
    preview: {
      bg: "#DCE7F3",
      card: "rgba(255,255,255,0.28)",
      accent: "#2C547E",
      gradient: ["#A5C3E8", "#CBDCF0", "#E8EDF3"]
    },
    visuals: airPowerVisuals,
    palettes: {
      light: airPowerLight
    }
  },
  {
    id: "crystal-line",
    label: "Crystal Line",
    description: "Frezowane szkło optyczne z pryzmatycznym blaskiem.",
    appearance: "light",
    isGlass: true,
    preview: {
      bg: "#E4F1FF",
      card: "rgba(255,255,255,0.30)",
      accent: "#17457F",
      gradient: ["#E4F1FF", "#EEF4FF", "#F4F2FF"]
    },
    visuals: crystalLineVisuals,
    palettes: {
      light: crystalLight
    }
  }
] as const;

export function isValidTheme(value: string | null | undefined): value is ThemeMode {
  return THEMES.some((theme) => theme.id === value);
}

export function getThemeById(themeId: ThemeMode): ThemeDefinition {
  const theme = THEMES.find((entry) => entry.id === themeId);
  if (!theme) {
    return THEMES[THEMES.length - 1];
  }
  return theme;
}

export function getNextTheme(themeId: ThemeMode): ThemeMode {
  const currentIndex = THEMES.findIndex((theme) => theme.id === themeId);
  if (currentIndex === -1) {
    return THEMES[0].id;
  }
  return THEMES[(currentIndex + 1) % THEMES.length].id;
}

export function resolveAppearance(theme: ThemeDefinition, systemTheme: ResolvedTheme): ResolvedTheme {
  if (theme.appearance === "system") {
    return systemTheme;
  }
  return theme.appearance;
}

export function resolvePalette(themeId: ThemeMode, systemTheme: ResolvedTheme) {
  const theme = getThemeById(themeId);
  const resolvedTheme = resolveAppearance(theme, systemTheme);
  const palette = resolvedTheme === "dark" && theme.palettes.dark ? theme.palettes.dark : theme.palettes.light;

  return {
    theme,
    palette,
    resolvedTheme
  };
}
