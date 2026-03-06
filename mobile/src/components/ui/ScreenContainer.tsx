import { BlurView } from "expo-blur";
import { GlassView, isGlassEffectAPIAvailable } from "expo-glass-effect";
import { Platform, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../../theme/ThemeProvider";
import type { PropsWithChildren } from "react";

type ScreenContainerProps = PropsWithChildren<{
  edges?: Edge[];
  contentStyle?: ViewStyle;
  withHorizontalPadding?: boolean;
}>;

export function ScreenContainer({
  children,
  edges = ["top", "left", "right"],
  contentStyle,
  withHorizontalPadding = true
}: ScreenContainerProps) {
  const { colors, visuals, isGlass, resolvedTheme } = useAppTheme();
  const primaryBackgroundBlurIntensity = Math.max(44, Math.round(visuals.heavyBlurIntensity * 0.92));
  const secondaryBackgroundBlurIntensity = Math.max(26, Math.round(visuals.heavyBlurIntensity * 0.68));
  const tertiaryBackgroundBlurIntensity = Math.max(18, Math.round(visuals.blurIntensity * 0.96));
  const useNativeGlassBackdrop = isGlass && Platform.OS === "ios" && isGlassEffectAPIAvailable();

  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, { backgroundColor: isGlass ? "transparent" : colors.background }]}>
      <View style={styles.container}>
        <LinearGradient colors={[...colors.screenGradient]} style={StyleSheet.absoluteFillObject} />
        {isGlass ? (
          <>
            <View pointerEvents="none" style={[styles.orb, styles.orbOne, { backgroundColor: colors.orbOne }]} />
            <View pointerEvents="none" style={[styles.orb, styles.orbTwo, { backgroundColor: colors.orbTwo }]} />
            <View pointerEvents="none" style={[styles.orb, styles.orbThree, { backgroundColor: colors.orbThree }]} />
            <View pointerEvents="none" style={[styles.orb, styles.orbFour, { backgroundColor: colors.orbTwo }]} />
            <LinearGradient
              pointerEvents="none"
              colors={["rgba(255,255,255,0.16)", "rgba(255,255,255,0.04)", "rgba(255,255,255,0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.92, y: 0.78 }}
              style={styles.topAura}
            />
            <LinearGradient
              pointerEvents="none"
              colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.06)", "rgba(255,255,255,0.14)"]}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={styles.bottomAura}
            />
            {useNativeGlassBackdrop ? (
              <GlassView
                glassEffectStyle={resolvedTheme === "dark" ? "regular" : "clear"}
                tintColor={colors.surfaceOverlay}
                style={StyleSheet.absoluteFillObject}
              />
            ) : (
              <BlurView
                pointerEvents="none"
                intensity={primaryBackgroundBlurIntensity}
                tint={resolvedTheme === "dark" ? "dark" : "light"}
                style={StyleSheet.absoluteFillObject}
              />
            )}
            <BlurView
              pointerEvents="none"
              intensity={secondaryBackgroundBlurIntensity}
              tint={resolvedTheme === "dark" ? "dark" : "light"}
              style={[StyleSheet.absoluteFillObject, styles.secondaryBlur]}
            />
            <BlurView
              pointerEvents="none"
              intensity={tertiaryBackgroundBlurIntensity}
              tint={resolvedTheme === "dark" ? "dark" : "light"}
              style={[StyleSheet.absoluteFillObject, styles.tertiaryBlur]}
            />
            <LinearGradient
              pointerEvents="none"
              colors={[...visuals.ambientOverlay]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View pointerEvents="none" style={[styles.veil, { backgroundColor: colors.surfaceOverlay }]} />
          </>
        ) : (
          <LinearGradient
            colors={[...visuals.ambientOverlay]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        )}
        <View
          style={[
            styles.content,
            withHorizontalPadding && styles.padded,
            { backgroundColor: isGlass ? "transparent" : colors.background },
            contentStyle
          ]}
        >
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1,
    overflow: "hidden"
  },
  content: {
    flex: 1
  },
  padded: {
    paddingHorizontal: 16
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.78
  },
  orbOne: {
    width: 416,
    height: 416,
    top: -142,
    left: -124
  },
  orbTwo: {
    width: 382,
    height: 382,
    top: 72,
    right: -148
  },
  orbThree: {
    width: 344,
    height: 344,
    bottom: -162,
    left: -14
  },
  orbFour: {
    width: 260,
    height: 260,
    top: "44%",
    right: "12%",
    opacity: 0.3
  },
  topAura: {
    position: "absolute",
    top: -36,
    left: -28,
    right: -20,
    height: 248,
    opacity: 0.54
  },
  bottomAura: {
    position: "absolute",
    left: -24,
    right: -24,
    bottom: -48,
    height: 240,
    opacity: 0.4
  },
  secondaryBlur: {
    opacity: 0.74
  },
  tertiaryBlur: {
    opacity: 0.42,
    transform: [{ scale: 1.04 }]
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08
  }
});
