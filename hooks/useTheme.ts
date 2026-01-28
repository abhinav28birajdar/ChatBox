import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

export const useTheme = () => {
    const colorScheme = useColorScheme() ?? 'dark';
    const colors = Colors[colorScheme as keyof typeof Colors];

    return {
        colors,
        isDark: colorScheme === 'dark',
        colorScheme,
    };
};
