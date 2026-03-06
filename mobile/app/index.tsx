import { useDeferredValue, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { router } from "expo-router";
import {
  BookOpenText,
  ChevronRight,
  DatabaseBackup,
  RefreshCw,
  Search,
  Settings2,
  Sparkles,
  Star,
  X
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Extrapolation,
  FadeInDown,
  LinearTransition,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";
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
import { formatRelativeDate } from "../src/utils/date";
import { filterAndSortNotes, getAllTags } from "../src/utils/noteFilters";
import { triggerHaptic } from "../src/utils/haptics";

const PAGE_SIZE = 18;
const COMPACT_HEADER_HEIGHT = 68;
const HERO_TOP_SPACING = 82;

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
  const { notes, loading, refreshing, refresh, toggleFavoriteById, source, error, cacheInfo } = useNotes();
  const { colors, themeLabel, themeDescription, resolvedTheme, reduceMotionEnabled } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>("updated_desc");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [lastOpenedId, setLastOpenedId] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  const scrollY = useSharedValue(0);
  const layoutTransition = reduceMotionEnabled
    ? undefined
    : LinearTransition.springify().damping(20).stiffness(170).mass(0.7);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const compactHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [24, 120], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, 120], [-16, 0], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateY }]
    };
  });

  const heroStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, 180], [0, -18], Extrapolation.CLAMP);
    const opacity = interpolate(scrollY.value, [0, 210], [1, 0.92], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateY }]
    };
  });

  const availableTags = useMemo(() => getAllTags(notes, activeCategory), [notes, activeCategory]);

  const filteredNotes = useMemo(
    () =>
      filterAndSortNotes(notes, {
        query: deferredQuery,
        category: activeCategory,
        tag: activeTag,
        sort,
        onlyFavorites
      }),
    [notes, deferredQuery, activeCategory, activeTag, sort, onlyFavorites]
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

  const favoriteCount = useMemo(() => notes.filter((note) => note.isFavorite).length, [notes]);
  const categoryCount = useMemo(
    () => new Set(notes.filter((note) => note.category !== "system" && note.category !== "other").map((note) => note.category)).size,
    [notes]
  );

  const visibleNotes = useMemo(() => filteredNotes.slice(0, visibleCount), [filteredNotes, visibleCount]);
  const hasMore = visibleCount < filteredNotes.length;
  const lastOpenedNote = useMemo(
    () => (lastOpenedId ? notes.find((note) => note.id === lastOpenedId) ?? null : null),
    [lastOpenedId, notes]
  );

  const sections = useMemo<NoteSection[]>(() => {
    const sectionCounts = new Map<string, number>();
    for (const note of filteredNotes) {
      sectionCounts.set(note.category, (sectionCounts.get(note.category) ?? 0) + 1);
    }

    const grouped = new Map<string, Note[]>();
    for (const note of visibleNotes) {
      const current = grouped.get(note.category) ?? [];
      current.push(note);
      grouped.set(note.category, current);
    }

    return [...grouped.entries()]
      .sort((a, b) => getCategoryLabel(a[0]).localeCompare(getCategoryLabel(b[0]), "pl"))
      .map(([category, data]) => ({
        key: category,
        title: getCategoryLabel(category),
        count: sectionCounts.get(category) ?? data.length,
        data
      }));
  }, [filteredNotes, visibleNotes]);

  const activeFilterCount = Number(Boolean(activeCategory)) + Number(Boolean(activeTag)) + Number(onlyFavorites) + Number(Boolean(query.trim()));
  const stats = [
    {
      label: "Vault",
      value: `${notes.length}`,
      description: source === "boot" ? "start" : SOURCE_LABELS[source] ?? source,
      icon: <DatabaseBackup size={14} color={colors.primary} />
    },
    {
      label: "Kategorie",
      value: `${categoryCount}`,
      description: `${favoriteCount} ulubionych`,
      icon: <BookOpenText size={14} color={colors.primary} />
    },
    {
      label: "Sync",
      value: cacheInfo.lastSyncedAt ? formatRelativeDate(cacheInfo.lastSyncedAt) : "brak",
      description: refreshing ? "odświeżam" : "offline",
      icon: <RefreshCw size={14} color={colors.primary} />
    }
  ];

  const openNote = async (noteId: string) => {
    await triggerHaptic("light");
    await saveLastOpenedNoteId(noteId);
    setLastOpenedId(noteId);
    router.push(`/reader/${noteId}`);
  };

  const clearFilters = () => {
    void triggerHaptic("soft");
    setQuery("");
    setActiveCategory(null);
    setActiveTag(null);
    setOnlyFavorites(false);
    setSort("updated_desc");
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]} withHorizontalPadding={false}>
      <Animated.ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: HERO_TOP_SPACING + insets.top,
            paddingBottom: Math.max(44, insets.bottom + 24),
            paddingHorizontal: 16
          }
        ]}
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            progressViewOffset={HERO_TOP_SPACING + 12}
            refreshing={refreshing}
            onRefresh={() => {
              void triggerHaptic("light");
              void refresh();
            }}
          />
        }
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={heroStyle}>
          <SurfaceCard style={styles.heroCard} contentStyle={styles.heroCardContent} intensity={resolvedTheme === "dark" ? 56 : 50}>
            <LinearGradient colors={[...colors.activeGradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroAccent} />
            <View style={styles.heroTopBar}>
              <View style={[styles.eyebrowPill, { backgroundColor: colors.tagBackground, borderColor: colors.borderStrong }]}>
                <Sparkles size={12} color={colors.primary} />
                <Text style={[styles.eyebrowText, { color: colors.primary }]}>{themeLabel}</Text>
              </View>
              <View style={styles.heroActionsRow}>
                <HeaderIconButton
                  icon={<Search size={17} color={colors.foreground} />}
                  label="Otwórz pełny ekran wyszukiwania"
                  onPress={() => router.push("/search")}
                />
                <HeaderIconButton
                  icon={<Settings2 size={17} color={colors.foreground} />}
                  label="Otwórz ustawienia"
                  onPress={() => router.push("/settings")}
                />
              </View>
            </View>

            <View style={styles.heroCopy}>
              <Text style={[styles.heroTitle, { color: colors.foreground }]}>Aura Notes</Text>
              <Text style={[styles.heroSubtitle, { color: colors.muted }]}>
                Lokalny vault markdown, szybkie czytanie i pełne działanie offline.
              </Text>
              <Text style={[styles.heroDescription, { color: colors.subtle }]}>{themeDescription}</Text>
            </View>

            <View style={[styles.continuePanel, { backgroundColor: colors.tagBackground, borderColor: colors.border }]}>
              <View style={styles.continueCopy}>
                <Text style={[styles.continueEyebrow, { color: colors.primary }]}>
                  {lastOpenedNote ? "Kontynuuj czytanie" : "Vault gotowy"}
                </Text>
                <Text style={[styles.continueTitle, { color: colors.foreground }]} numberOfLines={2}>
                  {lastOpenedNote ? lastOpenedNote.title : "Notatki są już gotowe do pracy offline."}
                </Text>
                <Text style={[styles.continueBody, { color: colors.muted }]} numberOfLines={2}>
                  {lastOpenedNote
                    ? lastOpenedNote.excerpt
                    : "Cache otwiera zawartość od razu, bez czekania na API."}
                </Text>
              </View>

              {lastOpenedNote ? (
                <Pressable
                  onPress={() => void openNote(lastOpenedNote.id)}
                  accessibilityRole="button"
                  accessibilityLabel="Kontynuuj ostatnio czytaną notatkę"
                  style={[styles.inlineContinueButton, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}
                >
                  <Text style={[styles.inlineContinueLabel, { color: colors.primary }]}>Otwórz</Text>
                  <ChevronRight size={14} color={colors.primary} />
                </Pressable>
              ) : (
                <View style={[styles.heroStatusPill, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}>
                  <Text style={[styles.heroStatusLabel, { color: colors.primary }]}>offline</Text>
                </View>
              )}
            </View>

            <View style={styles.heroMetricsRow}>
              {stats.map((item) => (
                <View
                  key={item.label}
                  style={[styles.heroMetric, { backgroundColor: colors.tagBackground, borderColor: colors.border }]}
                >
                  <View style={styles.heroMetricTop}>
                    {item.icon}
                    <Text style={[styles.heroMetricLabel, { color: colors.muted }]}>{item.label}</Text>
                  </View>
                  <Text style={[styles.heroMetricValue, { color: colors.foreground }]} numberOfLines={1}>
                    {item.value}
                  </Text>
                  <Text style={[styles.heroMetricDescription, { color: colors.subtle }]} numberOfLines={1}>
                    {item.description}
                  </Text>
                </View>
              ))}
            </View>
          </SurfaceCard>
        </Animated.View>

        <Animated.View layout={layoutTransition} entering={reduceMotionEnabled ? undefined : FadeInDown.delay(120).duration(340)}>
          <SurfaceCard style={styles.searchCard} contentStyle={styles.searchContent}>
            <Search size={18} color={colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Szukaj w tytułach, treści, tagach i kategoriach..."
              placeholderTextColor={colors.searchPlaceholder}
              style={[styles.searchInput, { color: colors.foreground }]}
              returnKeyType="search"
              accessibilityLabel="Wyszukaj notatkę"
            />
            {query.trim() ? (
              <Pressable
                onPress={() => setQuery("")}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Wyczyść frazę wyszukiwania"
                style={[styles.searchClear, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}
              >
                <X size={14} color={colors.primary} />
              </Pressable>
            ) : null}
          </SurfaceCard>
        </Animated.View>

        {activeFilterCount > 0 ? (
          <Animated.View layout={layoutTransition} entering={reduceMotionEnabled ? undefined : FadeInDown.delay(140).duration(340)}>
            <SurfaceCard style={styles.activeFiltersCard} contentStyle={styles.activeFiltersContent}>
              <View style={styles.activeFiltersCopy}>
                <Text style={[styles.activeFiltersEyebrow, { color: colors.primary }]}>Aktywne filtry</Text>
                <Text style={[styles.activeFiltersTitle, { color: colors.foreground }]}>
                  {filteredNotes.length} wyników po zastosowaniu {activeFilterCount} filtrów
                </Text>
              </View>
              <Pressable
                onPress={clearFilters}
                accessibilityRole="button"
                accessibilityLabel="Wyczyść wszystkie filtry"
                style={[styles.resetFiltersButton, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}
              >
                <Text style={[styles.resetFiltersLabel, { color: colors.primary }]}>Resetuj</Text>
              </Pressable>
            </SurfaceCard>
          </Animated.View>
        ) : null}

        <Animated.View layout={layoutTransition} entering={reduceMotionEnabled ? undefined : FadeInDown.delay(160).duration(340)}>
          <SectionShell title="Kategorie" caption="Przesuwaj poziomo, żeby szybko zawęzić vault.">
            <CategoryChips
              notes={notes}
              activeCategory={activeCategory}
              onSelect={(category) => {
                void triggerHaptic("selection");
                setActiveCategory(category);
                setActiveTag(null);
              }}
            />
          </SectionShell>
        </Animated.View>

        <Animated.View layout={layoutTransition} entering={reduceMotionEnabled ? undefined : FadeInDown.delay(180).duration(340)}>
          <SectionShell title="Tagi" caption="Filtr pełnotekstowy i tagi działają razem.">
            <TagChips
              tags={availableTags}
              activeTag={activeTag}
              onSelect={(nextTag) => {
                void triggerHaptic("selection");
                setActiveTag(nextTag);
              }}
            />
          </SectionShell>
        </Animated.View>

        <Animated.View layout={layoutTransition} entering={reduceMotionEnabled ? undefined : FadeInDown.delay(200).duration(340)}>
          <SectionShell title="Widok" caption="Sortowanie i ulubione bez resetu scrolla.">
            <View style={styles.utilityStack}>
              <SortSelector
                value={sort}
                onChange={(nextSort) => {
                  void triggerHaptic("selection");
                  setSort(nextSort);
                }}
              />
              <Pressable
                onPress={() => {
                  void triggerHaptic(onlyFavorites ? "soft" : "rigid");
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
                  size={14}
                  color={onlyFavorites ? colors.primary : colors.foreground}
                  fill={onlyFavorites ? colors.primary : "none"}
                />
                <Text style={[styles.favoriteLabel, { color: onlyFavorites ? colors.primary : colors.foreground }]}>Tylko ulubione</Text>
              </Pressable>
            </View>
          </SectionShell>
        </Animated.View>

        {!!error ? (
          <Animated.View layout={layoutTransition}>
            <SurfaceCard style={styles.errorCard} contentStyle={styles.errorContent}>
              <Text style={[styles.errorTitle, { color: colors.destructive }]}>Synchronizacja nie powiodła się</Text>
              <Text style={[styles.errorText, { color: colors.muted }]}>{error}</Text>
            </SurfaceCard>
          </Animated.View>
        ) : null}

        <View style={styles.feedHeader}>
          <View>
            <Text style={[styles.feedTitle, { color: colors.foreground }]}>Twoje notatki</Text>
            <Text style={[styles.feedCaption, { color: colors.muted }]}>Grupowane po kategoriach, gotowe offline.</Text>
          </View>
          <View style={[styles.feedCountPill, { backgroundColor: colors.tagBackground, borderColor: colors.border }]}> 
            <Text style={[styles.feedCountText, { color: colors.foreground }]}>{filteredNotes.length}</Text>
          </View>
        </View>

        {loading && notes.length === 0 ? (
          <SurfaceCard style={styles.emptyCard} contentStyle={styles.emptyContent}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Ładowanie vaultu</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>Pobieram notatki z lokalnego cache lub API.</Text>
          </SurfaceCard>
        ) : sections.length === 0 ? (
          <SurfaceCard style={styles.emptyCard} contentStyle={styles.emptyContent}>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Brak wyników</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>Zmień frazę, kategorię, tag lub sortowanie, aby zobaczyć notatki.</Text>
          </SurfaceCard>
        ) : (
          sections.map((section, sectionIndex) => {
            const Icon = getCategoryIcon(section.key);
            return (
              <Animated.View
                key={section.key}
                layout={layoutTransition}
                entering={reduceMotionEnabled ? undefined : FadeInDown.delay(220 + sectionIndex * 40).duration(340)}
                style={styles.sectionBlock}
              >
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionBadge, { backgroundColor: colors.tagBackground, borderColor: colors.borderStrong }]}> 
                    <Icon size={14} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.title}</Text>
                  </View>
                  <Text style={[styles.sectionCount, { color: colors.subtle }]}>{section.count}</Text>
                </View>

                <View style={styles.noteStack}>
                  {section.data.map((note) => (
                    <View key={note.id}>
                      <NoteCard
                        note={note}
                        query={deferredQuery}
                        onPress={(noteId) => {
                          void openNote(noteId);
                        }}
                        onToggleFavorite={(noteId) => {
                          void triggerHaptic("medium");
                          void toggleFavoriteById(noteId);
                        }}
                      />
                    </View>
                  ))}
                </View>
              </Animated.View>
            );
          })
        )}

        {hasMore ? (
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
        ) : null}
      </Animated.ScrollView>

      <Animated.View
        pointerEvents="box-none"
        style={[styles.compactHeaderWrap, { top: Math.max(8, insets.top + 4), left: 16, right: 16 }, compactHeaderStyle]}
      >
        <SurfaceCard contentStyle={styles.compactHeaderContent} intensity={resolvedTheme === "dark" ? 62 : 56}>
          <View style={styles.compactHeaderTitleWrap}>
            <Text style={[styles.compactHeaderTitle, { color: colors.foreground }]}>Aura Notes</Text>
            <Text style={[styles.compactHeaderMeta, { color: colors.muted }]}>
              {filteredNotes.length} notatek • {themeLabel}
            </Text>
          </View>
          <View style={styles.compactHeaderActions}>
            <HeaderIconButton
              compact
              icon={<Search size={16} color={colors.foreground} />}
              label="Otwórz pełny ekran wyszukiwania"
              onPress={() => router.push("/search")}
            />
            <HeaderIconButton
              compact
              icon={<Settings2 size={16} color={colors.foreground} />}
              label="Otwórz ustawienia"
              onPress={() => router.push("/settings")}
            />
          </View>
        </SurfaceCard>
      </Animated.View>
    </ScreenContainer>
  );
}

function SectionShell({
  title,
  caption,
  children
}: {
  title: string;
  caption: string;
  children: ReactNode;
}) {
  const { colors } = useAppTheme();
  return (
    <SurfaceCard style={styles.sectionShell} contentStyle={styles.sectionShellContent}>
      <Text style={[styles.sectionShellTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.sectionShellCaption, { color: colors.muted }]}>{caption}</Text>
      <View style={styles.sectionShellBody}>{children}</View>
    </SurfaceCard>
  );
}

function HeaderIconButton({
  icon,
  label,
  onPress,
  compact = false
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  compact?: boolean;
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
      style={[
        styles.headerAction,
        compact ? styles.headerActionCompact : undefined,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.borderStrong }
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 14
  },
  heroCard: {
    marginTop: 2
  },
  heroCardContent: {
    padding: 16,
    gap: 12
  },
  heroAccent: {
    position: "absolute",
    top: -52,
    right: -34,
    width: 164,
    height: 164,
    borderRadius: 999,
    opacity: 0.24
  },
  heroTopBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12
  },
  heroActionsRow: {
    flexDirection: "row",
    gap: 8
  },
  eyebrowPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: "800"
  },
  heroCopy: {
    gap: 6
  },
  heroTitle: {
    fontSize: 31,
    lineHeight: 35,
    fontWeight: "800",
    letterSpacing: -1
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600"
  },
  heroDescription: {
    fontSize: 11,
    lineHeight: 17
  },
  continuePanel: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    gap: 12,
    alignItems: "center"
  },
  continueCopy: {
    flex: 1,
    gap: 6
  },
  continueEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase"
  },
  continueTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    letterSpacing: -0.5
  },
  continueBody: {
    fontSize: 13,
    lineHeight: 18
  },
  inlineContinueButton: {
    borderWidth: 1,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  inlineContinueLabel: {
    fontSize: 11,
    fontWeight: "800"
  },
  heroStatusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8
  },
  heroStatusLabel: {
    fontSize: 11,
    fontWeight: "800"
  },
  heroMetricsRow: {
    flexDirection: "row",
    gap: 8
  },
  heroMetric: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 11,
    minHeight: 86
  },
  heroMetricTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  heroMetricLabel: {
    fontSize: 11,
    fontWeight: "700"
  },
  heroMetricValue: {
    marginTop: 7,
    fontSize: 17,
    lineHeight: 20,
    fontWeight: "800",
    letterSpacing: -0.4
  },
  heroMetricDescription: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 15
  },
  headerAction: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  headerActionCompact: {
    width: 38,
    height: 38
  },
  searchCard: {
    marginTop: 2
  },
  searchContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 15,
    paddingVertical: 13
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600"
  },
  searchClear: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  activeFiltersCard: {
    marginTop: -2
  },
  activeFiltersContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 15,
    paddingVertical: 14
  },
  activeFiltersCopy: {
    flex: 1,
    gap: 4
  },
  activeFiltersEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase"
  },
  activeFiltersTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700"
  },
  resetFiltersButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  resetFiltersLabel: {
    fontSize: 12,
    fontWeight: "800"
  },
  sectionShell: {},
  sectionShellContent: {
    paddingVertical: 14,
    gap: 10
  },
  sectionShellTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.3,
    paddingHorizontal: 16
  },
  sectionShellCaption: {
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 16
  },
  sectionShellBody: {
    gap: 2
  },
  utilityStack: {
    gap: 12
  },
  favoriteFilter: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginLeft: 16
  },
  favoriteLabel: {
    fontSize: 12,
    fontWeight: "800"
  },
  errorCard: {
    marginTop: -2
  },
  errorContent: {
    padding: 15
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "700"
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18
  },
  feedHeader: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5
  },
  feedCaption: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600"
  },
  feedCountPill: {
    minWidth: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10
  },
  feedCountText: {
    fontSize: 13,
    fontWeight: "800"
  },
  emptyCard: {
    marginTop: 6
  },
  emptyContent: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 26,
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
  sectionBlock: {
    gap: 10
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 2
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
    fontSize: 12,
    fontWeight: "800"
  },
  sectionCount: {
    fontSize: 11,
    fontWeight: "800"
  },
  noteStack: {
    gap: 10
  },
  footerWrap: {
    paddingTop: 8,
    paddingBottom: 8,
    alignItems: "center"
  },
  loadMoreButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12
  },
  loadMoreLabel: {
    fontSize: 12,
    fontWeight: "800"
  },
  compactHeaderWrap: {
    position: "absolute",
    zIndex: 50
  },
  compactHeaderContent: {
    minHeight: COMPACT_HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  compactHeaderTitleWrap: {
    flex: 1
  },
  compactHeaderTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.4
  },
  compactHeaderMeta: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "600"
  },
  compactHeaderActions: {
    flexDirection: "row",
    gap: 8
  }
});
