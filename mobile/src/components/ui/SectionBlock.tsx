import type { PropsWithChildren, ReactNode } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { StyleSheet, Text, View } from "react-native";
import { SurfaceCard } from "./SurfaceCard";
import { useAppTheme } from "../../theme/ThemeProvider";
import { uiSpacing, uiType, type SurfacePreset } from "../../theme/ui";

type SectionBlockProps = PropsWithChildren<{
  eyebrow?: string;
  title?: string;
  description?: string;
  caption?: string;
  titleStyle?: StyleProp<TextStyle>;
  accessory?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  intensity?: number;
  preset?: SurfacePreset;
}>;

export function SectionBlock({
  children,
  eyebrow,
  title,
  description,
  caption,
  titleStyle,
  accessory,
  style,
  contentStyle,
  intensity,
  preset = "section"
}: SectionBlockProps) {
  const { colors } = useAppTheme();
  const hasHeader = eyebrow || title || description || caption || accessory;

  return (
    <SurfaceCard preset={preset} contentPreset={preset} style={style} contentStyle={contentStyle} intensity={intensity}>
      {hasHeader ? (
        <View style={styles.header}>
          <View style={styles.copy}>
            {eyebrow ? <Text style={[uiType.eyebrow, { color: colors.primary }]}>{eyebrow}</Text> : null}
            {title ? <Text style={[uiType.sectionTitle, styles.title, titleStyle, { color: colors.foreground }]}>{title}</Text> : null}
            {description ? <Text style={[uiType.body, styles.description, { color: colors.muted }]}>{description}</Text> : null}
            {caption ? <Text style={[uiType.caption, { color: colors.subtle }]}>{caption}</Text> : null}
          </View>
          {accessory ? <View style={styles.accessory}>{accessory}</View> : null}
        </View>
      ) : null}
      {children ? <View style={styles.content}>{children}</View> : null}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: uiSpacing.sm
  },
  copy: {
    flex: 1,
    gap: uiSpacing.xs
  },
  title: {
    marginTop: 1
  },
  description: {
    marginTop: 1
  },
  accessory: {
    alignSelf: "center"
  },
  content: {
    marginTop: uiSpacing.md,
    gap: uiSpacing.md
  }
});
