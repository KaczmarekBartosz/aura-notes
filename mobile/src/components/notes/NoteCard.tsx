import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowUpRight, Star } from "lucide-react-native";
import type { Note } from "../../types/note";
import { HighlightedText } from "../common/HighlightedText";
import { formatRelativeDate } from "../../utils/date";
import { getCategoryIcon, getCategoryLabel } from "../../constants/categories";
import { getQuerySnippet } from "../../utils/noteFilters";
import { SurfaceCard } from "../ui/SurfaceCard";
import { useAppTheme } from "../../theme/ThemeProvider";
import { uiControl, uiRadius, uiSpacing, uiType } from "../../theme/ui";

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
      preset="list"
      contentPreset="list"
      onPress={() => onPress(note.id)}
      accessibilityRole="button"
      accessibilityLabel={`Otwórz notatkę ${note.title}`}
      accessibilityHint="Przechodzi do czytnika markdown"
      style={{
        borderColor: isGlass ? colors.borderStrong : colors.border,
        shadowColor: colors.shadow
      }}
      intensity={isGlass ? 52 : undefined}
    >
      <View style={styles.headerRow}>
        <View style={styles.metaLeading}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.primarySoft }]}> 
            <CategoryIcon size={13} color={colors.primary} />
            <Text style={[uiType.meta, styles.categoryText, { color: colors.foreground }]}>{getCategoryLabel(note.category)}</Text>
          </View>
          <Text style={[uiType.meta, styles.updatedText, { color: colors.muted }]}>{formatRelativeDate(note.updatedAt)}</Text>
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
              backgroundColor: note.isFavorite ? colors.warning : colors.tagBackground,
              borderColor: note.isFavorite ? colors.warning : colors.border
            }
          ]}
        >
          <Star size={17} color={note.isFavorite ? colors.primaryForeground : colors.subtle} fill={note.isFavorite ? colors.primaryForeground : "none"} />
        </Pressable>
      </View>

      <View style={styles.copyBlock}>
        <HighlightedText
          text={note.title}
          query={query}
          numberOfLines={2}
          style={[uiType.sectionTitle, styles.title, { color: colors.foreground }]}
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
          style={[uiType.body, styles.excerpt, { color: colors.muted }]}
          highlightStyle={{
            color: colors.primary,
            backgroundColor: colors.primarySoft,
            fontWeight: "700"
          }}
        />
      </View>

      <View style={styles.footerRow}>
        <View style={styles.footerMetaGroup}>
          <Text style={[uiType.meta, { color: colors.foreground }]}>{note.readingMinutes} min</Text>
          <View style={[styles.metaDot, { backgroundColor: colors.borderStrong }]} />
          <Text style={[uiType.meta, { color: colors.foreground }]}>{note.words} słów</Text>
          {primaryTag ? (
            <>
              <View style={[styles.metaDot, { backgroundColor: colors.borderStrong }]} />
              <Text style={[uiType.meta, { color: colors.primary }]}>#{primaryTag}</Text>
            </>
          ) : null}
        </View>

        <View style={styles.disclosureWrap}>
          <ArrowUpRight size={15} color={colors.subtle} />
        </View>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: uiSpacing.sm
  },
  metaLeading: {
    flex: 1,
    gap: uiSpacing.xs,
    minWidth: 0
  },
  categoryBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: uiSpacing.xs,
    borderRadius: uiRadius.pill,
    paddingHorizontal: uiSpacing.sm,
    paddingVertical: uiSpacing.xs
  },
  categoryText: {
    fontWeight: "700"
  },
  updatedText: {
    paddingLeft: uiSpacing.xs
  },
  favoriteButton: {
    width: uiControl.minTouch,
    height: uiControl.minTouch,
    borderRadius: uiRadius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  copyBlock: {
    gap: uiSpacing.xs
  },
  title: {
    fontSize: 18,
    lineHeight: 24
  },
  excerpt: {
    fontSize: 15,
    lineHeight: 21
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: uiSpacing.sm
  },
  footerMetaGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: uiSpacing.xs,
    flexWrap: "wrap",
    flex: 1,
    minWidth: 0
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: uiRadius.pill
  },
  disclosureWrap: {
    width: uiControl.minTouch,
    alignItems: "flex-end",
    justifyContent: "center"
  }
});
