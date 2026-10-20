import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "index",
};
// export async function getEsAdmin(): Promise<boolean> {
//   try {
//     const token = await AsyncStorage.getItem("token");
//     if (!token) return false;

//     const decoded = jwtDecode<{ rol?: string }>(token);
//     return decoded?.rol === "admin";
//   } catch (error) {
//     return false;
//   }
// }
export default function RootLayoutNav() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Ocultar el splash screen de inmediato una vez que el RootLayout se monta
    SplashScreen.hideAsync();
  }, []);
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="registro" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="editarServicio" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
