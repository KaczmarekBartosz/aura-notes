import { memo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowUpRight, Star } from "lucide-react-native";
import type { Note } from "../../types/note";
import { HighlightedText } from "../common/HighlightedText";
import { formatRelativeDate } from "../../utils/date";
import { getCategoryIcon, getCategoryLabel } from "../../constants/categories";
import { getQuerySnippet } from "../../utils/noteFilters";
import { SurfaceCard } from "../ui/SurfaceCard";
import { useAppTheme } from "../../theme/ThemeProvider";

type NoteCardProps = {
  note: Note;
  query: string;
  onPress: (noteId: string) => void;
  onToggleFavorite: (noteId: string) => void;
};

function NoteCardComponent({ note, query, onPress, onToggleFavorite }: NoteCardProps) {
  const { colors, isGlass } = useAppTheme();
  const CategoryIcon = getCategoryIcon(note.category);
  const preview = getQuerySnippet(note, query);
  const primaryTag = note.tags[0];

  return (
    <SurfaceCard
      onPress={() => onPress(note.id)}
      accessibilityRole="button"
      accessibilityLabel={`Otwórz notatkę ${note.title}`}
      accessibilityHint="Przechodzi do czytnika markdown"
      contentStyle={styles.content}
      style={{
        borderColor: isGlass ? colors.borderStrong : colors.border,
        shadowColor: colors.shadow
      }}
      intensity={isGlass ? 52 : undefined}
    >
      <LinearGradient colors={[...colors.activeGradient]} start={{ x: 0, y: 0.4 }} end={{ x: 1, y: 0.6 }} style={styles.accentRail} />

      <View style={styles.topRow}>
        <View
          style={[
            styles.categoryPill,
            {
              backgroundColor: colors.tagBackground,
              borderColor: colors.border
            }
          ]}
        >
          <CategoryIcon size={12} color={colors.primary} />
          <Text style={[styles.categoryText, { color: colors.foreground }]}>{getCategoryLabel(note.category)}</Text>
        </View>

        <View
          style={[
            styles.metaPill,
            {
              backgroundColor: colors.primarySoft,
              borderColor: colors.border
            }
          ]}
        >
          <Text style={[styles.metaPillText, { color: colors.primary }]}>{formatRelativeDate(note.updatedAt)}</Text>
        </View>
      </View>

      <View style={styles.mainRow}>
        <View style={styles.copyCol}>
          <HighlightedText
            text={note.title}
            query={query}
            numberOfLines={2}
            style={[styles.title, { color: colors.foreground }]}
            highlightStyle={{
              color: colors.primary,
              backgroundColor: colors.primarySoft,
              fontWeight: "800"
            }}
          />

          <HighlightedText
            text={preview}
            query={query}
            numberOfLines={4}
            style={[styles.excerpt, { color: colors.muted }]}
            highlightStyle={{
              color: colors.primary,
              backgroundColor: colors.primarySoft,
              fontWeight: "700"
            }}
          />
        </View>

        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onToggleFavorite(note.id);
          }}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={note.isFavorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
          accessibilityHint="Przełącza status ulubionej notatki"
          style={[
            styles.favoriteButton,
            {
              backgroundColor: note.isFavorite ? colors.warning : isGlass ? colors.tagBackground : colors.surface,
              borderColor: note.isFavorite ? colors.warning : colors.border
            }
          ]}
        >
          <Star size={15} color={note.isFavorite ? colors.primaryForeground : colors.subtle} fill={note.isFavorite ? colors.primaryForeground : "none"} />
        </Pressable>
      </View>

      <View style={styles.footerRow}>
        <View style={[styles.footerPill, { backgroundColor: colors.tagBackground, borderColor: colors.border }]}> 
          <Text style={[styles.footerText, { color: colors.foreground }]}>{note.readingMinutes} min</Text>
        </View>
        <View style={[styles.footerPill, { backgroundColor: colors.tagBackground, borderColor: colors.border }]}> 
          <Text style={[styles.footerText, { color: colors.foreground }]}>{note.words} słów</Text>
        </View>
        {primaryTag ? (
          <View style={[styles.footerPill, { backgroundColor: colors.tagBackground, borderColor: colors.border }]}> 
            <Text style={[styles.footerText, { color: colors.primary }]}>#{primaryTag}</Text>
          </View>
        ) : null}
        <View style={styles.grow} />
        <ArrowUpRight size={14} color={colors.subtle} />
      </View>
    </SurfaceCard>
  );
}

function areEqual(prev: NoteCardProps, next: NoteCardProps) {
  return (
    prev.query === next.query &&
    prev.note.id === next.note.id &&
    prev.note.category === next.note.category &&
    prev.note.title === next.note.title &&
    prev.note.excerpt === next.note.excerpt &&
    prev.note.updatedAt === next.note.updatedAt &&
    prev.note.words === next.note.words &&
    prev.note.readingMinutes === next.note.readingMinutes &&
    prev.note.isFavorite === next.note.isFavorite &&
    prev.note.tags.join("|") === next.note.tags.join("|")
  );
}

export const NoteCard = memo(NoteCardComponent, areEqual);

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 15,
    paddingVertical: 14,
    gap: 12
  },
  accentRail: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    height: 3,
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
    opacity: 0.82
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 2
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700"
  },
  metaPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6
  },
  metaPillText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14
  },
  copyCol: {
    flex: 1,
    gap: 8
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
    letterSpacing: -0.6
  },
  excerpt: {
    fontSize: 13,
    lineHeight: 19
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  footerPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6
  },
  footerText: {
    fontSize: 10,
    fontWeight: "700"
  },
  grow: {
    flex: 1
  }
});
