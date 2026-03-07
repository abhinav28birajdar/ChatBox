import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface DividerProps {
    vertical?: boolean;
    thickness?: number;
    color?: string;
    style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({ vertical = false, thickness = StyleSheet.hairlineWidth, color, style }) => {
    const { colors } = useTheme();

    return (
        <View
            style={[
                {
                    backgroundColor: color || colors.border,
                    [vertical ? 'width' : 'height']: thickness,
                },
                style,
            ]}
        />
    );
};
