import { Tabs } from "expo-router";
import { Entypo, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Entypo name="home" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="friends" // name is name of the screen in the url meaning '/friends' is the route.
        options={{
          title: "Friends", // title that shows up on tab bar (bottom of screen)
          tabBarIcon: (
            { color, size } // this is the icon that will show on the tab bar!
          ) => <Feather name="users" color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="newPost"
        options={{
          title: "New Post",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name="plus-square" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="message-minus-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
