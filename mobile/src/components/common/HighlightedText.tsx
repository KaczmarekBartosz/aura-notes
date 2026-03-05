import { Text, type StyleProp, type TextStyle } from "react-native";

type HighlightedTextProps = {
  text: string;
  query: string;
  className?: string;
  style?: StyleProp<TextStyle>;
  highlightStyle?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

export function HighlightedText({ text, query, className, style, highlightStyle, numberOfLines }: HighlightedTextProps) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return (
      <Text className={className} style={style} numberOfLines={numberOfLines}>
        {text}
      </Text>
    );
  }

  const escaped = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const splitRegex = new RegExp(`(${escaped})`, "gi");
  const exactRegex = new RegExp(`^${escaped}$`, "i");
  const parts = text.split(splitRegex);

  return (
    <Text className={className} style={style} numberOfLines={numberOfLines}>
      {parts.map((part, index) =>
        exactRegex.test(part) ? (
          <Text key={`${part}-${index}`} style={highlightStyle}>
            {part}
          </Text>
        ) : (
          <Text key={`${part}-${index}`}>{part}</Text>
        )
      )}
    </Text>
  );
}
