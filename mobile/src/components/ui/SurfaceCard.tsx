import { BlurView } from "expo-blur";
import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Platform, StyleSheet, View, type PressableProps, type ViewStyle } from "react-native";
import type { PropsWithChildren } from "react";
import { useAppTheme } from "../../theme/ThemeProvider";

type SurfaceCardProps = PropsWithChildren<{
  onPress?: PressableProps["onPress"];
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  intensity?: number;
  accessibilityRole?: PressableProps["accessibilityRole"];
  accessibilityLabel?: PressableProps["accessibilityLabel"];
  accessibilityHint?: PressableProps["accessibilityHint"];
}>;

export function SurfaceCard({
  children,
  onPress,
  style,
  contentStyle,
  intensity,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint
}: SurfaceCardProps) {
  const { colors, visuals, isGlass, resolvedTheme } = useAppTheme();
  const blurIntensity = intensity ?? visuals.heavyBlurIntensity;
  const useNativeGlass = isGlass && Platform.OS === "ios" && isGlassEffectAPIAvailable();

  const body = (
    <View
      style={[
        styles.shell,
        {
          backgroundColor: isGlass ? colors.surface : colors.surfaceElevated,
          borderColor: isGlass ? colors.borderStrong : colors.border,
          borderWidth: visuals.surfaceBorderWidth,
          borderRadius: visuals.surfaceRadius,
          shadowColor: colors.shadow,
          shadowOpacity: visuals.shadowOpacity,
          shadowRadius: visuals.shadowRadius,
          shadowOffset: {
            width: 0,
            height: visuals.shadowOffsetY
          }
        },
        style
      ]}
    >
      {isGlass ? (
        <>
          {useNativeGlass ? (
            <GlassView
              glassEffectStyle={resolvedTheme === "dark" ? "regular" : "clear"}
              tintColor={colors.surfaceOverlay}
              style={StyleSheet.absoluteFillObject}
            />
          ) : (
            <BlurView
              intensity={blurIntensity}
              tint={resolvedTheme === "dark" ? "dark" : "light"}
              style={StyleSheet.absoluteFillObject}
            />
          )}
          <LinearGradient
            colors={[...colors.surfaceGradient]}
            style={[StyleSheet.absoluteFillObject, styles.surfaceGradient]}
          />
          <LinearGradient
            colors={[...visuals.highlightGradient]}
            start={{ x: 0.02, y: 0 }}
            end={{ x: 1, y: 0.78 }}
            style={[StyleSheet.absoluteFillObject, styles.highlightLayer]}
          />
          {visuals.prismGradient.some((entry) => entry !== "rgba(0,0,0,0)") ? (
            <LinearGradient
              colors={[...visuals.prismGradient]}
              start={{ x: 0, y: 0.15 }}
              end={{ x: 1, y: 0.85 }}
              style={styles.prismSweep}
            />
          ) : null}
          <LinearGradient
            colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.04)", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.88, y: 1 }}
            style={styles.topGlow}
          />
          <View style={[StyleSheet.absoluteFillObject, styles.overlaySoftener, { backgroundColor: colors.surfaceOverlay }]} />
          <LinearGradient
            colors={["rgba(255,255,255,0.56)", "rgba(255,255,255,0.12)", "rgba(255,255,255,0)"]}
            start={{ x: 0.08, y: 0 }}
            end={{ x: 0.92, y: 0.88 }}
            style={styles.specularSweep}
          />
          <View style={[styles.edgeSpecular, { borderColor: colors.borderStrong, borderRadius: visuals.surfaceRadius }]} />
        </>
      ) : null}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  );

  if (!onPress) {
    return body;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.pressable,
        { borderRadius: visuals.surfaceRadius },
        pressed && { transform: [{ scale: visuals.pressScale }] }
      ]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {},
  shell: {
    overflow: "hidden",
    elevation: 10
  },
  prismSweep: {
    position: "absolute",
    top: "-10%",
    bottom: "-10%",
    left: "-6%",
    right: "-6%",
    opacity: 0.48,
    transform: [{ rotate: "-12deg" }]
  },
  surfaceGradient: {
    opacity: 0.56
  },
  highlightLayer: {
    opacity: 0.72
  },
  topGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.58
  },
  overlaySoftener: {
    opacity: 0.28
  },
  specularSweep: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.42
  },
  edgeSpecular: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    opacity: 0.62
  },
  content: {
    position: "relative",
    zIndex: 2
  }
});
