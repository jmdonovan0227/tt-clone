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
import { useFocusEffect, Link } from "expo-router";
import { useCallback, useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/useAuthStore";

type VideoItemProps = {
  postItem: Post;
  isActive: boolean;
};

type LikeRecord = {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
};

export default function PostListItem({ postItem, isActive }: VideoItemProps) {
  const { top, bottom } = useSafeAreaInsets();
  const { height } = Dimensions.get("window");
  const {
    video_url,
    description,
    user: postUser,
    nrOfComments,
    nrOfLikes,
  } = postItem;
  const [isLiked, setIsLiked] = useState(false);
  const [likeRecord, setLikeRecord] = useState<LikeRecord | null>(null);
  const [likeCount, setLikeCount] = useState(nrOfLikes?.[0]?.count || 0);
  const isInitializing = useRef(true);

  const user = useAuthStore((state) => state.user);

  const player = useVideoPlayer(video_url, (player) => {
    player.loop = true;
    player.play();
  });

  useEffect(() => {
    fetchLikeStatus();

    const likesChannel = supabase
      .channel(`likes-channel-${postItem.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "likes",
          filter: `post_id=eq.${postItem.id}`,
        },
        (payload) => {
          if (
            payload.eventType === "INSERT" &&
            payload.new.user_id !== user?.id
          ) {
            setLikeCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();
  }, []);

  useEffect(() => {
    if (isInitializing.current) {
      isInitializing.current = false;
      return;
    }

    if (isLiked) {
      saveLike();
    } else {
      removeLike();
    }
  }, [isLiked]);

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

  // function to fetch the like status for the post for the current user
  const fetchLikeStatus = async () => {
    try {
      const { data: fetchedLikeRecord, error: fetchError } = await supabase
        .from("likes")
        .select(`*`, { count: "exact" })
        .eq("post_id", postItem.id)
        .eq("user_id", user?.id)
        .single();

      if (fetchedLikeRecord && !fetchError) {
        setLikeRecord(fetchedLikeRecord);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error fetching likes: ", error);
    }
  };

  // create a like for the post for the current user
  const saveLike = async () => {
    if (likeRecord || !user) return;

    try {
      const { data: insertedLikeRecord, error: insertError } = await supabase
        .from("likes")
        .insert({
          post_id: postItem.id,
          user_id: user.id,
        })
        .select("*")
        .single();

      if (insertedLikeRecord && !insertError) {
        setLikeRecord(insertedLikeRecord);
        setIsLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error saving like: ", error);
    }
  };

  // remove a like for the post for the current user
  const removeLike = async () => {
    if (!user || !likeRecord) return;

    try {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("id", likeRecord?.id);

      if (!error) {
        setLikeRecord(null);
        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
      }
    } catch (error) {
      console.error("Error removing like: ", error);
    }
  };

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
      />

      <View style={[styles.interactionBar, { bottom: bottom + 25 }]}>
        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => setIsLiked(!isLiked)}
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={33}
            color="white"
          />
          <Text style={styles.interactionText}>{likeCount}</Text>
        </TouchableOpacity>

        <Link href={`/postComments/${postItem.id}`} asChild>
          <TouchableOpacity style={styles.interactionButton}>
            <Ionicons name="chatbubble" size={33} color="white" />
            <Text style={styles.interactionText}>
              {nrOfComments?.[0]?.count || 0}
            </Text>
          </TouchableOpacity>
        </Link>

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
              {postUser?.username?.charAt(0)?.toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.videoInfo, { bottom: bottom + 25 }]}>
        <Text style={styles.username}>{postUser?.username}</Text>
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
