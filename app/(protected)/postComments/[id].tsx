import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCommentsById, createComment } from "@/services/comments";
import { NewCommentInput } from "@/types/types";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { supabase } from "@/lib/supabase";
import { Entypo } from "@expo/vector-icons";

export default function PostComments() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [commentText, setCommentText] = useState("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  useEffect(() => {
    const commentsChannel = supabase
      .channel(`comments-channel-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${id}`,
        },
        (payload) => {
          if (payload.new.user_id !== user?.id) {
            // get new comments for other users
            queryClient.invalidateQueries({ queryKey: ["comments", id] });
          }
        }
      )
      .subscribe((status) => {
        console.log("status: ", status);
      });

    return () => {
      commentsChannel.unsubscribe();
    };
  }, []);

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => fetchCommentsById(id),
    enabled: !!id,
  });

  const { mutate: addComment, isPending } = useMutation({
    mutationFn: (newComment: NewCommentInput) => createComment(newComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setCommentText("");
    },
    onError: (error) => {
      Alert.alert("Error adding comment", error.message);
    },
  });

  const addNewComment = () => {
    if (!id || !commentText.trim() || !user) {
      return;
    }

    addComment({ post_id: id, comment: commentText.trim(), user_id: user.id });
  };

  const handleEditComment = () => {
    console.log("edit comment");
  };

  const handleDeleteComment = () => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        { text: "Delete", onPress: () => console.log("delete comment") },
      ]
    );
  };

  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  console.log("comments: ", comments);

  return (
    <View style={{ flex: 1, padding: 15, gap: 20 }}>
      <FlatList
        data={comments || []}
        renderItem={({ item }) => (
          <View style={styles.commentContainer}>
            <View>
              <Text
                style={{ color: "white", fontSize: 15, fontWeight: "bold" }}
              >
                {item?.user?.username}
              </Text>
              <Text style={{ color: "white" }}>{item?.comment}</Text>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              {item.user_id === user?.id && (
                <>
                  <TouchableOpacity
                    onPress={() => router.push(`./comment/${item.id}`)}
                  >
                    <Entypo name="edit" size={22} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleDeleteComment}>
                    <Entypo name="trash" size={22} color="red" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ gap: 10 }}
      />

      <View style={{ marginBottom: 20 }}>
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Add a comment"
          placeholderTextColor="gray"
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 5,
            padding: 10,
            color: "white",
          }}
        />

        <TouchableOpacity
          style={{
            backgroundColor: "#FF0050",
            paddingHorizontal: 15,
            paddingVertical: 10,
            borderRadius: 10,
            marginTop: 10,
          }}
          onPress={addNewComment}
          disabled={isPending || !commentText.trim()}
        >
          <Text
            style={{
              fontSize: 19,
              fontWeight: "bold",
              color: "white",
              textAlign: "center",
            }}
          >
            {isPending ? "Posting..." : "Post"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
