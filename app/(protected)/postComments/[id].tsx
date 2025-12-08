import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCommentsById, createComment } from "@/services/comments";
import { NewCommentInput } from "@/types/types";
import { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

export default function PostComments() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [commentText, setCommentText] = useState("");

  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

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

  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  return (
    <View style={{ flex: 1, padding: 15, gap: 20 }}>
      <FlatList
        data={comments || []}
        renderItem={({ item }) => (
          <View>
            <Text style={{ color: "white", fontSize: 15, fontWeight: "bold" }}>
              {item?.user?.username}
            </Text>
            <Text style={{ color: "white" }}>{item?.comment}</Text>
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
