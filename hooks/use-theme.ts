/**
 * Advanced Theme Hook
 * Provides theme context with light/dark mode switching
 */

import { darkTheme, lightTheme, type Theme } from '@/constants/theme';
import { useColorScheme as useNativeColorScheme } from 'react-native';

export function useTheme(): Theme & { isDark: boolean; colorScheme: 'light' | 'dark' } {
  const colorScheme = useNativeColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  return {
    ...theme,
    isDark,
    colorScheme: colorScheme ?? 'light',
  };
}

export function useThemedStyles<T>(stylesFn: (theme: Theme) => T): T {
  const theme = useTheme();
  return stylesFn(theme);
}