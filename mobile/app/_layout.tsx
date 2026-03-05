import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NotesProvider } from "../src/state/NotesProvider";
import { ThemeProvider, useAppTheme } from "../src/theme/ThemeProvider";

function RootNavigator() {
  const { resolvedTheme, colors } = useAppTheme();

  return (
    <>
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background
          },
          animation: "fade_from_bottom",
          fullScreenGestureEnabled: true,
          gestureEnabled: true
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="reader/[id]" options={{ presentation: "card", animation: "slide_from_right" }} />
        <Stack.Screen name="search" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="settings" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <NotesProvider>
          <RootNavigator />
        </NotesProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
