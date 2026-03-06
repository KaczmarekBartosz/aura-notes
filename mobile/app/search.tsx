import { useDeferredValue, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Search, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { NoteCard } from "../src/components/notes/NoteCard";
import { ScreenContainer } from "../src/components/ui/ScreenContainer";
import { SurfaceCard } from "../src/components/ui/SurfaceCard";
import { useNotes } from "../src/state/NotesProvider";
import { useAppTheme } from "../src/theme/ThemeProvider";
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
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <FlatList
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        data={results}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: Math.max(44, insets.bottom + 24) }]}
        ListHeaderComponent={
          <Animated.View entering={reduceMotionEnabled ? undefined : FadeInDown.duration(320)}>
            <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={[styles.title, { color: colors.foreground }]}>Szukaj w vault</Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>Tytuły, treść, tagi i kategorie. Wyniki pojawiają się natychmiast.</Text>
              </View>
              <Pressable
                onPress={() => {
                  void triggerHaptic("light");
                  router.back();
                }}
                accessibilityRole="button"
                accessibilityLabel="Zamknij wyszukiwarkę"
                style={[styles.closeButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderStrong }]}
              >
                <X size={18} color={colors.foreground} />
              </Pressable>
            </View>

            <SurfaceCard style={styles.searchCard} contentStyle={styles.searchInner} intensity={56}>
              <Search size={18} color={colors.muted} />
              <TextInput
                autoFocus
                value={query}
                onChangeText={setQuery}
                placeholder="Szukaj w całym vault..."
                placeholderTextColor={colors.searchPlaceholder}
                style={[styles.searchInput, { color: colors.foreground }]}
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
            </SurfaceCard>

            <SurfaceCard style={styles.summaryCard} contentStyle={styles.summaryContent}>
              <Text style={[styles.summaryEyebrow, { color: colors.primary }]}>Wyszukiwanie</Text>
              <Text style={[styles.summaryTitle, { color: colors.foreground }]}>
                {query.trim() ? `${results.length} dopasowań` : "Wpisz frazę, żeby przeszukać cały vault"}
              </Text>
              <Text style={[styles.summaryText, { color: colors.muted }]}>Notatki otwierają się bezpośrednio w readerze i zachowują ulubione.</Text>
            </SurfaceCard>
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
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <SurfaceCard style={styles.emptyCard} contentStyle={styles.emptyContent}>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{query.trim() ? "Brak wyników" : "Zacznij od frazy"}</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              {query.trim()
                ? "Spróbuj innego słowa, tagu albo kategorii. Search działa na treści całego vaultu."
                : "Reader i lista zostają czyste, dlatego search siedzi w osobnym sheetcie."}
            </Text>
          </SurfaceCard>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: 8
  },
  handle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 999,
    marginTop: 2,
    marginBottom: 18
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12
  },
  headerCopy: {
    flex: 1
  },
  title: {
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: -0.8
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600"
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  searchCard: {
    marginTop: 18
  },
  searchInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600"
  },
  clearButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  summaryCard: {
    marginTop: 14,
    marginBottom: 18
  },
  summaryContent: {
    padding: 16,
    gap: 6
  },
  summaryEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  summaryTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800",
    letterSpacing: -0.4
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 19
  },
  emptyCard: {
    marginTop: 12
  },
  emptyContent: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 8
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center"
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center"
  }
});
