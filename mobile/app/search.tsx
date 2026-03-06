import { useDeferredValue, useMemo, useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Search, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { NoteCard } from "../src/components/notes/NoteCard";
import { ScreenContainer } from "../src/components/ui/ScreenContainer";
import { ScreenHeader } from "../src/components/ui/ScreenHeader";
import { SectionBlock } from "../src/components/ui/SectionBlock";
import { SurfaceCard } from "../src/components/ui/SurfaceCard";
import { useNotes } from "../src/state/NotesProvider";
import { useAppTheme } from "../src/theme/ThemeProvider";
import { uiControl, uiSpacing, uiType } from "../src/theme/ui";
import { filterAndSortNotes } from "../src/utils/noteFilters";
import { triggerHaptic } from "../src/utils/haptics";

export default function SearchScreen() {
  const { notes, toggleFavoriteById } = useNotes();
  const { colors, reduceMotionEnabled } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(() => {
    if (!deferredQuery.trim()) return [];
    return filterAndSortNotes(notes, {
      query: deferredQuery,
      category: null,
      tag: null,
      sort: "updated_desc"
    });
  }, [notes, deferredQuery]);

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <FlatList
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        data={results}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(uiControl.minTouch, insets.bottom + uiSpacing.xl) }
        ]}
        ListHeaderComponent={
          <Animated.View entering={reduceMotionEnabled ? undefined : FadeInDown.duration(320)} style={styles.headerStack}>
            <ScreenHeader
              title="Szukaj w vault"
              subtitle="Tytuły, treść, tagi i kategorie. Wyniki pojawiają się natychmiast i otwierają się bezpośrednio w readerze."
              closeLabel="Zamknij wyszukiwarkę"
              onClose={() => {
                void triggerHaptic("light");
                router.back();
              }}
            />

            <SurfaceCard preset="section" contentPreset="section" intensity={56}>
              <View style={styles.searchRow}>
                <Search size={18} color={colors.muted} />
                <TextInput
                  autoFocus={Platform.OS !== "web"}
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Szukaj w całym vault..."
                  placeholderTextColor={colors.searchPlaceholder}
                  style={[uiType.bodyStrong, styles.searchInput, { color: colors.foreground }]}
                  accessibilityLabel="Szukaj w całym vault"
                  returnKeyType="search"
                />
                {query.trim() ? (
                  <Pressable
                    onPress={() => setQuery("")}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel="Wyczyść frazę wyszukiwania"
                    style={[styles.clearButton, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}
                  >
                    <X size={14} color={colors.primary} />
                  </Pressable>
                ) : null}
              </View>
            </SurfaceCard>

            <SectionBlock
              eyebrow="Wyszukiwanie"
              title={query.trim() ? `${results.length} dopasowań` : "Wpisz frazę, żeby przeszukać cały vault"}
              description="Wyniki są ułożone od najnowszych aktualizacji, dzięki czemu najświeższe notatki trafiają od razu na górę."
            />
          </Animated.View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={reduceMotionEnabled ? undefined : FadeInDown.delay(50 + index * 18).duration(240)}>
            <NoteCard
              note={item}
              query={deferredQuery}
              onPress={(noteId) => {
                void triggerHaptic("light");
                router.push(`/reader/${noteId}`);
              }}
              onToggleFavorite={(noteId) => {
                void triggerHaptic("medium");
                void toggleFavoriteById(noteId);
              }}
            />
          </Animated.View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: uiSpacing.md }} />}
        ListEmptyComponent={
          <SectionBlock
            preset="compact"
            title={query.trim() ? "Brak wyników" : "Zacznij od frazy"}
            description={
              query.trim()
                ? "Spróbuj innego słowa, tagu albo kategorii. Search działa na treści całego vaultu."
                : "Reader i lista zostają czyste, dlatego search siedzi w osobnym sheetcie."
            }
            contentStyle={styles.emptyContent}
          />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: uiSpacing.xs,
    paddingHorizontal: uiSpacing.lg
  },
  headerStack: {
    gap: uiSpacing.md,
    marginBottom: uiSpacing.xl
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: uiSpacing.sm
  },
  searchInput: {
    flex: 1
  },
  clearButton: {
    width: uiControl.minTouch,
    height: uiControl.minTouch,
    borderRadius: uiControl.minTouch,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyContent: {
    alignItems: "center"
  }
});
