import { supabase } from "@/lib/supabase";
import { PostInput } from "@/types/types";

type StorageInput = {
  fileName: string;
  fileExtension: string;
  fileBuffer: Uint8Array;
};

type PaginationInput = {
  cursor?: number; // id of the last post
  limit?: number; // number of posts to fetch
};

export const fetchPosts = async (pageParams: PaginationInput) => {
  let query = supabase
    .from("posts")
    .select(
      `*, user:profiles(*), nrOfComments:comments(count), nrOfLikes:likes(count)`
    )
    .order("id", { ascending: false });

  if (pageParams.limit) {
    query = query.limit(pageParams.limit);
  }

  if (pageParams.cursor) {
    query = query.lt("id", pageParams.cursor);
  }

  const { data } = await query.throwOnError();
  console.log("data in fetchPosts: ", data);
  return data;
};

export const uploadVideoToStorage = async (storageProps: StorageInput) => {
  const { fileName, fileExtension, fileBuffer } = storageProps;
  const sanitizedFileExtension = fileExtension.replace(/^\./, "").toLowerCase();

  const { error } = await supabase.storage
    .from("videos")
    .upload(fileName, fileBuffer, {
      contentType: `video/${sanitizedFileExtension}`,
    });

  if (error) {
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from("videos")
    .getPublicUrl(fileName);
  return urlData.publicUrl;
};

export const createPost = async (newPosts: PostInput) => {
  const { data } = await supabase.from("posts").insert(newPosts).throwOnError();

  return data;
};
