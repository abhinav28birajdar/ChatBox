/**
 * Card Component
 * Modern card container with elevation and animations
 */

import { borderRadius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MotiView } from 'moti';
import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';

export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  style?: ViewStyle;
  animated?: boolean;
  pressable?: boolean;
  onPress?: () => void;
}

export function Card({
  variant = 'elevated',
  padding = 'md',
  children,
  style,
  animated = false,
  pressable = false,
  onPress,
  ...props
}: CardProps) {
  const theme = useTheme();

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'sm':
        return { padding: spacing.sm };
      case 'md':
        return { padding: spacing.md };
      case 'lg':
        return { padding: spacing.lg };
      default:
        return { padding: spacing.md };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.colors.background,
          borderWidth: 0,
          ...theme.shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: theme.colors.background,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'filled':
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: theme.colors.background,
          borderWidth: 0,
          ...theme.shadows.md,
        };
    }
  };

  const paddingStyles = getPaddingStyles();
  const variantStyles = getVariantStyles();

  const cardStyle = [
    {
      borderRadius: borderRadius.lg,
      ...variantStyles,
      ...paddingStyles,
    },
    style,
  ];

  if (animated || pressable) {
    return (
      <MotiView
        style={cardStyle}
        animate={{
          scale: pressable ? 1 : 1,
        }}
        whileTap={pressable ? { scale: 0.98 } : undefined}
        transition={{
          type: 'timing',
          duration: 150,
        }}
        onPress={pressable ? onPress : undefined}
        {...props}
      >
        {children}
      </MotiView>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}