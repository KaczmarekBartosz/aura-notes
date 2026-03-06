import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import type { PropsWithChildren } from "react";
import { useAppTheme } from "../../theme/ThemeProvider";
import { uiCard, type SurfacePreset } from "../../theme/ui";

type SurfaceCardProps = PropsWithChildren<{
  onPress?: PressableProps["onPress"];
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  intensity?: number;
  accessibilityRole?: PressableProps["accessibilityRole"];
  accessibilityLabel?: PressableProps["accessibilityLabel"];
  accessibilityHint?: PressableProps["accessibilityHint"];
  preset?: SurfacePreset;
  contentPreset?: SurfacePreset | "none";
  materialVariant?: "full" | "lite";
}>;

export function SurfaceCard({
  children,
  onPress,
  style,
  contentStyle,
  intensity,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  preset = "section",
  contentPreset,
  materialVariant = "full"
}: SurfaceCardProps) {
  const { colors, visuals, isGlass, resolvedTheme } = useAppTheme();
  const blurIntensity = intensity ?? visuals.heavyBlurIntensity;
  const shellPreset = uiCard[preset];
  const resolvedContentPreset = contentPreset ?? preset;
  const bodyPadding = resolvedContentPreset === "none" ? null : uiCard[resolvedContentPreset];
  const useLiteMaterial = isGlass && materialVariant === "lite";
  const renderFullGlass = isGlass && !useLiteMaterial;
  const blurPlatformProps = Platform.OS === "android" ? { experimentalBlurMethod: "dimezisBlurView" as const } : {};

  const body = (
    <View
      style={[
        styles.shell,
        {
          backgroundColor: isGlass ? "transparent" : colors.surfaceElevated,
          borderColor: isGlass ? colors.borderStrong : colors.border,
          borderWidth: visuals.surfaceBorderWidth,
          borderRadius: shellPreset.radius,
          shadowColor: colors.shadow,
          shadowOpacity: visuals.shadowOpacity * (preset === "list" ? 0.82 : 0.92),
          shadowRadius: visuals.shadowRadius * (preset === "list" ? 0.92 : 1),
          shadowOffset: {
            width: 0,
            height: visuals.shadowOffsetY
          }
        },
        style
      ]}
    >
      {renderFullGlass ? (
        <>
          <BlurView
            {...blurPlatformProps}
            intensity={Platform.OS === "ios" ? 100 : blurIntensity}
            tint={Platform.OS === "ios" ? (resolvedTheme === "dark" ? "systemThinMaterialDark" : "systemThinMaterialLight") : (resolvedTheme === "dark" ? "dark" : "light")}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.surface }]} />
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
            colors={["rgba(255,255,255,0.14)", "rgba(255,255,255,0.03)", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.88, y: 1 }}
            style={styles.topGlow}
          />
          <View style={[StyleSheet.absoluteFillObject, styles.overlaySoftener, { backgroundColor: colors.surfaceOverlay }]} />
          <LinearGradient
            colors={["rgba(255,255,255,0.44)", "rgba(255,255,255,0.1)", "rgba(255,255,255,0)"]}
            start={{ x: 0.08, y: 0 }}
            end={{ x: 0.92, y: 0.88 }}
            style={styles.specularSweep}
          />
          <View style={[styles.edgeSpecular, { borderColor: colors.borderStrong, borderRadius: shellPreset.radius }]} />
        </>
      ) : useLiteMaterial ? (
        <>
          <LinearGradient
            colors={[
              "rgba(255,255,255,0.2)",
              colors.surfaceOverlay,
              "rgba(255,255,255,0.05)"
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFillObject, styles.liteGradient]}
          />
          <View style={[styles.edgeSpecular, { borderColor: colors.borderStrong, borderRadius: shellPreset.radius, opacity: 0.22 }]} />
        </>
      ) : null}
      <View
        style={[
          styles.content,
          bodyPadding
            ? {
                paddingHorizontal: bodyPadding.paddingHorizontal,
                paddingVertical: bodyPadding.paddingVertical,
                gap: bodyPadding.gap
              }
            : null,
          contentStyle
        ]}
      >
        {children}
      </View>
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
        { borderRadius: shellPreset.radius },
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
    elevation: 8
  },
  prismSweep: {
    position: "absolute",
    top: "-10%",
    bottom: "-10%",
    left: "-6%",
    right: "-6%",
    opacity: 0.4,
    transform: [{ rotate: "-12deg" }]
  },
  surfaceGradient: {
    opacity: 0.5
  },
  highlightLayer: {
    opacity: 0.62
  },
  topGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.52
  },
  overlaySoftener: {
    opacity: 0.24
  },
  specularSweep: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.32
  },
  edgeSpecular: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    opacity: 0.48
  },
  liteGradient: {
    opacity: 0.78
  },
  content: {
    position: "relative",
    zIndex: 2
  }
});
