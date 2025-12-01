import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function PostListItem() {
  const { height } = Dimensions.get("window");
  const insets = useSafeAreaInsets();

  const videoSource =
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true;
    player.play();
  });

  return (
    <SafeAreaView style={{ height: height - insets.bottom }}>
      <VideoView
        player={player}
        contentFit="cover"
        style={{ flex: 1 }}
        nativeControls={false}
      />

      <View style={styles.interactionBar}>
        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => console.log("like")}
        >
          <Ionicons name="heart" size={33} color="white" />
          <Text style={styles.interactionText}>0</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => console.log("comment")}
        >
          <Ionicons name="chatbubble" size={33} color="white" />
          <Text style={styles.interactionText}>0</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => console.log("share")}
        >
          <Ionicons name="arrow-redo" size={33} color="white" />
          <Text style={styles.interactionText}>20</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatar}
          onPress={() => console.log("profile")}
        >
          <View>
            <Text style={styles.avatarText}>J</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.videoInfo}>
        <Text style={styles.username}>Jake</Text>
        <Text style={styles.description}>Some random description</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  interactionBar: {
    position: "absolute", // on top of video
    right: 20,
    bottom: 80,
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
    bottom: 80,
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
