import { Stack } from "expo-router";

export default function PostCommentsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: "Comments",
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <Stack.Screen
        name="comment/[commentId]"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
