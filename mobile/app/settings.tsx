import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { DatabaseBackup, RefreshCw, Trash2 } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "../src/components/ui/ScreenContainer";
import { ScreenHeader } from "../src/components/ui/ScreenHeader";
import { SectionBlock } from "../src/components/ui/SectionBlock";
import { SurfaceCard } from "../src/components/ui/SurfaceCard";
import { useNotes } from "../src/state/NotesProvider";
import { formatRelativeDate } from "../src/utils/date";
import { useAppTheme } from "../src/theme/ThemeProvider";
import { uiControl, uiRadius, uiSpacing, uiType } from "../src/theme/ui";
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
          preset="list"
          contentPreset="list"
          onPress={() => {
            void triggerHaptic(active ? "selection" : "light");
            void setTheme(entry.id);
          }}
          style={styles.themeCard}
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
            <View style={styles.themeHeading}>
              <Text style={[uiType.sectionTitle, styles.themeName, { color: colors.foreground }]}>{entry.label}</Text>
              <View
                style={[
                  styles.activeBadge,
                  {
                    backgroundColor: active ? colors.primary : colors.tagBackground,
                    borderColor: active ? colors.primary : colors.border
                  }
                ]}
              >
                <Text style={[uiType.caption, styles.activeBadgeText, { color: active ? colors.primaryForeground : colors.foreground }]}>
                  {active ? "Aktywny" : "Wybierz"}
                </Text>
              </View>
            </View>
            <Text numberOfLines={2} style={[uiType.meta, { color: colors.muted }]}>
              {entry.description}
            </Text>
          </View>
        </SurfaceCard>
      </Animated.View>
    );
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(uiControl.minTouch, insets.bottom + uiSpacing.xl) }]}
      >
        <ScreenHeader
          title="Ustawienia"
          subtitle="Motywy, cache, synchronizacja i zachowanie aplikacji na iPhone w jednym spokojnym panelu."
          closeLabel="Zamknij ustawienia"
          onClose={() => {
            void triggerHaptic("light");
            router.back();
          }}
        />

        <Animated.View entering={reduceMotionEnabled ? undefined : FadeInDown.duration(280)}>
          <SectionBlock
            eyebrow="Aktywny motyw"
            title={themeLabel}
            titleStyle={uiType.title3}
            description={themeDescription}
            caption={`${resolvedTheme === "dark" ? "Ciemna baza" : "Jasna baza"} • ${reduceMotionEnabled ? "Reduce Motion aktywne" : "Pełne motion aktywne"}`}
            intensity={resolvedTheme === "dark" ? 60 : 56}
          />
        </Animated.View>

        <SectionBlock
          eyebrow="Tryby główne"
          title="System, Light, Dark, Crystal Line"
          description="Tryby bazowe oraz najnowszy premium motyw jako główna ścieżka wizualna."
        >
          <View style={styles.grid}>{primaryThemes.map(renderThemeCard)}</View>
        </SectionBlock>

        {otherThemes.length > 0 ? (
          <SectionBlock
            eyebrow="Aura Presets"
            title="Pozostałe kierunki graficzne"
            description="Każdy preset ma własny materiał, gradienty i charakter powierzchni, ale dziedziczy ten sam system spacingu."
          >
            <View style={styles.grid}>{otherThemes.map((entry, index) => renderThemeCard(entry, index + primaryThemes.length))}</View>
          </SectionBlock>
        ) : null}

        <SectionBlock
          title="Offline Cache"
          accessory={<DatabaseBackup size={18} color={colors.primary} />}
          description="Lokalna baza trzyma notatki offline i odtwarza je natychmiast po starcie aplikacji."
        >
          <View style={styles.statsList}>
            <View style={styles.statRow}>
              <Text style={[uiType.meta, { color: colors.muted }]}>Notatek w SQLite</Text>
              <Text style={[uiType.meta, styles.statValue, { color: colors.foreground }]}>{cacheInfo.count}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[uiType.meta, { color: colors.muted }]}>Ostatnia synchronizacja</Text>
              <Text style={[uiType.meta, styles.statValue, { color: colors.foreground }]}>
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
              <Text style={[uiType.meta, styles.actionLabel, { color: colors.primary }]}>{refreshing ? "Sync..." : "Synchronizuj"}</Text>
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
              <Text style={[uiType.meta, styles.actionLabel, { color: colors.destructive }]}>Wyczyść cache</Text>
            </Pressable>
          </View>
        </SectionBlock>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: uiSpacing.xs,
    gap: uiSpacing.xl
  },
  grid: {
    gap: uiSpacing.md
  },
  themeCard: {
    minHeight: 116
  },
  themePreview: {
    width: 108,
    height: 80,
    borderRadius: uiRadius.inner,
    overflow: "hidden",
    justifyContent: "space-between",
    padding: uiSpacing.sm
  },
  previewFloatingCard: {
    width: "72%",
    height: 28,
    borderRadius: 14,
    borderWidth: 1
  },
  previewFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  previewMiniPill: {
    width: 64,
    height: 16,
    borderRadius: uiRadius.pill,
    borderWidth: 1
  },
  previewAccent: {
    width: 34,
    height: 6,
    borderRadius: uiRadius.pill
  },
  themeBody: {
    flex: 1,
    gap: uiSpacing.xs
  },
  themeHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: uiSpacing.sm
  },
  themeName: {
    flex: 1
  },
  activeBadge: {
    borderWidth: 1,
    borderRadius: uiRadius.pill,
    paddingHorizontal: uiSpacing.sm,
    paddingVertical: uiSpacing.xs
  },
  activeBadgeText: {
    fontWeight: "800"
  },
  statsList: {
    gap: uiSpacing.sm
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: uiSpacing.sm
  },
  statValue: {
    fontWeight: "700"
  },
  buttonRow: {
    flexDirection: "row",
    gap: uiSpacing.sm,
    flexWrap: "wrap"
  },
  actionButton: {
    flex: 1,
    minWidth: 160,
    minHeight: uiControl.minTouch,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: uiSpacing.xs,
    borderRadius: uiRadius.pill,
    borderWidth: 1,
    paddingHorizontal: uiSpacing.md,
    paddingVertical: uiSpacing.sm
  },
  actionLabel: {
    fontWeight: "700"
  }
});
