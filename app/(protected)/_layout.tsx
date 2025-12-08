import { Stack, Redirect } from "expo-router";
import { useAuthStore } from "@/stores/useAuthStore";

export default function ProtectedLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="postComments/[id]"
        options={{
          headerShown: true,
          title: "Comments",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
    </Stack>
  );
}
