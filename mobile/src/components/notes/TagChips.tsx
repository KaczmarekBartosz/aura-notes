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
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
  row: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 16
  },
  chip: {
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  label: {
    position: "relative",
    zIndex: 1,
    fontSize: 12,
    fontWeight: "700"
  }
});
