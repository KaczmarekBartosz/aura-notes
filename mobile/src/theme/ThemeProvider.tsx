import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { useColorScheme } from "react-native";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import {
  getNextTheme,
  isValidTheme,
  resolvePalette,
  THEMES,
  type ResolvedTheme,
  type ThemeMode,
  type ThemePalette,
  type ThemeVisuals
} from "./themes";

const THEME_STORAGE_KEY = "aura-notes.theme-mode";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => Promise<void>;
  cycleTheme: () => Promise<void>;
  themes: typeof THEMES;
  resolvedTheme: ResolvedTheme;
  colors: ThemePalette;
  visuals: ThemeVisuals;
  isGlass: boolean;
  themeLabel: string;
  themeDescription: string;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const systemTheme: ResolvedTheme = systemScheme === "dark" ? "dark" : "light";
  const [theme, setThemeState] = useState<ThemeMode>("crystal-line");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (!mounted) return;
        if (isValidTheme(saved)) {
          setThemeState(saved);
        }
      } catch {
        // Best-effort persistence only.
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const persistTheme = useCallback(async (nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Best-effort persistence only.
    }
  }, []);

  const cycleTheme = useCallback(async () => {
    const nextTheme = getNextTheme(theme);
    await persistTheme(nextTheme);
  }, [persistTheme, theme]);

  const value = useMemo<ThemeContextValue>(() => {
    const resolved = resolvePalette(theme, systemTheme);
    return {
      theme,
      setTheme: persistTheme,
      cycleTheme,
      themes: THEMES,
      resolvedTheme: resolved.resolvedTheme,
      colors: resolved.palette,
      visuals: resolved.theme.visuals,
      isGlass: resolved.theme.isGlass,
      themeLabel: resolved.theme.label,
      themeDescription: resolved.theme.description
    };
  }, [cycleTheme, persistTheme, systemTheme, theme]);

  useEffect(() => {
    setColorScheme(value.resolvedTheme);
  }, [setColorScheme, value.resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used inside ThemeProvider");
  }
  return context;
}
