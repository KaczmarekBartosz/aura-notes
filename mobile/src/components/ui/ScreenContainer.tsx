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
  const backgroundBlurIntensity = Math.max(18, Math.round(visuals.blurIntensity * 0.6));

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
    opacity: 1
  },
  orbOne: {
    width: 320,
    height: 320,
    top: -88,
    left: -72
  },
  orbTwo: {
    width: 300,
    height: 300,
    top: 132,
    right: -116
  },
  orbThree: {
    width: 280,
    height: 280,
    bottom: -112,
    left: 18
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.22
  }
});
