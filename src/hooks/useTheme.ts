import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';
import { LightTheme, DarkTheme } from '../constants/colors';
import { useColorScheme } from 'react-native';

export const useTheme = () => {
    const { mode } = useThemeStore();
    const systemScheme = useColorScheme();

    const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
    const colors = isDark ? DarkTheme : LightTheme;

    return { colors, isDark };
};
