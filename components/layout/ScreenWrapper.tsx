import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar, StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';

interface Props {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export const ScreenWrapper = ({ children, style }: Props) => {
    const insets = useSafeAreaInsets();
    const { isDark } = useTheme();

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
                },
                style
            ]}
        >
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
