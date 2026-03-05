import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { router } from "expo-router";
import { Search, Settings2, Sparkles, Star } from "lucide-react-native";
import { CategoryChips } from "../src/components/notes/CategoryChips";
import { NoteCard } from "../src/components/notes/NoteCard";
import { SortSelector } from "../src/components/notes/SortSelector";
import { TagChips } from "../src/components/notes/TagChips";
import { ScreenContainer } from "../src/components/ui/ScreenContainer";
import { SurfaceCard } from "../src/components/ui/SurfaceCard";
import { getCategoryIcon, getCategoryLabel } from "../src/constants/categories";
import { useNotes } from "../src/state/NotesProvider";
import { readLastOpenedNoteId, saveLastOpenedNoteId } from "../src/state/readerState";
import { useAppTheme } from "../src/theme/ThemeProvider";
import type { Note, SortMode } from "../src/types/note";
import { filterAndSortNotes, getAllTags } from "../src/utils/noteFilters";
import { triggerHaptic } from "../src/utils/haptics";

const PAGE_SIZE = 24;

const SOURCE_LABELS: Record<string, string> = {
  boot: "start",
  api: "api",
  cache: "cache",
  bundled: "bundled",
  seed: "seed"
};

type NoteSection = {
  key: string;
  title: string;
  count: number;
  data: Note[];
};

export default function HomeScreen() {
  const { notes, loading, refreshing, refresh, toggleFavoriteById, source, error } = useNotes();
  const { colors, themeLabel, themeDescription, resolvedTheme } = useAppTheme();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("updated_desc");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [lastOpenedId, setLastOpenedId] = useState<string | null>(null);

  const availableTags = useMemo(() => getAllTags(notes, activeCategory), [notes, activeCategory]);

  const filteredNotes = useMemo(
    () =>
      filterAndSortNotes(notes, {
        query,
        category: activeCategory,
        tag: activeTag,
        sort,
        onlyFavorites
      }),
    [notes, query, activeCategory, activeTag, sort, onlyFavorites]
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, activeCategory, activeTag, sort, onlyFavorites]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const last = await readLastOpenedNoteId();
      if (mounted) {
        setLastOpenedId(last);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const hasMore = visibleCount < filteredNotes.length;
  const lastOpenedNote = useMemo(
    () => (lastOpenedId ? notes.find((note) => note.id === lastOpenedId) ?? null : null),
    [lastOpenedId, notes]
  );

  const openNote = async (noteId: string) => {
    await triggerHaptic("light");
    await saveLastOpenedNoteId(noteId);
    setLastOpenedId(noteId);
    router.push(`/reader/${noteId}`);
  };

  const groupedSections = useMemo<NoteSection[]>(() => {
    const grouped = new Map<string, Note[]>();
    for (const note of filteredNotes) {
      const current = grouped.get(note.category) ?? [];
      current.push(note);
      grouped.set(note.category, current);
    }

    return [...grouped.entries()]
      .sort((a, b) => getCategoryLabel(a[0]).localeCompare(getCategoryLabel(b[0]), "pl"))
      .map(([category, data]) => ({
        key: category,
        title: getCategoryLabel(category),
        count: data.length,
        data
      }));
  }, [filteredNotes]);

  const sections = useMemo<NoteSection[]>(() => {
    let remaining = visibleCount;
    const nextSections: NoteSection[] = [];

    for (const section of groupedSections) {
      if (remaining <= 0) break;
      const data = section.data.slice(0, remaining);
      if (data.length > 0) {
        nextSections.push({
          ...section,
          data
        });
        remaining -= data.length;
      }
    }

    return nextSections;
  }, [groupedSections, visibleCount]);

  return (
    <ScreenContainer contentStyle={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <View style={[styles.eyebrowPill, { backgroundColor: colors.tagBackground, borderColor: colors.border }]}>
            <Sparkles size={12} color={colors.primary} />
            <Text style={[styles.eyebrowText, { color: colors.primary }]}>{themeLabel}</Text>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Aura Notes</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {loading ? "Ładowanie notatek..." : `${filteredNotes.length} notatek • źródło: ${SOURCE_LABELS[source] ?? source}`}
          </Text>
          <Text style={[styles.themeDescription, { color: colors.subtle }]}>{themeDescription}</Text>
        </View>

        <View style={styles.headerActions}>
          <HeaderIconButton
            icon={<Search size={18} color={colors.foreground} />}
            label="Otwórz wyszukiwarkę"
            onPress={() => router.push("/search")}
          />
          <HeaderIconButton
            icon={<Settings2 size={18} color={colors.foreground} />}
            label="Otwórz ustawienia"
            onPress={() => router.push("/settings")}
          />
        </View>
      </View>

      {lastOpenedNote ? (
        <SurfaceCard
          onPress={() => void openNote(lastOpenedNote.id)}
          accessibilityRole="button"
          accessibilityLabel="Kontynuuj ostatnio czytaną notatkę"
          style={styles.topCard}
          contentStyle={styles.topCardContent}
        >
          <Text style={[styles.cardOverline, { color: colors.primary }]}>Continue Reading</Text>
          <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={1}>
            {lastOpenedNote.title}
          </Text>
          <Text style={[styles.cardBody, { color: colors.muted }]} numberOfLines={2}>
            {lastOpenedNote.excerpt}
          </Text>
        </SurfaceCard>
      ) : null}

      <SurfaceCard style={styles.topCard} contentStyle={styles.searchCard}>
        <Search size={16} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Szukaj full-text w całym vault..."
          placeholderTextColor={colors.searchPlaceholder}
          style={[styles.searchInput, { color: colors.foreground }]}
          returnKeyType="search"
        />
      </SurfaceCard>

      <View style={styles.filtersBlock}>
        <CategoryChips
          notes={notes}
          activeCategory={activeCategory}
          onSelect={(category) => {
            void triggerHaptic("light");
            setActiveCategory(category);
            setActiveTag(null);
          }}
        />
      </View>

      <View style={styles.filtersBlock}>
        <TagChips
          tags={availableTags}
          activeTag={activeTag}
          onSelect={(nextTag) => {
            void triggerHaptic("light");
            setActiveTag(nextTag);
          }}
        />
      </View>

      <View style={styles.utilityRow}>
        <SortSelector
          value={sort}
          onChange={(nextSort) => {
            void triggerHaptic("light");
            setSort(nextSort);
          }}
        />

        <Pressable
          onPress={() => {
            void triggerHaptic("light");
            setOnlyFavorites((current) => !current);
          }}
          style={[
            styles.favoriteFilter,
            {
              borderColor: onlyFavorites ? colors.primary : colors.border,
              backgroundColor: onlyFavorites ? colors.primarySoft : colors.tagBackground
            }
          ]}
          accessibilityRole="button"
          accessibilityLabel={onlyFavorites ? "Wyłącz filtr ulubionych" : "Włącz filtr ulubionych"}
        >
          <Star
            size={13}
            color={onlyFavorites ? colors.primary : resolvedTheme === "dark" ? colors.foreground : colors.foreground}
            fill={onlyFavorites ? colors.primary : "none"}
          />
          <Text style={[styles.favoriteLabel, { color: onlyFavorites ? colors.primary : colors.foreground }]}>
            Ulubione
          </Text>
        </Pressable>
      </View>

      {!!error ? (
        <SurfaceCard style={styles.errorCard} contentStyle={styles.errorContent}>
          <Text style={[styles.errorTitle, { color: colors.destructive }]}>Synchronizacja nie powiodła się</Text>
          <Text style={[styles.errorText, { color: colors.muted }]}>{error}</Text>
        </SurfaceCard>
      ) : null}

      <SectionList
        style={styles.list}
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            refreshing={refreshing}
            onRefresh={() => {
              void triggerHaptic("light");
              void refresh();
            }}
          />
        }
        renderSectionHeader={({ section }) => {
          const Icon = getCategoryIcon(section.key);
          return (
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionBadge, { backgroundColor: colors.tagBackground, borderColor: colors.border }]}>
                <Icon size={13} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.title}</Text>
              </View>
              <Text style={[styles.sectionCount, { color: colors.subtle }]}>{section.count}</Text>
            </View>
          );
        }}
        renderItem={({ item }) => (
          <NoteCard
            note={item}
            query={query}
            onPress={(noteId) => {
              void openNote(noteId);
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
            {loading ? <ActivityIndicator color={colors.primary} /> : null}
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {loading ? "Ładowanie..." : "Brak wyników"}
            </Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              {loading
                ? "Pobieram notatki z cache lub API."
                : "Zmień frazę, kategorię, tag lub sortowanie, aby zawęzić wyniki."}
            </Text>
          </SurfaceCard>
        }
        ListFooterComponent={
          hasMore ? (
            <View style={styles.footerWrap}>
              <Pressable
                onPress={() => {
                  void triggerHaptic("light");
                  setVisibleCount((current) => current + PAGE_SIZE);
                }}
                style={[styles.loadMoreButton, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}
              >
                <Text style={[styles.loadMoreLabel, { color: colors.primary }]}>
                  Pokaż kolejne {Math.min(PAGE_SIZE, filteredNotes.length - visibleCount)}
                </Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    </ScreenContainer>
  );
}

function HeaderIconButton({
  icon,
  label,
  onPress
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={() => {
        void triggerHaptic("light");
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.headerAction, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 6
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16
  },
  headerCopy: {
    flex: 1,
    gap: 4
  },
  eyebrowPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6
  },
  eyebrowText: {
    fontSize: 12,
    fontWeight: "700"
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "800",
    letterSpacing: -1.1
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "600"
  },
  themeDescription: {
    fontSize: 12,
    lineHeight: 17
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 4
  },
  headerAction: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  topCard: {
    marginTop: 16
  },
  topCardContent: {
    padding: 16
  },
  cardOverline: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  cardTitle: {
    marginTop: 6,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700"
  },
  cardBody: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20
  },
  searchCard: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500"
  },
  filtersBlock: {
    marginTop: 14
  },
  utilityRow: {
    marginTop: 14,
    gap: 12
  },
  favoriteFilter: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  favoriteLabel: {
    fontSize: 12,
    fontWeight: "700"
  },
  errorCard: {
    marginTop: 14
  },
  errorContent: {
    padding: 16
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "700"
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19
  },
  list: {
    flex: 1,
    marginTop: 16
  },
  listContent: {
    paddingBottom: 48
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 8
  },
  sectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700"
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: "700"
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
  },
  footerWrap: {
    paddingVertical: 18,
    alignItems: "center"
  },
  loadMoreButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  loadMoreLabel: {
    fontSize: 12,
    fontWeight: "800"
  }
});
