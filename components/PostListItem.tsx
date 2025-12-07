import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Post } from "@/types/types";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

type VideoItemProps = {
  postItem: Post;
  isActive: boolean;
};

export default function PostListItem({ postItem, isActive }: VideoItemProps) {
  const { top, bottom } = useSafeAreaInsets();
  const { height } = Dimensions.get("window");
  const { video_url, description, user, nrOfComments } = postItem;

  const player = useVideoPlayer(video_url, (player) => {
    player.loop = true;
    player.play();
  });

  useFocusEffect(
    // if we used tab navigation without the useFocusEffect, the video would not play/pause when the tab is changed
    // useFocusEffect is a hook that allows us to play/pause the video when the screen is focused/unfocused
    useCallback(() => {
      if (!player) return;

      try {
        if (isActive) {
          player.play();
        } else {
          player.pause();
        }
      } catch (error) {
        console.error("Error playing/pausing video: ", error);
      }

      return () => {
        try {
          if (player && isActive) {
            player.pause();
          }
        } catch (error) {
          console.error("Error playing/pausing video on unmount: ", error);
        }
      };
    }, [isActive, player])
  );

  return (
    <View
      style={{
        height: height - (top + bottom),
      }}
    >
      <VideoView
        player={player}
        contentFit="cover"
        style={{ flex: 1, marginBottom: 10 }}
        nativeControls={true}
      />

      <View style={[styles.interactionBar, { bottom: bottom + 25 }]}>
        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => console.log("like")}
        >
          <Ionicons name="heart" size={33} color="white" />
          <Text style={styles.interactionText}>{0}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => console.log("comment")}
        >
          <Ionicons name="chatbubble" size={33} color="white" />
          <Text style={styles.interactionText}>
            {nrOfComments?.[0]?.count || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => console.log("share")}
        >
          <Ionicons name="arrow-redo" size={33} color="white" />
          <Text style={styles.interactionText}>{0}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatar}
          onPress={() => console.log("profile")}
        >
          <View>
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0)?.toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.videoInfo, { bottom: bottom + 25 }]}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  interactionBar: {
    position: "absolute", // on top of video
    right: 20,
    alignItems: "center",
    gap: 25,
  },

  interactionButton: {
    alignItems: "center",
    gap: 5,
  },

  interactionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },

  avatar: {
    width: 35,
    height: 35,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 25,
    fontWeight: "bold",
  },

  videoInfo: {
    position: "absolute",
    left: 20,
    right: 100,
    gap: 5,
  },

  username: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  description: {
    color: "white",
  },
});
