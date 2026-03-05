import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, DatabaseBackup, RefreshCw, Trash2 } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenContainer } from "../src/components/ui/ScreenContainer";
import { SurfaceCard } from "../src/components/ui/SurfaceCard";
import { useNotes } from "../src/state/NotesProvider";
import { formatRelativeDate } from "../src/utils/date";
import { useAppTheme } from "../src/theme/ThemeProvider";
import { triggerHaptic } from "../src/utils/haptics";

export default function SettingsScreen() {
  const { theme, themes, setTheme, colors, themeLabel, themeDescription } = useAppTheme();
  const { cacheInfo, resetCache, refresh, refreshing } = useNotes();
  const coreThemeIds = new Set(["system", "light", "dark", "crystal-line"]);
  const primaryThemes = themes.filter((entry) => coreThemeIds.has(entry.id));
  const otherThemes = themes.filter((entry) => !coreThemeIds.has(entry.id));

  const renderThemeCard = (entry: (typeof themes)[number]) => {
    const active = theme === entry.id;
    return (
      <SurfaceCard
        key={entry.id}
        onPress={() => {
          void triggerHaptic("light");
          void setTheme(entry.id);
        }}
        style={styles.themeCard}
        contentStyle={styles.themeCardInner}
        accessibilityRole="button"
        accessibilityLabel={`Wybierz motyw ${entry.label}`}
      >
        <LinearGradient colors={entry.preview.gradient ?? [entry.preview.bg, entry.preview.bg]} style={styles.themePreview}>
          <View style={[styles.previewCard, { backgroundColor: entry.preview.card, borderColor: "rgba(255,255,255,0.34)" }]} />
          <View style={[styles.previewAccent, { backgroundColor: entry.preview.accent }]} />
        </LinearGradient>
        <Text style={[styles.themeName, { color: colors.foreground }]}>{entry.label}</Text>
        <Text style={[styles.themeDescriptionText, { color: colors.muted }]}>{entry.description}</Text>
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
      </SurfaceCard>
    );
  };

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
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
            <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Tematy, synchronizacja i lokalny vault.</Text>
          </View>
        </View>

        <SurfaceCard style={styles.section} contentStyle={styles.sectionInner}>
          <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Active Theme</Text>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{themeLabel}</Text>
          <Text style={[styles.sectionDescription, { color: colors.muted }]}>{themeDescription}</Text>
        </SurfaceCard>

        <SurfaceCard style={styles.section} contentStyle={styles.sectionInner}>
          <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Core Modes</Text>
          <Text style={[styles.sectionTitleSmall, { color: colors.foreground }]}>System, Light, Dark, Crystal Line</Text>
          <Text style={[styles.sectionCaption, { color: colors.muted }]}>
            Szybkie tryby bazowe oraz Twój najnowszy motyw jako domyślna ścieżka premium.
          </Text>
          <View style={styles.grid}>{primaryThemes.map(renderThemeCard)}</View>
        </SurfaceCard>

        {otherThemes.length > 0 ? (
          <SurfaceCard style={styles.section} contentStyle={styles.sectionInner}>
            <Text style={[styles.sectionEyebrow, { color: colors.primary }]}>Aura Presets</Text>
            <Text style={[styles.sectionTitleSmall, { color: colors.foreground }]}>Pozostałe warianty</Text>
            <Text style={[styles.sectionCaption, { color: colors.muted }]}>
              Dodatkowe presetowe kierunki wizualne zachowane do szybkiego testowania.
            </Text>
            <View style={styles.grid}>{otherThemes.map(renderThemeCard)}</View>
          </SurfaceCard>
        ) : null}

        <SurfaceCard style={styles.section} contentStyle={styles.sectionInner}>
          <View style={styles.sectionHeading}>
            <DatabaseBackup size={16} color={colors.primary} />
            <Text style={[styles.sectionTitleSmall, { color: colors.foreground }]}>Offline Cache</Text>
          </View>
          <View style={styles.statsList}>
            <Text style={[styles.statText, { color: colors.muted }]}>Notatek w SQLite: {cacheInfo.count}</Text>
            <Text style={[styles.statText, { color: colors.muted }]}>
              Ostatnia synchronizacja: {cacheInfo.lastSyncedAt ? formatRelativeDate(cacheInfo.lastSyncedAt) : "brak"}
            </Text>
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
                      void triggerHaptic("medium");
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
    paddingBottom: 36
  },
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
  section: {
    marginTop: 16
  },
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
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.6
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
    padding: 14
  },
  themePreview: {
    height: 96,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "space-between",
    padding: 12
  },
  previewCard: {
    width: "68%",
    height: 30,
    borderRadius: 14,
    borderWidth: 1
  },
  previewAccent: {
    width: 40,
    height: 6,
    borderRadius: 999
  },
  themeName: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700"
  },
  themeDescriptionText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18
  },
  activeBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 12
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
    fontSize: 16,
    fontWeight: "700"
  },
  statsList: {
    marginTop: 12,
    gap: 6
  },
  statText: {
    fontSize: 14,
    lineHeight: 20
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
