import { useEffect, useMemo, useRef, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Markdown from "react-native-markdown-display";
import { ArrowLeft, Star } from "lucide-react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import SyntaxHighlighter from "react-native-syntax-highlighter";
import { atomOneDark, atomOneLight } from "react-syntax-highlighter/styles/hljs";
import { ScreenContainer } from "../../src/components/ui/ScreenContainer";
import { SurfaceCard } from "../../src/components/ui/SurfaceCard";
import { useNotes } from "../../src/state/NotesProvider";
import { readReaderScroll, saveLastOpenedNoteId, saveReaderScroll } from "../../src/state/readerState";
import { useAppTheme } from "../../src/theme/ThemeProvider";
import { formatRelativeDate } from "../../src/utils/date";
import { triggerHaptic } from "../../src/utils/haptics";

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { notes, toggleFavoriteById } = useNotes();
  const { colors, resolvedTheme } = useAppTheme();
  const [progress, setProgress] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const initialScrollYRef = useRef(0);
  const currentScrollYRef = useRef(0);
  const shouldRestoreScrollRef = useRef(false);
  const lastSavedAtRef = useRef(0);

  const note = useMemo(() => notes.find((item) => item.id === id) ?? null, [id, notes]);

  const scale = useSharedValue(1);
  const baseScale = useSharedValue(1);
  const edgeSwipeActive = useSharedValue(false);

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = clamp(baseScale.value * event.scale, 0.96, 1.42);
    })
    .onEnd(() => {
      baseScale.value = scale.value;
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
  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
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
              fontSize={12}
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
              fontSize={12}
              highlighter="hljs"
            >
              {code}
            </SyntaxHighlighter>
          </View>
        );
      }
    }),
    [resolvedTheme]
  );

  useEffect(() => {
    if (!note?.id) return;
    let mounted = true;
    (async () => {
      await saveLastOpenedNoteId(note.id);
      const savedScroll = await readReaderScroll(note.id);
      if (!mounted) return;
      initialScrollYRef.current = savedScroll;
      shouldRestoreScrollRef.current = true;
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
          <Text style={[styles.missingTitle, { color: colors.foreground }]}>Nie znaleziono notatki</Text>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backFallback, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}
          >
            <Text style={[styles.backFallbackLabel, { color: colors.primary }]}>Wróć</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]} withHorizontalPadding={false}>
      <View style={[styles.progressTrack, { backgroundColor: colors.progressTrack }]}>
        <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${Math.round(progress * 100)}%` }]} />
      </View>

      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surfaceElevated }]}>
        <Pressable
          onPress={() => {
            void triggerHaptic("light");
            router.back();
          }}
          style={[styles.headerButton, { borderColor: colors.border, backgroundColor: colors.tagBackground }]}
          accessibilityRole="button"
          accessibilityLabel="Wróć do listy notatek"
        >
          <ArrowLeft size={18} color={colors.foreground} />
        </Pressable>

        <View style={styles.headerCopy}>
          <Text numberOfLines={1} style={[styles.headerTitle, { color: colors.foreground }]}>
            {note.title}
          </Text>
          <Text style={[styles.headerMeta, { color: colors.muted }]}>
            {formatRelativeDate(note.updatedAt)} • {note.readingMinutes} min
          </Text>
        </View>

        <Pressable
          onPress={() => {
            void triggerHaptic("medium");
            void toggleFavoriteById(note.id);
          }}
          style={[styles.headerButton, { borderColor: colors.border, backgroundColor: colors.tagBackground }]}
          accessibilityRole="button"
          accessibilityLabel={note.isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
        >
          <Star size={18} color={note.isFavorite ? colors.warning : colors.foreground} fill={note.isFavorite ? colors.warning : "none"} />
        </Pressable>
      </View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.reader, contentStyle]}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.readerContent}
            onContentSizeChange={() => {
              if (!shouldRestoreScrollRef.current) return;
              shouldRestoreScrollRef.current = false;
              scrollViewRef.current?.scrollTo({ y: initialScrollYRef.current, animated: false });
            }}
            onScroll={(event) => {
              const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
              const maxScroll = contentSize.height - layoutMeasurement.height;
              setProgress(maxScroll <= 0 ? 0 : contentOffset.y / maxScroll);
              currentScrollYRef.current = contentOffset.y;

              const now = Date.now();
              if (now - lastSavedAtRef.current > 700) {
                lastSavedAtRef.current = now;
                if (note.id) {
                  void saveReaderScroll(note.id, contentOffset.y);
                }
              }
            }}
            scrollEventThrottle={16}
          >
            <SurfaceCard style={styles.heroCard} contentStyle={styles.heroContent}>
              <Text style={[styles.heroTitle, { color: colors.foreground }]}>{note.title}</Text>
              <Text style={[styles.heroSummary, { color: colors.muted }]}>
                {note.words} słów • {note.readingMinutes} min czytania • aktualizacja {formatRelativeDate(note.updatedAt)}
              </Text>
              {!!note.tags.length && (
                <View style={styles.tagsRow}>
                  {note.tags.map((tag) => (
                    <View
                      key={tag}
                      style={[styles.tag, { backgroundColor: colors.tagBackground, borderColor: colors.border }]}
                    >
                      <Text style={[styles.tagText, { color: colors.foreground }]}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </SurfaceCard>

            <View style={styles.markdownWrap}>
              <Markdown
                rules={markdownRules}
                style={{
                  body: {
                    color: colors.foreground,
                    fontSize: 17,
                    lineHeight: 29
                  },
                  heading1: {
                    color: colors.foreground,
                    fontSize: 32,
                    lineHeight: 36,
                    marginTop: 8,
                    marginBottom: 14,
                    fontWeight: "700"
                  },
                  heading2: {
                    color: colors.foreground,
                    fontSize: 26,
                    lineHeight: 30,
                    marginTop: 18,
                    marginBottom: 10,
                    fontWeight: "700"
                  },
                  heading3: {
                    color: colors.foreground,
                    fontSize: 21,
                    lineHeight: 25,
                    marginTop: 16,
                    marginBottom: 8,
                    fontWeight: "700"
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
                    paddingLeft: 12,
                    paddingVertical: 4,
                    marginBottom: 14,
                    color: colors.muted,
                    backgroundColor: colors.quoteBackground
                  },
                  link: {
                    color: colors.primary,
                    textDecorationLine: "underline"
                  },
                  hr: {
                    backgroundColor: colors.border,
                    height: 1
                  }
                }}
                onLinkPress={(url) => {
                  void triggerHaptic("light");
                  void Linking.openURL(url);
                  return false;
                }}
              >
                {note.content}
              </Markdown>
            </View>
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 3,
    width: "100%"
  },
  progressFill: {
    height: 3
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  headerCopy: {
    flex: 1
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2
  },
  headerMeta: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600"
  },
  reader: {
    flex: 1
  },
  readerContent: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    paddingBottom: 96
  },
  heroCard: {
    marginBottom: 18
  },
  heroContent: {
    padding: 18
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -1
  },
  heroSummary: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14
  },
  tag: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  tagText: {
    fontSize: 12,
    fontWeight: "700"
  },
  markdownWrap: {
    paddingHorizontal: 2
  },
  codeBlockWrap: {
    marginBottom: 14,
    borderRadius: 14,
    overflow: "hidden"
  },
  missingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12
  },
  missingTitle: {
    fontSize: 20,
    fontWeight: "700"
  },
  backFallback: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  backFallbackLabel: {
    fontSize: 13,
    fontWeight: "800"
  }
});
