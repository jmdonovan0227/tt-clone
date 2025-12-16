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
import { useQuery } from "@tanstack/react-query";
import { getComment } from "@/services/comments";

type EditCommentFormData = {
  comment: string;
};

const editCommentSchema = z.object({
  comment: z.string().min(1, { message: "Comment is required" }),
});

export default function EditComment() {
  const router = useRouter();

  const { commentId } = useLocalSearchParams<{ commentId: string }>();

  const {
    data: comment,
    isLoading: isLoadingComment,
    isError: isErrorComment,
  } = useQuery({
    queryKey: ["comment", commentId],
    queryFn: () => getComment(commentId),
    enabled: !!commentId,
  });

  console.log("commentId: ", commentId);
  console.log("comment: ", comment);

  const { control, handleSubmit, setValue } = useForm<EditCommentFormData>({
    resolver: zodResolver(editCommentSchema),
  });

  useEffect(() => {
    if (comment) {
      setValue("comment", comment.comment);
    }
  }, [comment]);

  const onSubmit: SubmitHandler<EditCommentFormData> = (data) => {
    console.log(data);
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
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Save</Text>
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
