import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";

export const uiSpacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32
} as const;

export const uiRadius = {
  pill: 999,
  inner: 18,
  card: 22,
  surface: 24
} as const;

export const uiControl = {
  minTouch: 44,
  compactTouch: 40,
  handleWidth: 38,
  handleHeight: 5,
  progressHeight: 3
} as const;

export const uiCard = {
  hero: {
    radius: uiRadius.surface,
    paddingHorizontal: uiSpacing.lg,
    paddingVertical: uiSpacing.lg,
    gap: uiSpacing.md
  },
  section: {
    radius: uiRadius.surface,
    paddingHorizontal: uiSpacing.lg,
    paddingVertical: uiSpacing.lg,
    gap: uiSpacing.md
  },
  list: {
    radius: uiRadius.card,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: uiSpacing.sm
  },
  toolbar: {
    radius: uiRadius.surface,
    paddingHorizontal: uiSpacing.md,
    paddingVertical: uiSpacing.sm,
    gap: uiSpacing.sm
  },
  compact: {
    radius: uiRadius.inner,
    paddingHorizontal: uiSpacing.md,
    paddingVertical: uiSpacing.md,
    gap: uiSpacing.sm
  }
} as const;

export type SurfacePreset = keyof typeof uiCard;

export const uiType = StyleSheet.create({
  display: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    letterSpacing: -1
  } satisfies TextStyle,
  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.8
  } satisfies TextStyle,
  title2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    letterSpacing: -0.7
  } satisfies TextStyle,
  title3: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    letterSpacing: -0.45
  } satisfies TextStyle,
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    letterSpacing: -0.35
  } satisfies TextStyle,
  body: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "500"
  } satisfies TextStyle,
  bodyStrong: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600"
  } satisfies TextStyle,
  meta: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600"
  } satisfies TextStyle,
  caption: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600"
  } satisfies TextStyle,
  eyebrow: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase"
  } satisfies TextStyle,
  statValue: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "800",
    letterSpacing: -0.6
  } satisfies TextStyle
});

export const uiLayout = StyleSheet.create({
  screen: {
    paddingHorizontal: uiSpacing.lg
  } satisfies ViewStyle,
  stack: {
    gap: uiSpacing.md
  } satisfies ViewStyle,
  sectionStack: {
    gap: uiSpacing.xl
  } satisfies ViewStyle,
  inline: {
    flexDirection: "row",
    alignItems: "center",
    gap: uiSpacing.sm
  } satisfies ViewStyle,
  centered: {
    alignItems: "center",
    justifyContent: "center"
  } satisfies ViewStyle
});
