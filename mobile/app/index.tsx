import { useEffect, useMemo, useState, type ReactNode } from "react";
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
const COMPACT_HEADER_HEIGHT = 74;
const HERO_TOP_SPACING = 94;

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
        count: filteredNotes.filter((note) => note.category === category).length,
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
      description: refreshing ? "odświeżam" : "offline ready",
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
          <View style={styles.heroRow}>
            <View style={styles.heroCopy}>
              <View style={[styles.eyebrowPill, { backgroundColor: colors.tagBackground, borderColor: colors.borderStrong }]}>
                <Sparkles size={12} color={colors.primary} />
                <Text style={[styles.eyebrowText, { color: colors.primary }]}>{themeLabel}</Text>
              </View>
              <Text style={[styles.heroTitle, { color: colors.foreground }]}>Aura Notes</Text>
              <Text style={[styles.heroSubtitle, { color: colors.muted }]}>
                Lokalny markdown vault z offline cache, szybkim czytnikiem i motywami klasy premium.
              </Text>
              <Text style={[styles.heroDescription, { color: colors.subtle }]}>{themeDescription}</Text>
            </View>

            <View style={styles.heroActionsColumn}>
              <HeaderIconButton
                icon={<Search size={18} color={colors.foreground} />}
                label="Otwórz pełny ekran wyszukiwania"
                onPress={() => router.push("/search")}
              />
              <HeaderIconButton
                icon={<Settings2 size={18} color={colors.foreground} />}
                label="Otwórz ustawienia"
                onPress={() => router.push("/settings")}
              />
            </View>
          </View>

          <SurfaceCard style={styles.heroCard} contentStyle={styles.heroCardContent} intensity={resolvedTheme === "dark" ? 58 : 54}>
            <LinearGradient colors={[...colors.activeGradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroAccent} />
            <View style={styles.heroCardTopRow}>
              <View style={styles.heroBadgeRow}>
                <View style={[styles.heroBadge, { backgroundColor: colors.tagBackground, borderColor: colors.border }]}> 
                  <Text style={[styles.heroBadgeLabel, { color: colors.foreground }]}>{notes.length} notatek</Text>
                </View>
                <View style={[styles.heroBadge, { backgroundColor: colors.tagBackground, borderColor: colors.border }]}> 
                  <Text style={[styles.heroBadgeLabel, { color: colors.foreground }]}>źródło {SOURCE_LABELS[source] ?? source}</Text>
                </View>
              </View>

              {lastOpenedNote ? (
                <Pressable
                  onPress={() => void openNote(lastOpenedNote.id)}
                  accessibilityRole="button"
                  accessibilityLabel="Kontynuuj ostatnio czytaną notatkę"
                  style={[styles.inlineContinueButton, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}
                >
                  <Text style={[styles.inlineContinueLabel, { color: colors.primary }]}>Kontynuuj</Text>
                  <ChevronRight size={14} color={colors.primary} />
                </Pressable>
              ) : null}
            </View>

            {lastOpenedNote ? (
              <View style={styles.continueCopy}>
                <Text style={[styles.continueEyebrow, { color: colors.primary }]}>Continue Reading</Text>
                <Text style={[styles.continueTitle, { color: colors.foreground }]} numberOfLines={2}>
                  {lastOpenedNote.title}
                </Text>
                <Text style={[styles.continueBody, { color: colors.muted }]} numberOfLines={2}>
                  {lastOpenedNote.excerpt}
                </Text>
              </View>
            ) : (
              <View style={styles.continueCopy}>
                <Text style={[styles.continueEyebrow, { color: colors.primary }]}>Vault Ready</Text>
                <Text style={[styles.continueTitle, { color: colors.foreground }]}>Wszystkie notatki są gotowe offline.</Text>
                <Text style={[styles.continueBody, { color: colors.muted }]}>Pierwsze wejście ma od razu pokazać zawartość z lokalnego cache.</Text>
              </View>
            )}
          </SurfaceCard>

          <View style={styles.statsRow}>
            {stats.map((item, index) => (
              <Animated.View
                key={item.label}
                style={styles.statWrap}
                entering={reduceMotionEnabled ? undefined : FadeInDown.delay(80 + index * 60).duration(320)}
                layout={layoutTransition}
              >
                <SurfaceCard contentStyle={styles.statCardContent}>
                  <View style={styles.statTopRow}>
                    {item.icon}
                    <Text style={[styles.statLabel, { color: colors.muted }]}>{item.label}</Text>
                  </View>
                  <Text style={[styles.statValue, { color: colors.foreground }]}>{item.value}</Text>
                  <Text style={[styles.statDescription, { color: colors.subtle }]}>{item.description}</Text>
                </SurfaceCard>
              </Animated.View>
            ))}
          </View>
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
                        query={query}
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
    gap: 16
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16
  },
  heroCopy: {
    flex: 1,
    gap: 6
  },
  eyebrowPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginBottom: 4
  },
  eyebrowText: {
    fontSize: 12,
    fontWeight: "800"
  },
  heroTitle: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "800",
    letterSpacing: -1.2
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600"
  },
  heroDescription: {
    fontSize: 12,
    lineHeight: 18
  },
  heroActionsColumn: {
    gap: 10,
    paddingTop: 4
  },
  headerAction: {
    width: 46,
    height: 46,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  headerActionCompact: {
    width: 40,
    height: 40
  },
  heroCard: {
    marginTop: 4
  },
  heroCardContent: {
    padding: 18,
    gap: 14
  },
  heroAccent: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 999,
    opacity: 0.28
  },
  heroCardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  heroBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    flex: 1
  },
  heroBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  heroBadgeLabel: {
    fontSize: 11,
    fontWeight: "800"
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
    fontSize: 12,
    fontWeight: "800"
  },
  continueCopy: {
    gap: 6
  },
  continueEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  continueTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
    letterSpacing: -0.6
  },
  continueBody: {
    fontSize: 14,
    lineHeight: 20
  },
  statsRow: {
    flexDirection: "row",
    gap: 12
  },
  statWrap: {
    flex: 1
  },
  statCardContent: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 8,
    minHeight: 120
  },
  statTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "700"
  },
  statValue: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "800",
    letterSpacing: -0.5
  },
  statDescription: {
    fontSize: 12,
    lineHeight: 18
  },
  searchCard: {
    marginTop: 4
  },
  searchContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
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
    padding: 16
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
    fontSize: 15,
    lineHeight: 21,
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
    paddingVertical: 16,
    gap: 12
  },
  sectionShellTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.4,
    paddingHorizontal: 16
  },
  sectionShellCaption: {
    fontSize: 13,
    lineHeight: 19,
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
  feedHeader: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  feedTitle: {
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.7
  },
  feedCaption: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "600"
  },
  feedCountPill: {
    minWidth: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12
  },
  feedCountText: {
    fontSize: 14,
    fontWeight: "800"
  },
  emptyCard: {
    marginTop: 8
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
  sectionBlock: {
    gap: 12
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 4
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
    fontWeight: "800"
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: "800"
  },
  noteStack: {
    gap: 12
  },
  footerWrap: {
    paddingTop: 10,
    paddingBottom: 8,
    alignItems: "center"
  },
  loadMoreButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 13
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
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  compactHeaderTitleWrap: {
    flex: 1
  },
  compactHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.4
  },
  compactHeaderMeta: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600"
  },
  compactHeaderActions: {
    flexDirection: "row",
    gap: 8
  }
});
