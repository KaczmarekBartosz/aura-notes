import { useDeferredValue, useEffect, useMemo, useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
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
import { ScreenContainer } from "../src/components/ui/ScreenContainer";
import { SectionBlock } from "../src/components/ui/SectionBlock";
import { SurfaceCard } from "../src/components/ui/SurfaceCard";
import { useNotes } from "../src/state/NotesProvider";
import { readLastOpenedNoteId, saveLastOpenedNoteId } from "../src/state/readerState";
import { useAppTheme } from "../src/theme/ThemeProvider";
import { uiControl, uiRadius, uiSpacing, uiType } from "../src/theme/ui";
import type { SortMode } from "../src/types/note";
import { formatRelativeDate } from "../src/utils/date";
import { filterAndSortNotes } from "../src/utils/noteFilters";
import { triggerHaptic } from "../src/utils/haptics";

const PAGE_SIZE = 18;
const HERO_TOP_SPACING = uiSpacing.md;

const SOURCE_LABELS: Record<string, string> = {
  boot: "start",
  api: "api",
  cache: "cache",
  bundled: "bundled",
  seed: "seed"
};

export default function HomeScreen() {
  const { notes, loading, refreshing, refresh, toggleFavoriteById, source, error, cacheInfo } = useNotes();
  const { colors, themeLabel, themeDescription, resolvedTheme, reduceMotionEnabled } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
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
    const translateY = interpolate(scrollY.value, [0, 180], [0, -16], Extrapolation.CLAMP);
    const opacity = interpolate(scrollY.value, [0, 210], [1, 0.95], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateY }]
    };
  });

  const filteredNotes = useMemo(
    () =>
      filterAndSortNotes(notes, {
        query: deferredQuery,
        category: activeCategory,
        tag: null,
        sort,
        onlyFavorites
      }),
    [notes, deferredQuery, activeCategory, sort, onlyFavorites]
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, activeCategory, sort, onlyFavorites]);

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

  const activeFilterCount = Number(Boolean(activeCategory)) + Number(onlyFavorites) + Number(Boolean(query.trim()));
  const stats = [
    {
      label: "Vault",
      value: `${notes.length}`,
      description: source === "boot" ? "start" : SOURCE_LABELS[source] ?? source,
      icon: <DatabaseBackup size={16} color={colors.primary} />
    },
    {
      label: "Kategorie",
      value: `${categoryCount}`,
      description: `${favoriteCount} ulubionych`,
      icon: <BookOpenText size={16} color={colors.primary} />
    },
    {
      label: "Sync",
      value: cacheInfo.lastSyncedAt ? formatRelativeDate(cacheInfo.lastSyncedAt) : "brak",
      description: refreshing ? "odświeżam" : "offline",
      icon: <RefreshCw size={16} color={colors.primary} />
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
    setOnlyFavorites(false);
    setSort("updated_desc");
  };

  const sortDescription = useMemo(() => {
    switch (sort) {
      case "updated_asc":
        return "Najstarsze aktualizacje na górze.";
      case "title_asc":
        return "Notatki uporządkowane alfabetycznie.";
      case "created_desc":
        return "Najnowsze utworzone notatki na górze.";
      case "created_asc":
        return "Najstarsze utworzone notatki na górze.";
      case "updated_desc":
      default:
        return "Najnowsze zmiany i aktualizacje na górze.";
    }
  }, [sort]);

  const browseDescription = activeFilterCount > 0 ? `${filteredNotes.length} wyników przy ${activeFilterCount} aktywnych filtrach.` : "Najpierw wybierz kategorię, potem dopracuj widok sortowaniem lub filtrem ulubionych.";

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]} withHorizontalPadding={false}>
      <Animated.ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: HERO_TOP_SPACING,
            paddingBottom: Math.max(uiControl.minTouch, insets.bottom + uiSpacing.xl),
            paddingHorizontal: uiSpacing.lg
          }
        ]}
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            progressViewOffset={HERO_TOP_SPACING + uiSpacing.sm}
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
          <View style={styles.heroStack}>
            <SurfaceCard preset="hero" contentPreset="hero" style={styles.leadCard} intensity={resolvedTheme === "dark" ? 56 : 50}>
              <LinearGradient colors={[...colors.activeGradient]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroAccent} />
              <View style={styles.heroTopBar}>
                <View style={[styles.eyebrowPill, { backgroundColor: colors.tagBackground, borderColor: colors.borderStrong }]}>
                  <Sparkles size={12} color={colors.primary} />
                  <Text style={[uiType.eyebrow, styles.eyebrowText, { color: colors.primary }]}>{themeLabel}</Text>
                </View>
                <View style={styles.heroActionsRow}>
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

              <View style={styles.heroCopy}>
                <Text style={[uiType.display, styles.heroTitle, { color: colors.foreground }]}>Aura Notes</Text>
                <Text style={[uiType.bodyStrong, { color: colors.muted }]}>Lokalny vault markdown, szybkie czytanie i pełne działanie offline.</Text>
                <Text style={[uiType.caption, { color: colors.subtle }]}>{themeDescription}</Text>
              </View>
            </SurfaceCard>

            <SurfaceCard preset="section" contentPreset="section" intensity={resolvedTheme === "dark" ? 54 : 48}>
              <View style={styles.continueRow}>
                <View style={styles.continueCopy}>
                  <Text style={[uiType.eyebrow, { color: colors.primary }]}>{lastOpenedNote ? "Kontynuuj czytanie" : "Vault gotowy"}</Text>
                  <Text style={[uiType.sectionTitle, { color: colors.foreground }]} numberOfLines={2}>
                    {lastOpenedNote ? lastOpenedNote.title : "Notatki są już gotowe do pracy offline."}
                  </Text>
                  <Text style={[uiType.body, { color: colors.muted }]} numberOfLines={2}>
                    {lastOpenedNote ? lastOpenedNote.excerpt : "Cache otwiera zawartość od razu, bez czekania na API."}
                  </Text>
                </View>

                {lastOpenedNote ? (
                  <Pressable
                    onPress={() => void openNote(lastOpenedNote.id)}
                    accessibilityRole="button"
                    accessibilityLabel="Kontynuuj ostatnio czytaną notatkę"
                    style={[styles.inlineContinueButton, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}
                  >
                    <Text style={[uiType.meta, styles.inlineContinueLabel, { color: colors.primary }]}>Otwórz</Text>
                    <ChevronRight size={15} color={colors.primary} />
                  </Pressable>
                ) : (
                  <View style={[styles.heroStatusPill, { backgroundColor: colors.primarySoft }]}> 
                    <Text style={[uiType.meta, styles.heroStatusLabel, { color: colors.primary }]}>offline</Text>
                  </View>
                )}
              </View>
            </SurfaceCard>

            <View style={styles.statsRow}>
              {stats.map((item) => (
                <SurfaceCard key={item.label} preset="compact" contentPreset="compact" style={styles.statCard}>
                  <View style={styles.statTop}>{item.icon}<Text style={[uiType.caption, { color: colors.muted }]}>{item.label}</Text></View>
                  <Text style={[uiType.statValue, styles.statValue, { color: colors.foreground }]} numberOfLines={1}>{item.value}</Text>
                  <Text style={[uiType.caption, styles.statDescription, { color: colors.subtle }]} numberOfLines={1}>{item.description}</Text>
                </SurfaceCard>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View layout={layoutTransition} entering={reduceMotionEnabled ? undefined : FadeInDown.delay(120).duration(340)}>
          <SurfaceCard preset="section" contentPreset="section">
            <View style={styles.searchRow}>
              <Search size={18} color={colors.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Szukaj w tytułach, treści i kategoriach..."
                placeholderTextColor={colors.searchPlaceholder}
                style={[uiType.bodyStrong, styles.searchInput, { color: colors.foreground }]}
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
            </View>
          </SurfaceCard>
        </Animated.View>

        <Animated.View layout={layoutTransition} entering={reduceMotionEnabled ? undefined : FadeInDown.delay(150).duration(340)}>
          <SectionBlock
            eyebrow="Przeglądaj"
            title="Kategorie i sortowanie"
            description={browseDescription}
            accessory={
              activeFilterCount > 0 ? (
                <Pressable
                  onPress={clearFilters}
                  accessibilityRole="button"
                  accessibilityLabel="Wyczyść wszystkie filtry"
                  style={[styles.resetFiltersButton, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}
                >
                  <Text style={[uiType.meta, styles.resetFiltersLabel, { color: colors.primary }]}>Resetuj</Text>
                </Pressable>
              ) : null
            }
          >
            <View style={styles.browserSection}>
              <Text style={[uiType.meta, styles.browserSectionLabel, { color: colors.muted }]}>Kategorie</Text>
              <CategoryChips
                notes={notes}
                activeCategory={activeCategory}
                onSelect={(category) => {
                  void triggerHaptic("selection");
                  setActiveCategory(category);
                }}
              />
            </View>

            <View style={styles.sortHeaderRow}>
              <Text style={[uiType.meta, { color: colors.muted }]}>Sortowanie</Text>
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
                <Star size={14} color={onlyFavorites ? colors.primary : colors.foreground} fill={onlyFavorites ? colors.primary : "none"} />
                <Text style={[uiType.meta, styles.favoriteLabel, { color: onlyFavorites ? colors.primary : colors.foreground }]}>Ulubione</Text>
              </Pressable>
            </View>

            <SortSelector
              value={sort}
              onChange={(nextSort) => {
                void triggerHaptic("selection");
                setSort(nextSort);
              }}
            />
          </SectionBlock>
        </Animated.View>

        {!!error ? (
          <Animated.View layout={layoutTransition}>
            <SectionBlock title="Synchronizacja nie powiodła się" description={error} preset="compact" />
          </Animated.View>
        ) : null}

        <View style={styles.feedHeader}>
          <View style={styles.feedHeaderCopy}>
            <Text style={[uiType.title3, { color: colors.foreground }]}>Twoje notatki</Text>
            <Text style={[uiType.meta, { color: colors.muted }]}>{sortDescription}</Text>
          </View>
          <View style={[styles.feedCountPill, { backgroundColor: colors.tagBackground }]}> 
            <Text style={[uiType.meta, styles.feedCountText, { color: colors.foreground }]}>{filteredNotes.length}</Text>
          </View>
        </View>

        {loading && notes.length === 0 ? (
          <SurfaceCard preset="compact" contentPreset="compact" style={styles.emptyCard}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[uiType.sectionTitle, styles.emptyTitle, { color: colors.foreground }]}>Ładowanie vaultu</Text>
            <Text style={[uiType.body, styles.emptyText, { color: colors.muted }]}>Pobieram notatki z lokalnego cache lub API.</Text>
          </SurfaceCard>
        ) : visibleNotes.length === 0 ? (
          <SurfaceCard preset="compact" contentPreset="compact" style={styles.emptyCard}>
            <Text style={[uiType.sectionTitle, styles.emptyTitle, { color: colors.foreground }]}>Brak wyników</Text>
            <Text style={[uiType.body, styles.emptyText, { color: colors.muted }]}>Zmień frazę, kategorię lub sortowanie, aby zobaczyć notatki.</Text>
          </SurfaceCard>
        ) : (
          <View style={styles.noteStack}>
            {visibleNotes.map((note, index) => (
              <Animated.View
                key={note.id}
                layout={layoutTransition}
                entering={reduceMotionEnabled ? undefined : FadeInDown.delay(220 + index * 18).duration(280)}
              >
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
              </Animated.View>
            ))}
          </View>
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
              <Text style={[uiType.meta, styles.loadMoreLabel, { color: colors.primary }]}>Pokaż kolejne {Math.min(PAGE_SIZE, filteredNotes.length - visibleCount)}</Text>
            </Pressable>
          </View>
        ) : null}
      </Animated.ScrollView>

      <Animated.View
        pointerEvents="box-none"
        style={[styles.compactHeaderWrap, { top: uiSpacing.xs, left: uiSpacing.md, right: uiSpacing.md }, compactHeaderStyle]}
      >
        <SurfaceCard
          preset="toolbar"
          contentPreset="toolbar"
          intensity={resolvedTheme === "dark" ? 84 : 78}
          style={styles.compactHeaderCard}
          contentStyle={styles.compactHeaderContent}
        >
          <View style={styles.compactHeaderTitleWrap}>
            <Text style={[uiType.meta, styles.compactHeaderTitle, { color: colors.foreground }]}>Aura Notes</Text>
            <Text style={[uiType.caption, { color: colors.muted }]}>
              {filteredNotes.length} notatek • {themeLabel}
            </Text>
          </View>
          <View style={styles.compactHeaderActions}>
            <HeaderIconButton
              compact
              icon={<Search size={17} color={colors.foreground} />}
              label="Otwórz pełny ekran wyszukiwania"
              onPress={() => router.push("/search")}
            />
            <HeaderIconButton
              compact
              icon={<Settings2 size={17} color={colors.foreground} />}
              label="Otwórz ustawienia"
              onPress={() => router.push("/settings")}
            />
          </View>
        </SurfaceCard>
      </Animated.View>
    </ScreenContainer>
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
    gap: uiSpacing.xl
  },
  heroStack: {
    gap: uiSpacing.md
  },
  leadCard: {
    marginTop: uiSpacing.xxs
  },
  heroAccent: {
    position: "absolute",
    top: -58,
    right: -42,
    width: 180,
    height: 180,
    borderRadius: uiRadius.pill,
    opacity: 0.22
  },
  heroTopBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: uiSpacing.sm
  },
  heroActionsRow: {
    flexDirection: "row",
    gap: uiSpacing.xs
  },
  eyebrowPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: uiSpacing.xs,
    borderWidth: 1,
    borderRadius: uiRadius.pill,
    paddingHorizontal: uiSpacing.sm,
    paddingVertical: uiSpacing.xs
  },
  eyebrowText: {
    fontWeight: "800"
  },
  heroCopy: {
    gap: uiSpacing.xs
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 40
  },
  continueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: uiSpacing.md
  },
  continueCopy: {
    flex: 1,
    gap: uiSpacing.xs
  },
  inlineContinueButton: {
    minHeight: uiControl.minTouch,
    borderWidth: 1,
    borderRadius: uiRadius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: uiSpacing.xs,
    paddingHorizontal: uiSpacing.md,
    paddingVertical: uiSpacing.sm
  },
  inlineContinueLabel: {
    fontWeight: "700"
  },
  heroStatusPill: {
    minHeight: uiControl.minTouch,
    borderRadius: uiRadius.pill,
    paddingHorizontal: uiSpacing.md,
    alignItems: "center",
    justifyContent: "center"
  },
  heroStatusLabel: {
    fontWeight: "700"
  },
  statsRow: {
    flexDirection: "row",
    gap: uiSpacing.sm
  },
  statCard: {
    flex: 1,
    minHeight: 108
  },
  statTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: uiSpacing.xs
  },
  statValue: {
    fontSize: 21,
    lineHeight: 25
  },
  statDescription: {
    marginTop: -2
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: uiSpacing.sm
  },
  searchInput: {
    flex: 1
  },
  searchClear: {
    width: uiControl.minTouch,
    height: uiControl.minTouch,
    borderRadius: uiRadius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  resetFiltersButton: {
    minHeight: uiControl.minTouch,
    borderWidth: 1,
    borderRadius: uiRadius.pill,
    paddingHorizontal: uiSpacing.md,
    paddingVertical: uiSpacing.sm,
    justifyContent: "center"
  },
  resetFiltersLabel: {
    fontWeight: "700"
  },
  browserSection: {
    gap: uiSpacing.sm
  },
  browserSectionLabel: {
    fontWeight: "700"
  },
  sortHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: uiSpacing.sm
  },
  favoriteFilter: {
    minHeight: uiControl.minTouch,
    flexDirection: "row",
    alignItems: "center",
    gap: uiSpacing.xs,
    borderWidth: 1,
    borderRadius: uiRadius.pill,
    paddingHorizontal: uiSpacing.md,
    paddingVertical: uiSpacing.sm
  },
  favoriteLabel: {
    fontWeight: "700"
  },
  feedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: uiSpacing.sm
  },
  feedHeaderCopy: {
    flex: 1,
    gap: uiSpacing.xxs
  },
  feedCountPill: {
    minWidth: uiControl.minTouch,
    height: uiControl.minTouch,
    borderRadius: uiRadius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: uiSpacing.sm
  },
  feedCountText: {
    fontWeight: "700"
  },
  emptyCard: {
    alignItems: "center"
  },
  emptyTitle: {
    textAlign: "center"
  },
  emptyText: {
    textAlign: "center"
  },
  noteStack: {
    gap: uiSpacing.md
  },
  footerWrap: {
    paddingTop: uiSpacing.xs,
    paddingBottom: uiSpacing.xs,
    alignItems: "center"
  },
  loadMoreButton: {
    minHeight: uiControl.minTouch,
    borderWidth: 1,
    borderRadius: uiRadius.pill,
    paddingHorizontal: uiSpacing.xl,
    paddingVertical: uiSpacing.sm,
    justifyContent: "center"
  },
  loadMoreLabel: {
    fontWeight: "700"
  },
  compactHeaderWrap: {
    position: "absolute",
    zIndex: 50
  },
  compactHeaderCard: {
    shadowOpacity: 0.22,
    shadowRadius: 20
  },
  compactHeaderContent: {
    paddingHorizontal: uiSpacing.sm,
    paddingVertical: 10
  },
  compactHeaderTitleWrap: {
    flex: 1,
    gap: 1
  },
  compactHeaderTitle: {
    fontWeight: "700"
  },
  compactHeaderActions: {
    flexDirection: "row",
    gap: 6
  },
  headerAction: {
    width: uiControl.minTouch,
    height: uiControl.minTouch,
    borderRadius: uiRadius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  headerActionCompact: {
    width: uiControl.minTouch,
    height: uiControl.minTouch
  }
});
