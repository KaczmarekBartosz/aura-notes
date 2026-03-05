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
          }
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="reader/[id]" options={{ presentation: "card" }} />
        <Stack.Screen name="search" options={{ presentation: "modal" }} />
        <Stack.Screen name="settings" options={{ presentation: "modal" }} />
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

