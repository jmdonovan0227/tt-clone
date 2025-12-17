import { Stack } from "expo-router";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import * as SplashScreen from "expo-splash-screen";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";

// prevent the splash screen from auto hiding while we wait for the store to be hydrated
SplashScreen.preventAutoHideAsync();

export const queryClient = new QueryClient();

export default function RootLayout() {
  useSupabaseAuth(); // this is used to tell Supabase Auth to continuously refresh the session automatically if the app is in the foreground

  // hydration is the process of loading the store from the persisted state
  // hydration can be done synchronously or asynchronously
  // in our case, we use async hydration because Persist middleware uses AsyncStorage
  // if it was synchronous it would have been hydrated at store creation time,
  // but async hydration happens later. This can cause issues such as if we rely
  // on Zustand to persist a logged in user, well it may look like they aren't logged in at
  // first because the store wasn't hydrated.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // if has been hydrated already, set hydrated to true
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      SplashScreen.hideAsync();
      return;
    }
    // else wait for zustand store to be hydrated
    const unsubscribeFinishHydration = useAuthStore.persist.onFinishHydration(
      () => {
        setHydrated(true);
        SplashScreen.hideAsync();
      }
    ); // NOTE: this creates a listener that will be called when the store is hydrated, and
    // it returns a function that can be used to unsubscribe the listener

    return () => {
      // unsubscribe the listener on unmount
      unsubscribeFinishHydration();
    };
  }, []);

  const myTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: "white",
    },
  };

  if (!hydrated) {
    return null;
  }

  return (
    <>
      <StatusBar hidden={true} />
      <SafeAreaProvider>
        <ThemeProvider value={myTheme}>
          <QueryClientProvider client={queryClient}>
            <Stack>
              <Stack.Screen
                name="(protected)"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            </Stack>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </>
  );
}
