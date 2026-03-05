import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../../theme/ThemeProvider";

type TagChipsProps = {
  tags: string[];
  activeTag: string | null;
  onSelect: (tag: string | null) => void;
};

export function TagChips({ tags, activeTag, onSelect }: TagChipsProps) {
  const { colors } = useAppTheme();

  if (tags.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.row}>
        <TagChip label="Wszystkie tagi" active={activeTag === null} onPress={() => onSelect(null)} colors={colors} />
        {tags.map((tag) => (
          <TagChip
            key={tag}
            label={`#${tag}`}
            active={activeTag === tag}
            onPress={() => onSelect(tag)}
            colors={colors}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function TagChip({
  label,
  active,
  onPress,
  colors
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Filtruj po tagu ${label}`}
      style={[
        styles.chip,
        {
          borderColor: active ? colors.primary : colors.border,
          backgroundColor: active ? colors.primarySoft : colors.tagBackground
        }
      ]}
    >
      {active ? <LinearGradient colors={[...colors.activeGradient]} style={StyleSheet.absoluteFillObject} /> : null}
      <Text style={[styles.label, { color: active ? colors.primaryForeground : colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingRight: 16
  },
  row: {
    flexDirection: "row",
    gap: 10
  },
  chip: {
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: "center"
  },
  label: {
    position: "relative",
    zIndex: 1,
    fontSize: 12,
    fontWeight: "700"
  }
});
