import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { DatabaseBackup, RefreshCw, Trash2, X } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "../src/components/ui/ScreenContainer";
import { SurfaceCard } from "../src/components/ui/SurfaceCard";
import { useNotes } from "../src/state/NotesProvider";
import { formatRelativeDate } from "../src/utils/date";
import { useAppTheme } from "../src/theme/ThemeProvider";
import { triggerHaptic } from "../src/utils/haptics";

export default function SettingsScreen() {
  const { theme, themes, setTheme, colors, themeLabel, themeDescription, resolvedTheme, reduceMotionEnabled } = useAppTheme();
  const { cacheInfo, resetCache, refresh, refreshing } = useNotes();
  const insets = useSafeAreaInsets();
  const coreThemeIds = new Set(["system", "light", "dark", "crystal-line"]);
  const primaryThemes = themes.filter((entry) => coreThemeIds.has(entry.id));
  const otherThemes = themes.filter((entry) => !coreThemeIds.has(entry.id));

  const renderThemeCard = (entry: (typeof themes)[number], index: number) => {
    const active = theme === entry.id;
    return (
      <Animated.View key={entry.id} entering={reduceMotionEnabled ? undefined : FadeInDown.delay(60 + index * 35).duration(260)}>
        <SurfaceCard
          onPress={() => {
            void triggerHaptic(active ? "selection" : "light");
            void setTheme(entry.id);
          }}
          style={styles.themeCard}
          contentStyle={styles.themeCardInner}
          accessibilityRole="button"
          accessibilityLabel={`Wybierz motyw ${entry.label}`}
        >
          <LinearGradient colors={entry.preview.gradient ?? [entry.preview.bg, entry.preview.bg]} style={styles.themePreview}>
            <View style={[styles.previewFloatingCard, { backgroundColor: entry.preview.card, borderColor: "rgba(255,255,255,0.34)" }]} />
            <View style={styles.previewFooterRow}>
              <View style={[styles.previewMiniPill, { backgroundColor: entry.preview.card, borderColor: "rgba(255,255,255,0.34)" }]} />
              <View style={[styles.previewAccent, { backgroundColor: entry.preview.accent }]} />
            </View>
          </LinearGradient>

          <View style={styles.themeBody}>
            <View style={styles.themeCopy}>
              <Text style={[styles.themeName, { color: colors.foreground }]}>{entry.label}</Text>
              <Text style={[styles.themeDescriptionText, { color: colors.muted }]}>{entry.description}</Text>
            </View>
            <View
              style={[
                styles.activeBadge,
                {
                  backgroundColor: active ? colors.primary : colors.tagBackground,
                  borderColor: active ? colors.primary : colors.border
                }
              ]}
            >
              <Text style={[styles.activeBadgeText, { color: active ? colors.primaryForeground : colors.foreground }]}>
                {active ? "Aktywny" : "Wybierz"}
              </Text>
            </View>
          </View>
        </SurfaceCard>
      </Animated.View>
    );
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(44, insets.bottom + 20) }]}
      >
        <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />

        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Motywy, cache, synchronizacja i zachowanie aplikacji na iPhone.</Text>
          </View>
          <Pressable
            onPress={() => {
              void triggerHaptic("light");
              router.back();
            }}
            accessibilityRole="button"
            accessibilityLabel="Zamknij ustawienia"
            style={[styles.closeButton, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderStrong }]}
          >
            <X size={18} color={colors.foreground} />
          </Pressable>
        </View>

        <Animated.View entering={reduceMotionEnabled ? undefined : FadeInDown.duration(280)}>
          <SurfaceCard style={styles.section} contentStyle={styles.sectionInner} intensity={resolvedTheme === "dark" ? 60 : 56}>
            <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Current Theme</Text>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{themeLabel}</Text>
            <Text style={[styles.sectionDescription, { color: colors.muted }]}>{themeDescription}</Text>
            <Text style={[styles.sectionCaption, { color: colors.subtle }]}>
              {resolvedTheme === "dark" ? "Ciemna baza" : "Jasna baza"} • {reduceMotionEnabled ? "Reduce Motion aktywne" : "Pełne motion aktywne"}
            </Text>
          </SurfaceCard>
        </Animated.View>

        <SurfaceCard style={styles.section} contentStyle={styles.sectionInner}>
          <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Core Modes</Text>
          <Text style={[styles.sectionTitleSmall, { color: colors.foreground }]}>System, Light, Dark, Crystal Line</Text>
          <Text style={[styles.sectionCaption, { color: colors.muted }]}>Tryby bazowe oraz najnowszy premium motyw jako główna ścieżka wizualna.</Text>
          <View style={styles.grid}>{primaryThemes.map(renderThemeCard)}</View>
        </SurfaceCard>

        {otherThemes.length > 0 ? (
          <SurfaceCard style={styles.section} contentStyle={styles.sectionInner}>
            <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Aura Presets</Text>
            <Text style={[styles.sectionTitleSmall, { color: colors.foreground }]}>Pozostałe kierunki graficzne</Text>
            <Text style={[styles.sectionCaption, { color: colors.muted }]}>Każdy preset ma własny materiał, gradienty i charakter powierzchni.</Text>
            <View style={styles.grid}>{otherThemes.map((entry, index) => renderThemeCard(entry, index + primaryThemes.length))}</View>
          </SurfaceCard>
        ) : null}

        <SurfaceCard style={styles.section} contentStyle={styles.sectionInner}>
          <View style={styles.sectionHeading}>
            <DatabaseBackup size={16} color={colors.primary} />
            <Text style={[styles.sectionTitleSmall, { color: colors.foreground }]}>Offline Cache</Text>
          </View>
          <View style={styles.statsList}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Notatek w SQLite</Text>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{cacheInfo.count}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Ostatnia synchronizacja</Text>
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {cacheInfo.lastSyncedAt ? formatRelativeDate(cacheInfo.lastSyncedAt) : "brak"}
              </Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              onPress={() => {
                void triggerHaptic("light");
                void refresh();
              }}
              style={[styles.actionButton, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}
            >
              <RefreshCw size={14} color={colors.primary} />
              <Text style={[styles.actionLabel, { color: colors.primary }]}>{refreshing ? "Sync..." : "Sync now"}</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                Alert.alert("Wyczyścić cache?", "Usunę lokalny cache i odbuduję notatki z danych startowych.", [
                  { text: "Anuluj", style: "cancel" },
                  {
                    text: "Wyczyść",
                    style: "destructive",
                    onPress: () => {
                      void triggerHaptic("warning");
                      void resetCache();
                    }
                  }
                ]);
              }}
              style={[styles.actionButton, { backgroundColor: "rgba(219,78,109,0.1)", borderColor: "rgba(219,78,109,0.22)" }]}
            >
              <Trash2 size={14} color={colors.destructive} />
              <Text style={[styles.actionLabel, { color: colors.destructive }]}>Clear cache</Text>
            </Pressable>
          </View>
        </SurfaceCard>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    gap: 16
  },
  handle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 999,
    marginTop: 2
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
  section: {},
  sectionInner: {
    padding: 16
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  sectionTitle: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.7
  },
  sectionDescription: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20
  },
  sectionCaption: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19
  },
  grid: {
    gap: 14,
    marginTop: 16
  },
  themeCard: {},
  themeCardInner: {
    padding: 14,
    gap: 12
  },
  themePreview: {
    height: 108,
    borderRadius: 22,
    overflow: "hidden",
    justifyContent: "space-between",
    padding: 12
  },
  previewFloatingCard: {
    width: "72%",
    height: 34,
    borderRadius: 16,
    borderWidth: 1
  },
  previewFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  previewMiniPill: {
    width: 72,
    height: 18,
    borderRadius: 999,
    borderWidth: 1
  },
  previewAccent: {
    width: 42,
    height: 7,
    borderRadius: 999
  },
  themeBody: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  themeCopy: {
    flex: 1
  },
  themeName: {
    fontSize: 16,
    fontWeight: "700"
  },
  themeDescriptionText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18
  },
  activeBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: "800"
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  sectionTitleSmall: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3
  },
  statsList: {
    marginTop: 14,
    gap: 10
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  statLabel: {
    fontSize: 14,
    lineHeight: 20
  },
  statValue: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700"
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "800"
  }
});
