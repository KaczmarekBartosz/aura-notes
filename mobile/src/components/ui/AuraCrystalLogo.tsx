import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../../theme/ThemeProvider";

interface AuraCrystalLogoProps {
  size?: number;
}

export function AuraCrystalLogo({ size = 32 }: AuraCrystalLogoProps) {
  const { colors, resolvedTheme } = useAppTheme();

  const rotation = useSharedValue(0);
  const breath = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 12000, easing: Easing.linear }),
      -1,
      false
    );

    breath.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.92, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const coreStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: breath.value }
    ]
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `-${rotation.value * 0.5}deg` }
    ]
  }));

  const ringColors = [colors.primary, colors.accent] as const;
  const coreColors = [colors.backgroundAlt, colors.surfaceElevated, colors.primarySoft] as const;
  const glowColor = resolvedTheme === "dark" ? colors.primarySoft : colors.primarySoft;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer Glow */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.glow,
          { backgroundColor: glowColor, transform: [{ scale: breath }], shadowColor: colors.primary }
        ]}
      />

      {/* Rotating Ring */}
      <Animated.View style={[StyleSheet.absoluteFill, ringStyle]}>
        <LinearGradient
          colors={ringColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: size / 2.5, opacity: 0.85 }]}
        />
      </Animated.View>

      {/* Inner Core */}
      <Animated.View style={[styles.core, { width: size * 0.5, height: size * 0.5, shadowColor: colors.foreground }, coreStyle]}>
        <LinearGradient
          colors={coreColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: size / 4 }]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    borderRadius: 999,
    shadowColor: "#71C4FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  core: {
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 8,
  }
});
