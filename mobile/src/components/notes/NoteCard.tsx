import { Pressable, StyleSheet, Text, View } from "react-native";
import { Star } from "lucide-react-native";
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

export function NoteCard({ note, query, onPress, onToggleFavorite }: NoteCardProps) {
  const { colors, isGlass } = useAppTheme();
  const CategoryIcon = getCategoryIcon(note.category);
  const preview = getQuerySnippet(note, query);

  return (
    <SurfaceCard
      onPress={() => onPress(note.id)}
      accessibilityRole="button"
      accessibilityLabel={`Otwórz notatkę ${note.title}`}
      contentStyle={styles.content}
      style={{
        borderColor: colors.border,
        shadowColor: colors.shadow
      }}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerMeta}>
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
            <Text style={[styles.categoryText, { color: colors.muted }]}>{getCategoryLabel(note.category)}</Text>
          </View>

          <HighlightedText
            text={note.title}
            query={query}
            style={[styles.title, { color: colors.foreground }]}
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
              backgroundColor: isGlass ? colors.tagBackground : colors.surface,
              borderColor: colors.border
            }
          ]}
        >
          <Star
            size={16}
            color={note.isFavorite ? colors.warning : colors.subtle}
            fill={note.isFavorite ? colors.warning : "none"}
          />
        </Pressable>
      </View>

      <HighlightedText
        text={preview}
        query={query}
        style={[styles.excerpt, { color: colors.muted }]}
        highlightStyle={{
          color: colors.primary,
          backgroundColor: colors.primarySoft,
          fontWeight: "600"
        }}
      />

      <View style={styles.footerRow}>
        <Text style={[styles.metaText, { color: colors.subtle }]}>{formatRelativeDate(note.updatedAt)}</Text>
        <View style={[styles.dot, { backgroundColor: colors.subtle }]} />
        <Text style={[styles.metaText, { color: colors.subtle }]}>{note.readingMinutes} min</Text>
        {!!note.tags.length && (
          <>
            <View style={[styles.dot, { backgroundColor: colors.subtle }]} />
            <Text style={[styles.metaText, { color: colors.subtle }]}>#{note.tags[0]}</Text>
          </>
        )}
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12
  },
  headerMeta: {
    flex: 1,
    gap: 10
  },
  categoryPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600"
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    letterSpacing: -0.4
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  excerpt: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 21
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14
  },
  metaText: {
    fontSize: 12,
    fontWeight: "600"
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 999
  }
});
