import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Markdown from "react-native-markdown-display";
import { ArrowLeft, Clock3, Folder, Hash, Minus, Plus, Star } from "lucide-react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue
} from "react-native-reanimated";
import SyntaxHighlighter from "react-native-syntax-highlighter";
import { atomOneDark, atomOneLight } from "react-syntax-highlighter/styles/hljs";
import { ScreenContainer } from "../../src/components/ui/ScreenContainer";
import { SurfaceCard } from "../../src/components/ui/SurfaceCard";
import { getCategoryLabel } from "../../src/constants/categories";
import { useNotes } from "../../src/state/NotesProvider";
import {
  readReaderFontScale,
  readReaderScroll,
  saveLastOpenedNoteId,
  saveReaderFontScale,
  saveReaderScroll
} from "../../src/state/readerState";
import { useAppTheme } from "../../src/theme/ThemeProvider";
import { uiControl, uiRadius, uiSpacing, uiType } from "../../src/theme/ui";
import { formatRelativeDate } from "../../src/utils/date";
import { triggerHaptic } from "../../src/utils/haptics";

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

function stripFrontmatter(content: string) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "");
}

function fallbackExcerptFromContent(content: string) {
  return stripFrontmatter(content)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^\)]*\)/g, " ")
    .replace(/[#>*_\-]{1,}/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

const MIN_FONT_SCALE = 0.9;
const MAX_FONT_SCALE = 1.35;
const DEFAULT_FONT_SCALE = 1;

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, toggleFavoriteById } = useNotes();
  const { colors, resolvedTheme, reduceMotionEnabled } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [progressPercent, setProgressPercent] = useState(0);
  const [fontScale, setFontScale] = useState(DEFAULT_FONT_SCALE);
  const [isReady, setIsReady] = useState(false);
  const scrollViewRef = useRef<any>(null);
  const initialScrollYRef = useRef(0);
  const currentScrollYRef = useRef(0);
  const shouldRestoreScrollRef = useRef(false);
  const lastSavedAtRef = useRef(0);
  const fontScaleRef = useRef(DEFAULT_FONT_SCALE);
  const progressPercentRef = useRef(0);

  const note = useMemo(() => notes.find((item) => item.id === id) ?? null, [id, notes]);
  const displayContent = useMemo(() => stripFrontmatter(note?.content ?? ""), [note?.content]);
  const displayExcerpt = useMemo(() => {
    if (!note) return "";
    const raw = note.excerpt.trim();
    return /^(title|category|tags|created|updated)\s*:/i.test(raw) ? fallbackExcerptFromContent(note.content) : raw;
  }, [note]);

  const scrollY = useSharedValue(0);
  const progressValue = useSharedValue(0);
  const pinchPreviewScale = useSharedValue(1);
  const edgeSwipeActive = useSharedValue(false);

  const applyFontScale = useCallback((nextScale: number) => {
    const clamped = Math.max(MIN_FONT_SCALE, Math.min(MAX_FONT_SCALE, nextScale));
    fontScaleRef.current = clamped;
    setFontScale(clamped);
    void saveReaderFontScale(clamped);
  }, []);

  const adjustFontScale = useCallback(
    (delta: number) => {
      void triggerHaptic("selection");
      applyFontScale(fontScaleRef.current + delta);
    },
    [applyFontScale]
  );

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      pinchPreviewScale.value = clamp(event.scale, 0.94, 1.14);
    })
    .onEnd((event) => {
      pinchPreviewScale.value = 1;
      const nextScale = clamp(fontScaleRef.current * event.scale, MIN_FONT_SCALE, MAX_FONT_SCALE);
      runOnJS(triggerHaptic)("selection");
      runOnJS(applyFontScale)(nextScale);
    });

  const edgeSwipeBack = Gesture.Pan()
    .onBegin((event) => {
      edgeSwipeActive.value = event.absoluteX <= 28;
    })
    .onEnd((event) => {
      if (!edgeSwipeActive.value) return;
      if (event.translationX > 96 && Math.abs(event.translationY) < 120) {
        runOnJS(triggerHaptic)("light");
        runOnJS(router.back)();
      }
      edgeSwipeActive.value = false;
    });

  const gesture = Gesture.Simultaneous(pinch, edgeSwipeBack);

  const compactHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [28, 140], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, 140], [-14, 0], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateY }]
    };
  });

  const heroStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [0, 160], [0, -12], Extrapolation.CLAMP);
    const opacity = interpolate(scrollY.value, [0, 180], [1, 0.96], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateY }]
    };
  });

  const pinchPreviewStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pinchPreviewScale.value }]
  }));

  const progressFillStyle = useAnimatedStyle(() => ({
    width: `${Math.round(progressValue.value * 100)}%`
  }));

  const markdownRules = useMemo(
    () => ({
      fence: (node: any) => {
        const code = String(node?.content ?? "");
        const lang = String(node?.sourceInfo ?? "text").trim().split(/\s+/)[0] || "text";
        return (
          <View key={node.key} style={styles.codeBlockWrap}>
            <SyntaxHighlighter
              language={lang}
              style={resolvedTheme === "dark" ? atomOneDark : atomOneLight}
              fontSize={12 * fontScale}
              highlighter="hljs"
            >
              {code}
            </SyntaxHighlighter>
          </View>
        );
      },
      code_block: (node: any) => {
        const code = String(node?.content ?? "");
        return (
          <View key={node.key} style={styles.codeBlockWrap}>
            <SyntaxHighlighter
              language="text"
              style={resolvedTheme === "dark" ? atomOneDark : atomOneLight}
              fontSize={12 * fontScale}
              highlighter="hljs"
            >
              {code}
            </SyntaxHighlighter>
          </View>
        );
      }
    }),
    [fontScale, resolvedTheme]
  );

  const markdownStyles = useMemo(
    () => ({
      body: {
        color: colors.foreground,
        fontSize: 17 * fontScale,
        lineHeight: 29 * fontScale,
        fontWeight: "500" as const
      },
      heading1: {
        color: colors.foreground,
        fontSize: 32 * fontScale,
        lineHeight: 36 * fontScale,
        marginTop: 12,
        marginBottom: 14,
        fontWeight: "800" as const
      },
      heading2: {
        color: colors.foreground,
        fontSize: 26 * fontScale,
        lineHeight: 31 * fontScale,
        marginTop: 20,
        marginBottom: 10,
        fontWeight: "800" as const
      },
      heading3: {
        color: colors.foreground,
        fontSize: 21 * fontScale,
        lineHeight: 26 * fontScale,
        marginTop: 18,
        marginBottom: 8,
        fontWeight: "700" as const
      },
      paragraph: {
        marginTop: 0,
        marginBottom: 14
      },
      bullet_list: {
        marginBottom: 14
      },
      ordered_list: {
        marginBottom: 14
      },
      list_item: {
        color: colors.foreground
      },
      code_inline: {
        backgroundColor: colors.codeBackground,
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        color: colors.codeForeground
      },
      blockquote: {
        borderLeftWidth: 3,
        borderLeftColor: colors.quoteBorder,
        paddingLeft: 14,
        paddingVertical: 8,
        marginBottom: 14,
        color: colors.muted,
        backgroundColor: colors.quoteBackground,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12
      },
      link: {
        color: colors.primary,
        textDecorationLine: "underline" as const
      },
      hr: {
        backgroundColor: colors.border,
        height: 1,
        marginTop: 8,
        marginBottom: 16
      }
    }),
    [colors, fontScale]
  );

  useEffect(() => {
    if (!note?.id) return;
    setIsReady(false);
    setProgressPercent(0);
    progressPercentRef.current = 0;
    progressValue.value = 0;
    let mounted = true;
    (async () => {
      await saveLastOpenedNoteId(note.id);
      const [savedScroll, savedFontScale] = await Promise.all([readReaderScroll(note.id), readReaderFontScale()]);
      if (!mounted) return;
      initialScrollYRef.current = savedScroll;
      shouldRestoreScrollRef.current = true;
      fontScaleRef.current = savedFontScale;
      setFontScale(savedFontScale);
      setIsReady(true);
    })();
    return () => {
      mounted = false;
      void saveReaderScroll(note.id, currentScrollYRef.current);
    };
  }, [note?.id]);

  if (!note) {
    return (
      <ScreenContainer edges={["top", "left", "right", "bottom"]}>
        <View style={styles.missingWrap}>
          <Text style={[uiType.title3, { color: colors.foreground }]}>Nie znaleziono notatki</Text>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backFallback, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}
          >
            <Text style={[uiType.meta, styles.backFallbackLabel, { color: colors.primary }]}>Wróć</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]} withHorizontalPadding={false}>
      <GestureDetector gesture={gesture}>
        <Animated.ScrollView
          ref={scrollViewRef}
          keyboardDismissMode="interactive"
          contentContainerStyle={[
            styles.readerContent,
            {
              paddingTop: insets.top + 88,
              paddingBottom: Math.max(88, insets.bottom + 52),
              paddingHorizontal: uiSpacing.lg
            }
          ]}
          onContentSizeChange={() => {
            if (!shouldRestoreScrollRef.current) return;
            shouldRestoreScrollRef.current = false;
            scrollViewRef.current?.scrollTo({ y: initialScrollYRef.current, animated: false });
          }}
          onScroll={(event) => {
            const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
            scrollY.value = contentOffset.y;
            const maxScroll = contentSize.height - layoutMeasurement.height;
            const nextProgress = maxScroll <= 0 ? 0 : contentOffset.y / maxScroll;
            progressValue.value = nextProgress;
            const nextPercent = Math.round(nextProgress * 100);
            if (nextPercent !== progressPercentRef.current) {
              progressPercentRef.current = nextPercent;
              setProgressPercent(nextPercent);
            }
            currentScrollYRef.current = contentOffset.y;

            const now = Date.now();
            if (note.id && now - lastSavedAtRef.current > 700) {
              lastSavedAtRef.current = now;
              void saveReaderScroll(note.id, contentOffset.y);
            }
          }}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={heroStyle}>
            <SurfaceCard preset="hero" contentPreset="hero" style={styles.heroCard} intensity={resolvedTheme === "dark" ? 58 : 52}>
              <Text style={[uiType.eyebrow, { color: colors.primary }]}>{getCategoryLabel(note.category)}</Text>
              <Text style={[uiType.title1, styles.heroTitle, { color: colors.foreground }]}>{note.title}</Text>
              <Text numberOfLines={3} style={[uiType.body, styles.heroSummary, { color: colors.muted }]}>
                {displayExcerpt}
              </Text>

              <View style={styles.metaLine}>
                <View style={styles.metaInline}>
                  <Clock3 size={14} color={colors.primary} />
                  <Text style={[uiType.meta, { color: colors.foreground }]}>{note.readingMinutes} min</Text>
                </View>
                <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
                <View style={styles.metaInline}>
                  <Hash size={14} color={colors.primary} />
                  <Text style={[uiType.meta, { color: colors.foreground }]}>{note.words} słów</Text>
                </View>
                <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />
                <View style={styles.metaInline}>
                  <Folder size={14} color={colors.primary} />
                  <Text style={[uiType.meta, { color: colors.foreground }]} numberOfLines={1}>
                    {note.folder}
                  </Text>
                </View>
              </View>

              <View style={styles.heroFooter}>
                <Text style={[uiType.caption, { color: colors.subtle }]}>Aktualizacja {formatRelativeDate(note.updatedAt)}</Text>
                <Text style={[uiType.caption, { color: colors.subtle }]}>{progressPercent}% przeczytane</Text>
              </View>

              {!!note.tags.length ? (
                <View style={styles.tagsRow}>
                  {note.tags.map((tag) => (
                    <View key={tag} style={[styles.tag, { backgroundColor: colors.tagBackground }]}> 
                      <Text style={[uiType.meta, styles.tagText, { color: colors.foreground }]}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </SurfaceCard>
          </Animated.View>

          <Animated.View entering={reduceMotionEnabled ? undefined : FadeInDown.delay(120).duration(360)} style={styles.contentCardWrap}>
            <SurfaceCard preset="section" intensity={resolvedTheme === "dark" ? 60 : 54} contentStyle={styles.markdownCardContent}>
              <Animated.View style={pinchPreviewStyle}>
                <Markdown
                  rules={markdownRules}
                  style={markdownStyles}
                  onLinkPress={(url) => {
                    void triggerHaptic("light");
                    void Linking.openURL(url);
                    return false;
                  }}
                >
                  {displayContent}
                </Markdown>
              </Animated.View>
            </SurfaceCard>
          </Animated.View>
        </Animated.ScrollView>
      </GestureDetector>

      <View style={[styles.progressTrack, { backgroundColor: colors.progressTrack, top: insets.top + 76 }]}>
        <Animated.View style={[styles.progressFill, { backgroundColor: colors.primary }, progressFillStyle]} />
      </View>

      <Animated.View
        pointerEvents="box-none"
        style={[styles.floatingHeaderWrap, { top: Math.max(uiSpacing.xs, insets.top + uiSpacing.xxs), left: uiSpacing.lg, right: uiSpacing.lg }, compactHeaderStyle]}
      >
        <SurfaceCard preset="toolbar" contentPreset="toolbar" intensity={resolvedTheme === "dark" ? 64 : 58}>
          <HeaderControlButton
            icon={<ArrowLeft size={18} color={colors.foreground} />}
            label="Wróć do listy notatek"
            onPress={() => {
              void triggerHaptic("light");
              router.back();
            }}
          />

          <View style={styles.floatingTitleWrap}>
            <Text numberOfLines={1} style={[uiType.meta, styles.floatingTitle, { color: colors.foreground }]}>
              {note.title}
            </Text>
            <Text style={[uiType.caption, { color: colors.muted }]}>
              {progressPercent}% • {fontScale.toFixed(2)}x
            </Text>
          </View>

          <View style={styles.controlRow}>
            <HeaderControlButton
              icon={<Minus size={15} color={colors.foreground} />}
              label="Zmniejsz rozmiar tekstu"
              onPress={() => adjustFontScale(-0.05)}
              disabled={fontScale <= MIN_FONT_SCALE + 0.01}
            />
            <HeaderControlButton
              icon={<Plus size={15} color={colors.foreground} />}
              label="Powiększ rozmiar tekstu"
              onPress={() => adjustFontScale(0.05)}
              disabled={fontScale >= MAX_FONT_SCALE - 0.01}
            />
            <HeaderControlButton
              icon={<Star size={16} color={note.isFavorite ? colors.warning : colors.foreground} fill={note.isFavorite ? colors.warning : "none"} />}
              label={note.isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
              onPress={() => {
                void triggerHaptic("medium");
                void toggleFavoriteById(note.id);
              }}
            />
          </View>
        </SurfaceCard>
      </Animated.View>

      {!isReady ? (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <SurfaceCard preset="compact" contentPreset="compact" intensity={resolvedTheme === "dark" ? 64 : 58}>
            <Text style={[uiType.meta, styles.loadingLabel, { color: colors.foreground }]}>Przywracam pozycję czytania...</Text>
          </SurfaceCard>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

function HeaderControlButton({
  icon,
  label,
  onPress,
  disabled = false
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      style={[
        styles.controlButton,
        {
          borderColor: colors.borderStrong,
          backgroundColor: disabled ? colors.primarySoft : colors.tagBackground,
          opacity: disabled ? 0.45 : 1
        }
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  readerContent: {
    gap: uiSpacing.xl
  },
  heroCard: {
    marginTop: uiSpacing.xxs
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36
  },
  heroSummary: {},
  metaLine: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: uiSpacing.xs
  },
  metaInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: uiSpacing.xs,
    maxWidth: "100%"
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: uiRadius.pill
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: uiSpacing.sm
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: uiSpacing.xs
  },
  tag: {
    borderRadius: uiRadius.pill,
    paddingHorizontal: uiSpacing.sm,
    paddingVertical: uiSpacing.xs,
    opacity: 0.92
  },
  tagText: {
    fontWeight: "600"
  },
  contentCardWrap: {
    marginBottom: uiSpacing.xs
  },
  markdownCardContent: {
    paddingHorizontal: uiSpacing.lg,
    paddingVertical: uiSpacing.xl
  },
  codeBlockWrap: {
    marginBottom: uiSpacing.md,
    borderRadius: uiRadius.inner,
    overflow: "hidden"
  },
  progressTrack: {
    position: "absolute",
    left: uiSpacing.lg,
    right: uiSpacing.lg,
    height: uiControl.progressHeight,
    borderRadius: uiRadius.pill,
    overflow: "hidden",
    zIndex: 45
  },
  progressFill: {
    height: uiControl.progressHeight,
    borderRadius: uiRadius.pill
  },
  floatingHeaderWrap: {
    position: "absolute",
    zIndex: 50
  },
  floatingTitleWrap: {
    flex: 1,
    minWidth: 0,
    gap: 2
  },
  floatingTitle: {
    fontWeight: "700"
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: uiSpacing.xs
  },
  controlButton: {
    width: uiControl.minTouch,
    height: uiControl.minTouch,
    borderRadius: uiRadius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: uiSpacing.xl
  },
  loadingLabel: {
    fontWeight: "700"
  },
  missingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: uiSpacing.xl,
    gap: uiSpacing.sm
  },
  backFallback: {
    borderWidth: 1,
    borderRadius: uiRadius.pill,
    minHeight: uiControl.minTouch,
    paddingHorizontal: uiSpacing.md,
    alignItems: "center",
    justifyContent: "center"
  },
  backFallbackLabel: {
    fontWeight: "700"
  }
});
