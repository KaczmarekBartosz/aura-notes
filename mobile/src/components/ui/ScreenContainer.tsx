import { BlurView } from "expo-blur";
import { StyleSheet, View, type ViewStyle } from "react-native";
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
  const backgroundBlurIntensity = Math.max(12, Math.round(visuals.blurIntensity * 0.46));

  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <LinearGradient colors={[...colors.screenGradient]} style={StyleSheet.absoluteFillObject} />
        {isGlass ? (
          <>
            <View pointerEvents="none" style={[styles.orb, styles.orbOne, { backgroundColor: colors.orbOne }]} />
            <View pointerEvents="none" style={[styles.orb, styles.orbTwo, { backgroundColor: colors.orbTwo }]} />
            <View pointerEvents="none" style={[styles.orb, styles.orbThree, { backgroundColor: colors.orbThree }]} />
            <BlurView
              pointerEvents="none"
              intensity={backgroundBlurIntensity}
              tint={resolvedTheme === "dark" ? "dark" : "light"}
              style={StyleSheet.absoluteFillObject}
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
    opacity: 0.96
  },
  orbOne: {
    width: 356,
    height: 356,
    top: -102,
    left: -94
  },
  orbTwo: {
    width: 334,
    height: 334,
    top: 104,
    right: -128
  },
  orbThree: {
    width: 300,
    height: 300,
    bottom: -132,
    left: 4
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1
  }
});
