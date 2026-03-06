import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "../src/components/ui/ScreenContainer";
import { useAppTheme } from "../src/theme/ThemeProvider";

export default function NotFoundScreen() {
  const { colors } = useAppTheme();

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <View style={styles.wrap}>
        <Text style={[styles.code, { color: colors.foreground }]}>404</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>Ten ekran nie istnieje.</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Wracam do głównej listy notatek.</Text>
        <Pressable
          onPress={() => router.replace("/")}
          style={[styles.button, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}
        >
          <Text style={[styles.buttonLabel, { color: colors.primary }]}>Wróć do listy</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  code: {
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: -1.2
  },
  title: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "700"
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center"
  },
  button: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: "800"
  }
});
