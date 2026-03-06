import { BlurView } from "expo-blur";
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";
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
  const primaryBackgroundBlurIntensity = isGlass ? visuals.blurIntensity : 0;
  const blurPlatformProps = Platform.OS === "android" ? { experimentalBlurMethod: "dimezisBlurView" as const } : {};

  return (
    <View style={[styles.rootContainer, { backgroundColor: isGlass ? colors.background : colors.background }]}>
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient colors={[...colors.screenGradient]} style={StyleSheet.absoluteFillObject} />
        {isGlass ? (
          <>
            <View pointerEvents="none" style={[styles.orb, styles.orbOne]}>
              <Svg width="100%" height="100%">
                <Defs>
                  <RadialGradient id="orb1" cx="50%" cy="50%" rx="50%" ry="50%">
                    <Stop offset="0%" stopColor={colors.orbOne} stopOpacity="0.8" />
                    <Stop offset="30%" stopColor={colors.orbOne} stopOpacity="0.5" />
                    <Stop offset="70%" stopColor={colors.orbOne} stopOpacity="0.15" />
                    <Stop offset="100%" stopColor={colors.orbOne} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx="50%" cy="50%" r="50%" fill="url(#orb1)" />
              </Svg>
            </View>
            <View pointerEvents="none" style={[styles.orb, styles.orbTwo]}>
              <Svg width="100%" height="100%">
                <Defs>
                  <RadialGradient id="orb2" cx="50%" cy="50%" rx="50%" ry="50%">
                    <Stop offset="0%" stopColor={colors.orbTwo} stopOpacity="0.9" />
                    <Stop offset="40%" stopColor={colors.orbTwo} stopOpacity="0.6" />
                    <Stop offset="80%" stopColor={colors.orbTwo} stopOpacity="0.15" />
                    <Stop offset="100%" stopColor={colors.orbTwo} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx="50%" cy="50%" r="50%" fill="url(#orb2)" />
              </Svg>
            </View>
            <View pointerEvents="none" style={[styles.orb, styles.orbThree]}>
              <Svg width="100%" height="100%">
                <Defs>
                  <RadialGradient id="orb3" cx="50%" cy="50%" rx="50%" ry="50%">
                    <Stop offset="0%" stopColor={colors.orbThree} stopOpacity="0.85" />
                    <Stop offset="35%" stopColor={colors.orbThree} stopOpacity="0.5" />
                    <Stop offset="75%" stopColor={colors.orbThree} stopOpacity="0.15" />
                    <Stop offset="100%" stopColor={colors.orbThree} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx="50%" cy="50%" r="50%" fill="url(#orb3)" />
              </Svg>
            </View>
            <View pointerEvents="none" style={[styles.orb, styles.orbFour]}>
              <Svg width="100%" height="100%">
                <Defs>
                  <RadialGradient id="orb4" cx="50%" cy="50%" rx="50%" ry="50%">
                    <Stop offset="0%" stopColor={colors.orbTwo} stopOpacity="0.7" />
                    <Stop offset="40%" stopColor={colors.orbTwo} stopOpacity="0.4" />
                    <Stop offset="80%" stopColor={colors.orbTwo} stopOpacity="0.1" />
                    <Stop offset="100%" stopColor={colors.orbTwo} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx="50%" cy="50%" r="50%" fill="url(#orb4)" />
              </Svg>
            </View>
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
      </View>

      <SafeAreaView edges={edges} style={styles.safeArea}>
        <View
          style={[
            styles.content,
            withHorizontalPadding && styles.padded,
            contentStyle
          ]}
        >
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1
  },
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
    top: -50,
    left: -28,
    right: -20,
    height: 300,
    opacity: 0.54
  },
  bottomAura: {
    position: "absolute",
    left: -24,
    right: -24,
    bottom: -60,
    height: 300,
    opacity: 0.4
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08
  }
});
