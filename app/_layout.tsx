import { Stack } from "expo-router";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { ActivityIndicator } from "react-native";

export default function RootLayout() {
  // hydration is the process of loading the store from the persisted state
  // hydration can be done synchronously or asynchronously
  // in our case, we use async hydration because Persist middleware uses AsyncStorage
  // if it was synchronous it would have been hydrated at store creation time,
  // but async hydration happens later. This can cause issues such as if we rely
  // on Zustand to persist a logged in user, well it may look like they aren't logged in at
  // first because the store wasn't hydrated.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // wait for zustand store to be hydrated
    const unsubscribeFinishHydration = useAuthStore.persist.onFinishHydration(
      () => {
        setHydrated(true);
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
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={myTheme}>
        <Stack>
          <Stack.Screen name="(protected)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
