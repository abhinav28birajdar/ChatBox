/**
 * AppContext - Global app state (theme, servers, notifications)
 */
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { StorageKeys, getItem, setItem } from '@/utils/storage';
import type { AppearanceSettings } from '@/types';

type ThemeMode = 'dark' | 'light' | 'system';

interface AppContextType {
  colors: typeof Colors.dark;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;
  isLoadingApp: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme() ?? 'dark';
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);
  const [isLoadingApp, setIsLoadingApp] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await getItem<ThemeMode>(StorageKeys.THEME);
      if (stored) setThemeModeState(stored);
      const onboarding = await getItem<boolean>(StorageKeys.ONBOARDING_COMPLETE);
      if (onboarding) setOnboardingCompleteState(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingApp(false);
    }
  };

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    setItem(StorageKeys.THEME, mode);
  }, []);

  const setOnboardingComplete = useCallback((v: boolean) => {
    setOnboardingCompleteState(v);
    setItem(StorageKeys.ONBOARDING_COMPLETE, v);
  }, []);

  const resolvedScheme = themeMode === 'system' ? systemScheme : themeMode;
  const isDark = resolvedScheme === 'dark';
  const colors = Colors[resolvedScheme as keyof typeof Colors] || Colors.dark;

  const value = useMemo(() => ({
    colors, isDark, themeMode, setThemeMode, onboardingComplete, setOnboardingComplete, isLoadingApp
  }), [colors, isDark, themeMode, setThemeMode, onboardingComplete, setOnboardingComplete, isLoadingApp]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
