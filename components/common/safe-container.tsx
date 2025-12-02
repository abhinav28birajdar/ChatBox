/**
 * Safe Container Component
 * Container with safe area insets and theme support
 */

import { useTheme } from '@/hooks/use-theme';
import React from 'react';
import { ViewStyle } from 'react-native';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';

interface SafeContainerProps extends SafeAreaViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
}

export function SafeContainer({
  children,
  style,
  backgroundColor,
  ...props
}: SafeContainerProps) {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[
        {
          flex: 1,
          backgroundColor: backgroundColor || theme.colors.background,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
}