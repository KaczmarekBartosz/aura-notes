import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View, type PressableProps, type ViewStyle } from "react-native";
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
  intensity = 42,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint
}: SurfaceCardProps) {
  const { colors, visuals, isGlass, resolvedTheme } = useAppTheme();
  const blurIntensity = intensity ?? visuals.blurIntensity;

  const body = (
    <View
      style={[
        styles.shell,
        {
          backgroundColor: isGlass ? "transparent" : colors.surfaceElevated,
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
          <BlurView
            intensity={blurIntensity}
            tint={resolvedTheme === "dark" ? "dark" : "light"}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient colors={[...colors.surfaceGradient]} style={StyleSheet.absoluteFillObject} />
          <LinearGradient
            colors={[...visuals.highlightGradient]}
            start={{ x: 0.02, y: 0 }}
            end={{ x: 1, y: 0.78 }}
            style={StyleSheet.absoluteFillObject}
          />
          {visuals.prismGradient.some((entry) => entry !== "rgba(0,0,0,0)") ? (
            <LinearGradient
              colors={[...visuals.prismGradient]}
              start={{ x: 0, y: 0.15 }}
              end={{ x: 1, y: 0.85 }}
              style={styles.prismSweep}
            />
          ) : null}
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.surfaceOverlay }]} />
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
      style={({ pressed }) => [styles.pressable, { borderRadius: visuals.surfaceRadius }, pressed && { transform: [{ scale: visuals.pressScale }] }]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
  },
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
  edgeSpecular: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    opacity: 0.42
  },
  content: {
    position: "relative",
    zIndex: 2
  }
});
