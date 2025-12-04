/**
 * Authentication Store
 * Zustand store for managing authentication state
 */

import { AuthState, Profile, User } from '@/types';
import { getSupabaseService } from '@/utils/supabase';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthStore extends AuthState {
  // Actions
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
}

// Custom storage for Zustand with SecureStore
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(name);
      }
      return await SecureStore.getItemAsync(name);
    } catch (error) {
      console.error('Error reading from secure storage:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(name, value);
      } else {
        await SecureStore.setItemAsync(name, value);
      }
    } catch (error) {
      console.error('Error writing to secure storage:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(name);
      } else {
        await SecureStore.deleteItemAsync(name);
      }
    } catch (error) {
      console.error('Error removing from secure storage:', error);
    }
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      signIn: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const supabase = await getSupabaseService();
          const { data, error } = await supabase.signIn(email, password);

          if (error) {
            set({ isLoading: false });
            return { success: false, error: error.message };
          }

          if (data.user) {
            // Get user profile
            const { data: profile, error: profileError } = await supabase.getProfile(data.user.id);
            
            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              username: (profile as any)?.username || undefined,
              full_name: (profile as any)?.full_name || undefined,
              avatar_url: (profile as any)?.avatar_url || undefined,
              phone: data.user.phone || undefined,
              is_online: true,
              last_seen: new Date().toISOString(),
              created_at: data.user.created_at!,
              updated_at: new Date().toISOString(),
            };

            set({
              user,
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
            });

            return { success: true };
          }

          set({ isLoading: false });
          return { success: false, error: 'Authentication failed' };
        } catch (error: any) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      signUp: async (email: string, password: string, username: string, fullName: string) => {
        set({ isLoading: true });
        
        try {
          const supabase = await getSupabaseService();
          const { data, error } = await supabase.signUp(email, password, {
            username,
            full_name: fullName,
          });

          if (error) {
            set({ isLoading: false });
            return { success: false, error: error.message };
          }

          if (data.user) {
            // Create profile
            await supabase.createProfile({
              user_id: data.user.id,
              username,
              full_name: fullName,
              status: 'online',
            });

            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              username,
              full_name: fullName,
              avatar_url: undefined,
              phone: undefined,
              is_online: true,
              last_seen: new Date().toISOString(),
              created_at: data.user.created_at!,
              updated_at: new Date().toISOString(),
            };

            set({
              user,
              session: data.session,
              isAuthenticated: !!data.session,
              isLoading: false,
            });

            return { success: true };
          }

          set({ isLoading: false });
          return { success: false, error: 'Registration failed' };
        } catch (error: any) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        
        try {
          const supabase = await getSupabaseService();
          await supabase.signOut();
          
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          console.error('Sign out error:', error);
          set({ isLoading: false });
        }
      },

      resetPassword: async (email: string) => {
        try {
          const supabase = await getSupabaseService();
          const { error } = await supabase.resetPassword(email);

          if (error) {
            return { success: false, error: error.message };
          }

          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },

      updatePassword: async (password: string) => {
        try {
          const supabase = await getSupabaseService();
          const { error } = await supabase.updatePassword(password);

          if (error) {
            return { success: false, error: error.message };
          }

          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },

      updateProfile: async (updates: Partial<Profile>) => {
        const { user } = get();
        if (!user) {
          return { success: false, error: 'User not authenticated' };
        }

        try {
          const supabase = await getSupabaseService();
          const { data, error } = await supabase.updateProfile(user.id, updates);

          if (error) {
            return { success: false, error: error.message };
          }

          // Update user in store
          set({
            user: {
              ...user,
              username: (data as any)?.username || user.username,
              full_name: (data as any)?.full_name || user.full_name,
              avatar_url: (data as any)?.avatar_url || user.avatar_url,
              updated_at: new Date().toISOString(),
            },
          });

          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },

      refreshSession: async () => {
        set({ isLoading: true });
        
        try {
          // This would refresh the session with Supabase
          // Implementation depends on your Supabase setup
          set({ isLoading: false });
        } catch (error) {
          console.error('Session refresh error:', error);
          set({ isLoading: false });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      initializeAuth: async () => {
        set({ isLoading: true });
        
        try {
          // Initialize Supabase and check for existing session
          // This would be called on app startup
          set({ isLoading: false });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);