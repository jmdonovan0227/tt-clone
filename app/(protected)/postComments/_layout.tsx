import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, Text } from "react-native";

export default function PostCommentsLayout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          headerBackButtonDisplayMode: "default",
          headerStyle: {
            backgroundColor: "black",
          },

          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerTitle: () => (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "white", fontWeight: "bold", fontSize: 20 }}
              >
                Comments
              </Text>
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
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
