import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { supabase } from "@/lib/supabase";

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
export const useSupabaseAuth = () => {
  useEffect(() => {
    const handleAppStateChange = (status: AppStateStatus) => {
      if (status === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, []);
};
