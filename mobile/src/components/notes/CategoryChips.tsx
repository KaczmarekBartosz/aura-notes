import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { Note } from "../../types/note";
import { getCategoryIcon, getCategoryLabel } from "../../constants/categories";
import { useAppTheme } from "../../theme/ThemeProvider";
import { uiControl, uiRadius, uiSpacing, uiType } from "../../theme/ui";

type CategoryChipsProps = {
  notes: Note[];
  activeCategory: string | null;
  onSelect: (category: string | null) => void;
};

export function CategoryChips({ notes, activeCategory, onSelect }: CategoryChipsProps) {
  const { colors } = useAppTheme();
  const categoryCounts = new Map<string, number>();

  notes
    .filter((note) => note.category !== "system" && note.category !== "other")
    .forEach((note) => {
      categoryCounts.set(note.category, (categoryCounts.get(note.category) ?? 0) + 1);
    });

  const categories = [...categoryCounts.entries()].sort((a, b) =>
    getCategoryLabel(a[0]).localeCompare(getCategoryLabel(b[0]), "pl")
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.row}>
        <CategoryChip
          label="Wszystkie"
          count={[...categoryCounts.values()].reduce((acc, value) => acc + value, 0)}
          active={activeCategory === null}
          onPress={() => onSelect(null)}
          colors={colors}
        />

        {categories.map(([category, count]) => {
          const Icon = getCategoryIcon(category);
          return (
            <CategoryChip
              key={category}
              label={getCategoryLabel(category)}
              count={count}
              active={activeCategory === category}
              onPress={() => onSelect(category)}
              icon={<Icon size={14} color={activeCategory === category ? colors.primaryForeground : colors.primary} />}
              colors={colors}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

function CategoryChip({
  label,
  count,
  active,
  onPress,
  colors,
  icon
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useAppTheme>["colors"];
  icon?: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Filtruj po kategorii ${label}`}
      style={[
        styles.chip,
        {
          borderColor: active ? colors.primary : colors.border,
          backgroundColor: active ? colors.primary : colors.tagBackground
        }
      ]}
    >
      {active ? <LinearGradient colors={[...colors.activeGradient]} style={StyleSheet.absoluteFillObject} /> : null}
      <View style={styles.content}>
        {icon ? icon : null}
        <Text numberOfLines={1} style={[uiType.meta, styles.label, { color: active ? colors.primaryForeground : colors.foreground }]}>
          {label}
        </Text>
        <View
          style={[
            styles.countBubble,
            {
              backgroundColor: active ? "rgba(255,255,255,0.18)" : colors.primarySoft
            }
          ]}
        >
          <Text style={[uiType.caption, styles.countText, { color: active ? colors.primaryForeground : colors.primary }]}>{count}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 0,
    paddingRight: uiSpacing.xs
  },
  row: {
    flexDirection: "row",
    gap: uiSpacing.xs
  },
  chip: {
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: uiRadius.pill,
    paddingHorizontal: uiSpacing.md,
    minHeight: uiControl.minTouch,
    justifyContent: "center"
  },
  content: {
    position: "relative",
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: uiSpacing.xs
  },
  label: {
    fontWeight: "700"
  },
  countBubble: {
    minWidth: 24,
    height: 24,
    borderRadius: uiRadius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6
  },
  countText: {
    fontWeight: "800"
  }
});
