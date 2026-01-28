import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Typography } from '@/constants/Typography';

interface Props extends TextProps {
    children?: React.ReactNode;
    variant?: keyof typeof Typography;
    color?: string;
    align?: 'auto' | 'left' | 'center' | 'right' | 'justify';
}

export const Text = ({
    variant = 'body',
    color,
    align = 'left',
    style,
    children,
    ...props
}: Props) => {
    const { colors } = useTheme();

    return (
        <RNText
            style={[
                {
                    color: color || colors.text,
                    textAlign: align,
                    ...Typography[variant],
                },
                style,
            ]}
            {...props}
        >
            {children}
        </RNText>
    );
};
