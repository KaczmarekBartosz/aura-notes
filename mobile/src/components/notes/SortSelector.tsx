import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { SortMode } from "../../types/note";
import { useAppTheme } from "../../theme/ThemeProvider";

const SORT_OPTIONS: Array<{ id: SortMode; label: string }> = [
  { id: "updated_desc", label: "Najnowsze" },
  { id: "updated_asc", label: "Najstarsze" },
  { id: "title_asc", label: "A-Z" },
  { id: "created_desc", label: "Utw. ↓" },
  { id: "created_asc", label: "Utw. ↑" }
];

type SortSelectorProps = {
  value: SortMode;
  onChange: (value: SortMode) => void;
};

export function SortSelector({ value, onChange }: SortSelectorProps) {
  const { colors } = useAppTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.row}>
        {SORT_OPTIONS.map((option) => {
          const active = option.id === value;
          return (
            <Pressable
              key={option.id}
              onPress={() => onChange(option.id)}
              accessibilityRole="button"
              accessibilityLabel={`Sortuj: ${option.label}`}
              style={[
                styles.option,
                {
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primarySoft : colors.tagBackground
                }
              ]}
            >
              {active ? <LinearGradient colors={[...colors.activeGradient]} style={StyleSheet.absoluteFillObject} /> : null}
              <Text style={[styles.label, { color: active ? colors.primaryForeground : colors.foreground }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
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
  option: {
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
