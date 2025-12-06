import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { processLock } from "@supabase/auth-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL; // EXPO_PUBLIC is needed to access the environment variables from the frontend
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY; // Remember: ! is used to tell the compiler that the environment variable is not null

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true, // refresh token for logged in users
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});
