/**
 * Keyboard Aware Container
 * Container that automatically adjusts for keyboard
 */

import React from 'react';
import {
    KeyboardAvoidingView,
    KeyboardAvoidingViewProps,
    Platform,
    StyleSheet,
    ViewStyle,
} from 'react-native';

interface KeyboardAwareContainerProps extends KeyboardAvoidingViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function KeyboardAwareContainer({
  children,
  style,
  behavior,
  ...props
}: KeyboardAwareContainerProps) {
  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={behavior || Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      {...props}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});