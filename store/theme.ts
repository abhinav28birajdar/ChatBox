/**
 * Theme Store
 * Manages theme preferences with system detection and manual override
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  getEffectiveTheme: () => 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      
      setMode: (mode: ThemeMode) => {
        set({ mode });
      },
      
      getEffectiveTheme: () => {
        const { mode } = get();
        if (mode === 'system') {
          const systemColorScheme = useNativeColorScheme();
          return systemColorScheme === 'dark' ? 'dark' : 'light';
        }
        return mode;
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
