/**
 * Settings Store
 * Zustand store for managing app settings
 */

import { AppSettings } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsStore extends AppSettings {
  // Actions
  updateNotificationSettings: (settings: Partial<AppSettings['notifications']>) => void;
  updateChatSettings: (settings: Partial<AppSettings['chat']>) => void;
  updatePrivacySettings: (settings: Partial<AppSettings['privacy']>) => void;
  updateAppearanceSettings: (settings: Partial<AppSettings['appearance']>) => void;
  resetToDefaults: () => void;
  exportSettings: () => AppSettings;
  importSettings: (settings: AppSettings) => void;
}

const defaultSettings: AppSettings = {
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
    push: true,
  },
  chat: {
    enterToSend: false,
    readReceipts: true,
    typingIndicators: true,
  },
  privacy: {
    lastSeen: true,
    profilePhoto: true,
    status: true,
  },
  appearance: {
    theme: 'system',
    fontSize: 'medium',
  },
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      updateNotificationSettings: (settings) => {
        set((state) => ({
          notifications: {
            ...state.notifications,
            ...settings,
          },
        }));
      },

      updateChatSettings: (settings) => {
        set((state) => ({
          chat: {
            ...state.chat,
            ...settings,
          },
        }));
      },

      updatePrivacySettings: (settings) => {
        set((state) => ({
          privacy: {
            ...state.privacy,
            ...settings,
          },
        }));
      },

      updateAppearanceSettings: (settings) => {
        set((state) => ({
          appearance: {
            ...state.appearance,
            ...settings,
          },
        }));
      },

      resetToDefaults: () => {
        set(defaultSettings);
      },

      exportSettings: () => {
        const state = get();
        return {
          notifications: state.notifications,
          chat: state.chat,
          privacy: state.privacy,
          appearance: state.appearance,
        };
      },

      importSettings: (settings) => {
        set(settings);
      },
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);