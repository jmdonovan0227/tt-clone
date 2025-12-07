import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { useAuthStore } from "@/stores/useAuthStore";

const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  const onLogoutPressed = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" }, // this is the cancel button
      { text: "Logout", style: "destructive", onPress: handleLogout }, // this is the logout button
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.email?.charAt(0)?.toUpperCase()}
          </Text>
        </View>

        <View>
          <Text style={styles.userName}>{user?.username}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogoutPressed}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 40,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "black",
    fontSize: 40,
    fontWeight: "bold",
  },
  userInfo: {
    alignItems: "center",
    gap: 20,
  },
  userName: {
    fontSize: 25,
    color: "white",
    textAlign: "center",
  },
  userEmail: {
    fontSize: 16,
    color: "#999",
  },
  logoutButton: {
    backgroundColor: "#FF4444",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
});
