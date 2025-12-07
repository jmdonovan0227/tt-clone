import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";
import * as FileSystem from "expo-file-system";
import { uploadVideoToStorage, createPost } from "@/services/posts";

const NewPost = () => {
  const queryClient = useQueryClient();
  const [facing, setFacing] = useState<CameraType>("back");
  const [isRecording, setIsRecording] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();
  const [video, setVideo] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const user = useAuthStore((state) => state.user);

  const { mutate: createNewPost, isPending } = useMutation({
    mutationFn: async ({
      video,
      description,
    }: {
      video: string;
      description: string;
    }) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const fileExtension = video.split(".").pop() || "mp4";
      const fileName = `${user?.id}/${Date.now()}.${fileExtension}`;
      const file = new FileSystem.File(video);
      const fileBuffer = await file.bytes();

      if (!fileBuffer) {
        throw new Error("Failed to read video file");
      }

      const videoUrl = await uploadVideoToStorage({
        fileName,
        fileExtension,
        fileBuffer,
      });
      await createPost({
        video_url: videoUrl,
        description,
        user_id: user?.id,
      });
    },

    onSuccess: () => {
      // refetch the posts
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      videoPlayer.release();
      setDescription("");
      setVideo(null);
      router.replace("/");
    },

    onError: (error) => {
      Alert.alert(
        "Error",
        error.message || "Something went wrong while creating the post!"
      );
    },
  });

  const videoPlayer = useVideoPlayer(null, (player) => {
    player.loop = true;
  });

  useEffect(() => {
    (async () => {
      if (permission && !permission.granted && permission.canAskAgain) {
        await requestPermission();
      }

      if (
        microphonePermission &&
        !microphonePermission.granted &&
        microphonePermission.canAskAgain
      ) {
        await requestMicrophonePermission();
      }
    })();
  }, [permission, microphonePermission]);

  if (!permission || !microphonePermission) {
    return (
      <View /> // camera permissions are loading so we return an empty view to prevent crashing!
    );
  }

  if (
    (permission && !permission.granted && !permission.canAskAgain) ||
    (microphonePermission &&
      !microphonePermission.granted &&
      !microphonePermission.canAskAgain)
  ) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          We need your permission to use the camera and microphone
        </Text>
        <Button
          title="Grant Permission"
          onPress={() => Linking.openSettings()} // opens the settings page to grant permission
        />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((currentFacing) => (currentFacing === "back" ? "front" : "back"));
  };

  const selectFromGallery = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"], // only allow videos to be selected
        allowsEditing: true,
        aspect: [9, 16], // 9:16 aspect ratio for the video
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setVideo(uri);
        await videoPlayer.replaceAsync(uri);
        videoPlayer.play();
      }
    } catch (error) {
      console.error("❌ Error selecting from gallery: ", error);
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current || !cameraRef) {
      console.error("❌ Camera reference is not available");
      return;
    }

    try {
      setIsRecording(true);
      const recordedVideo = await cameraRef.current?.recordAsync();

      if (recordedVideo?.uri) {
        const uri = recordedVideo.uri; // get the uri of the recorded video
        setVideo(uri); // set the video to the new video
        await videoPlayer.replaceAsync(uri); // replace the video with the new video
        videoPlayer.play(); // play the video
      } else {
        console.log("Failed to record video");
        setVideo(null);
      }
    } catch (error) {
      console.error("❌ Error recording video: ", error);
    }
  };

  const stopRecording = () => {
    try {
      setIsRecording(false);
      cameraRef.current?.stopRecording();
    } catch (error) {
      console.error("❌ Error stopping recording: ", error);
    }
  };

  const dismissVideo = () => {
    try {
      setVideo(null); // remove the video url
      videoPlayer.release(); // this video player is no longer needed so we release it
    } catch (error) {
      console.error("❌ Error dismissing video: ", error);
    }
  };

  const postVideo = () => {
    if (!video) {
      Alert.alert("Error", "Please record or select a video to post!");
      return;
    }

    createNewPost({ video, description });
  };

  const renderCamera = () => {
    return (
      <View style={{ flex: 1 }}>
        <CameraView
          mode="video"
          style={styles.camera}
          facing={facing}
          ref={cameraRef}
        />

        <View style={styles.topBar}>
          <Ionicons
            name="close"
            size={40}
            color="white"
            onPress={() => router.back()}
          />
        </View>

        <View style={styles.bottomControls}>
          <Ionicons
            name="images"
            size={40}
            color="white"
            onPress={selectFromGallery}
          />

          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
            ]}
            onPress={isRecording ? stopRecording : startRecording}
          />

          <Ionicons
            name="camera-reverse"
            size={40}
            color="white"
            onPress={toggleCameraFacing}
          />
        </View>
      </View>
    );
  };

  const renderRecordedVideo = () => {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <Ionicons
          name="close"
          size={32}
          color="white"
          onPress={dismissVideo}
          style={styles.closeIcon}
        />

        <View style={styles.videoWrapper}>
          <VideoView
            player={videoPlayer}
            style={styles.video}
            contentFit="cover"
          />
        </View>

        {/** KeyboardAvoidingView is used to avoid the keyboard from covering the input field when the keyboard is shown */}
        {/** padding is used to add padding to the input field when the keyboard is shown */}
        {/** undefined is used to prevent the keyboard from covering the input field when the keyboard is shown on Android */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.descriptionContainer}
        >
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Add a description..."
            placeholderTextColor="#aaa"
            multiline
          />

          <TouchableOpacity
            style={[styles.postButton, isPending && { opacity: 0.5 }]}
            disabled={isPending}
            onPress={postVideo}
          >
            <Text style={styles.postText}>Post</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  };

  return <>{video ? renderRecordedVideo() : renderCamera()}</>;
};

export default NewPost;

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  permissionText: {
    color: "white",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
  },
  camera: {
    flex: 1,
  },

  recordButton: {
    width: 80,
    height: 80,
    backgroundColor: "white",
    borderRadius: 40,
  },

  recordButtonActive: {
    backgroundColor: "#F44336",
  },

  topBar: {
    position: "absolute",
    top: 55,
    left: 10,
  },

  bottomControls: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
  },

  video: {
    aspectRatio: 9 / 16, // 9:16 aspect ratio for the video
  },

  input: {
    flex: 1,
    color: "white", // text color
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    maxHeight: 110, // max height of the input, we don't want the input to be too tall and make the post button look bad!
  },

  postText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },

  closeIcon: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
  },

  postButton: {
    backgroundColor: "#FF0050",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },

  videoWrapper: {
    flex: 1, // fill the entire screen with the video
  },

  descriptionContainer: {
    paddingHorizontal: 5,
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },
});
