import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useApp } from '@/context/AppContext';

export const useTheme = () => {
    const systemScheme = useColorScheme() ?? 'dark';
    
    // Try to get context theme; fall back to system scheme
    // (supports usage before AppProvider is mounted, e.g. +not-found)
    let resolvedScheme: 'light' | 'dark';
    try {
        const { themeMode } = useApp();
        resolvedScheme = themeMode === 'system' ? systemScheme : themeMode;
    } catch {
        resolvedScheme = systemScheme as 'light' | 'dark';
    }

    const colors = Colors[resolvedScheme];

    return {
        colors,
        isDark: resolvedScheme === 'dark',
        colorScheme: resolvedScheme,
    };
};
