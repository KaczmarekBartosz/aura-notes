import { Pressable, StyleSheet, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { uiControl, uiRadius, uiSpacing, uiType } from "../../theme/ui";
import { useAppTheme } from "../../theme/ThemeProvider";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  closeLabel: string;
  showHandle?: boolean;
};

export function ScreenHeader({ title, subtitle, onClose, closeLabel, showHandle = true }: ScreenHeaderProps) {
  const { colors } = useAppTheme();

  return (
    <>
      {showHandle ? <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} /> : null}
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={[uiType.title2, styles.title, { color: colors.foreground }]}>{title}</Text>
          {subtitle ? <Text style={[uiType.meta, styles.subtitle, { color: colors.muted }]}>{subtitle}</Text> : null}
        </View>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
          style={[styles.closeButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderStrong }]}
        >
          <X size={18} color={colors.foreground} />
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  handle: {
    alignSelf: "center",
    width: uiControl.handleWidth,
    height: uiControl.handleHeight,
    borderRadius: uiRadius.pill,
    marginTop: uiSpacing.xs,
    marginBottom: uiSpacing.lg
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: uiSpacing.sm
  },
  copy: {
    flex: 1,
    gap: uiSpacing.xs
  },
  title: {
    marginTop: 2
  },
  subtitle: {
    paddingRight: uiSpacing.sm
  },
  closeButton: {
    width: uiControl.minTouch,
    height: uiControl.minTouch,
    borderRadius: uiRadius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});
