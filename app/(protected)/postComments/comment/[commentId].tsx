import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getComment, updateComment } from "@/services/comments";

type EditCommentFormData = {
  comment: string;
};

const editCommentSchema = z.object({
  comment: z.string().min(1, { message: "Comment is required" }),
});

export default function EditComment() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { commentId } = useLocalSearchParams<{ commentId: string }>();

  const {
    data,
    isLoading: isLoadingComment,
    isError: isErrorComment,
  } = useQuery({
    queryKey: ["comment", commentId],
    queryFn: () => getComment(commentId),
    enabled: !!commentId,
  });

  const updateCommentMutation = useMutation({
    mutationFn: (updatedComment: string) =>
      updateComment(commentId, updatedComment),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["comment", commentId] }),
        queryClient.invalidateQueries({ queryKey: ["comments"] }),
      ]);
      router.back();
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditCommentFormData>({
    resolver: zodResolver(editCommentSchema),
  });

  useEffect(() => {
    if (data) {
      setValue("comment", data?.comment);
    }
  }, [data]);

  // update comment
  const onSubmit: SubmitHandler<EditCommentFormData> = async (data) => {
    try {
      await updateCommentMutation.mutateAsync(data.comment);
    } catch (error) {
      console.error("Error updating comment: ", error);
    }
  };

  if (isLoadingComment) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={"white"} />
      </View>
    );
  } else if (isErrorComment) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "white" }}>
          Sorry, we are having trouble loading your comment!
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%" }}
        >
          <Controller
            control={control}
            name="comment"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                multiline
                numberOfLines={10}
              />
            )}
          />
        </KeyboardAvoidingView>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 20,
            width: "100%",
            marginTop: 20,
          }}
        >
          <TouchableOpacity
            style={styles.button}
            disabled={isSubmitting}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            disabled={isSubmitting || !!errors.comment}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FF0050",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
    width: 100,
  },

  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#1a1a1a",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    color: "white",
  },
});
