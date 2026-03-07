import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const DIMENSIONS = {
    screen: {
        width,
        height,
    },
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
    padding: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },
    borderRadius: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        round: 100,
    }
};
