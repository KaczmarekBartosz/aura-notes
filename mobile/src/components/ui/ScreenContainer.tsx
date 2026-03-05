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
  const { colors, visuals, isGlass } = useAppTheme();

  return (
    <SafeAreaView edges={edges} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <LinearGradient colors={[...colors.screenGradient]} style={StyleSheet.absoluteFillObject} />
        <LinearGradient
          colors={[...visuals.ambientOverlay]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {isGlass ? (
          <>
            <View style={[styles.orb, styles.orbOne, { backgroundColor: colors.orbOne }]} />
            <View style={[styles.orb, styles.orbTwo, { backgroundColor: colors.orbTwo }]} />
            <View style={[styles.orb, styles.orbThree, { backgroundColor: colors.orbThree }]} />
            <View style={[styles.veil, { backgroundColor: colors.surfaceOverlay }]} />
          </>
        ) : null}
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
    width: 260,
    height: 260,
    top: -64,
    left: -56
  },
  orbTwo: {
    width: 240,
    height: 240,
    top: 140,
    right: -92
  },
  orbThree: {
    width: 220,
    height: 220,
    bottom: -92,
    left: 32
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.42
  }
});
