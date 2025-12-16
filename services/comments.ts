import { supabase } from "@/lib/supabase";
import { NewCommentInput } from "@/types/types";

// get comments by post id
export const fetchCommentsById = async (postId: string) => {
  const { data } = await supabase
    .from("comments")
    .select(`*, user:profiles(*)`)
    .eq("post_id", postId)
    .order("id", { ascending: true })
    .throwOnError();

  return data;
};

// create a new comment
export const createComment = async (newComment: NewCommentInput) => {
  const { data } = await supabase
    .from("comments")
    .insert(newComment)
    .select()
    .throwOnError();

  return data;
};

// update a comment
export const updateComment = async (
  commentId: string,
  updatedComment: string
) => {
  const { data } = await supabase
    .from("comments")
    .update({ comment: updatedComment })
    .eq("id", commentId)
    .select()
    .throwOnError();

  return data;
};

// get a comment by id
export const getComment = async (commentId: string) => {
  const { data } = await supabase
    .from("comments")
    .select("*")
    .eq("id", commentId)
    .single()
    .throwOnError();

  return data;
};

// delete a comment by id
export const deleteComment = async (commentId: string) => {
  const { data } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .select()
    .throwOnError();

  return data;
};
