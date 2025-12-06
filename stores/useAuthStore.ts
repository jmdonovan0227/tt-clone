import { create } from "zustand";
import { User } from "@/types/types";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username: string
  ) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            throw error;
          }

          if (data && data.user) {
            const { user } = data;

            if (user.email && user.id && user.user_metadata.username) {
              const newUser: User = {
                id: user.id,
                email: user.email,
                username: user.user_metadata.username,
              };

              set({ user: newUser, isAuthenticated: true });
            }
          }
        } catch (error) {
          throw error;
        }
      },
      register: async (email: string, password: string, username: string) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              // sending additional data
              data: {
                username,
              },
            },
          });

          if (error) {
            throw error;
          }

          if (data && data.user) {
            const { user } = data;

            if (user.email && user.id && user.user_metadata.username) {
              const newUser: User = {
                id: user.id,
                email: user.email,
                username: user.user_metadata.username,
              };

              set({ user: newUser, isAuthenticated: true });
            }
          } else {
            throw error;
          }
        } catch (error) {
          throw error;
        }
      },
      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut();

          if (!error) {
            set({ user: null, isAuthenticated: false });
          } else {
            throw error;
          }
        } catch (error) {
          throw error;
        }
      },
    }),
    {
      name: "auth-storage", // name of the storage
      storage: createJSONStorage(() => AsyncStorage), // storage engine
    }
  )
);
