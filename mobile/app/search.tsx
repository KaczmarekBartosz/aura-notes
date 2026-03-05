import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Search } from "lucide-react-native";
import { NoteCard } from "../src/components/notes/NoteCard";
import { ScreenContainer } from "../src/components/ui/ScreenContainer";
import { SurfaceCard } from "../src/components/ui/SurfaceCard";
import { useNotes } from "../src/state/NotesProvider";
import { useAppTheme } from "../src/theme/ThemeProvider";
import { filterAndSortNotes } from "../src/utils/noteFilters";
import { triggerHaptic } from "../src/utils/haptics";

export default function SearchScreen() {
  const { notes, toggleFavoriteById } = useNotes();
  const { colors } = useAppTheme();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return filterAndSortNotes(notes, {
      query,
      category: null,
      tag: null,
      sort: "updated_desc"
    });
  }, [notes, query]);

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            void triggerHaptic("light");
            router.back();
          }}
          style={[styles.backButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
        >
          <ArrowLeft size={18} color={colors.foreground} />
        </Pressable>

        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.foreground }]}>Search Vault</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Tytuły, treść, tagi i kategorie.</Text>
        </View>
      </View>

      <SurfaceCard style={styles.searchCard} contentStyle={styles.searchInner}>
        <Search size={16} color={colors.muted} />
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder="Szukaj w całym vault..."
          placeholderTextColor={colors.searchPlaceholder}
          style={[styles.searchInput, { color: colors.foreground }]}
        />
      </SurfaceCard>

      <FlatList
        style={styles.list}
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            query={query}
            onPress={(noteId) => {
              void triggerHaptic("light");
              router.push(`/reader/${noteId}`);
            }}
            onToggleFavorite={(noteId) => {
              void triggerHaptic("medium");
              void toggleFavoriteById(noteId);
            }}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <SurfaceCard style={styles.emptyCard} contentStyle={styles.emptyContent}>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {query.trim() ? "Brak wyników" : "Wpisz frazę do wyszukania"}
            </Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Wyniki pokażą się od razu po dopasowaniu w treści notatek.
            </Text>
          </SurfaceCard>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  headerCopy: {
    flex: 1
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.6
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "600"
  },
  searchCard: {
    marginTop: 16
  },
  searchInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500"
  },
  list: {
    flex: 1,
    marginTop: 16
  },
  listContent: {
    paddingBottom: 36
  },
  emptyCard: {
    marginTop: 56
  },
  emptyContent: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 8
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700"
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center"
  }
});
