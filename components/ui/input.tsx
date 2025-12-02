/**
 * Input Component
 * Modern text input with validation, animations, and accessibility
 */

import { IconSymbol } from '@/components/ui/icon-symbol';
import { borderRadius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MotiView } from 'moti';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  isRequired?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
}

export interface InputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
}

export const Input = forwardRef<InputRef, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isRequired = false,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  variant = 'outlined',
  size = 'md',
  value,
  onChangeText,
  onFocus,
  onBlur,
  secureTextEntry,
  editable = true,
  ...props
}, ref) => {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const animatedLabelPosition = useRef(new Animated.Value(value ? 1 : 0)).current;

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => inputRef.current?.clear(),
  }));

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: 40,
          fontSize: typography.fontSizes.sm,
          paddingHorizontal: spacing.sm,
        };
      case 'md':
        return {
          height: 48,
          fontSize: typography.fontSizes.md,
          paddingHorizontal: spacing.md,
        };
      case 'lg':
        return {
          height: 56,
          fontSize: typography.fontSizes.lg,
          paddingHorizontal: spacing.lg,
        };
      default:
        return {
          height: 48,
          fontSize: typography.fontSizes.md,
          paddingHorizontal: spacing.md,
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: error 
            ? theme.colors.error 
            : isFocused 
              ? theme.colors.primary 
              : theme.colors.border,
        };
      case 'filled':
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 0,
          borderColor: 'transparent',
        };
      case 'default':
        return {
          backgroundColor: theme.colors.background,
          borderWidth: 1,
          borderColor: error 
            ? theme.colors.error 
            : isFocused 
              ? theme.colors.primary 
              : theme.colors.borderLight,
        };
      default:
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: error 
            ? theme.colors.error 
            : isFocused 
              ? theme.colors.primary 
              : theme.colors.border,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();
  
  const animateLabel = (toValue: number) => {
    Animated.timing(animatedLabelPosition, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    animateLabel(1);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (!value) {
      animateLabel(0);
    }
    onBlur?.(e);
  };

  const handleChangeText = (text: string) => {
    onChangeText?.(text);
    if (text && !value) {
      animateLabel(1);
    } else if (!text && value) {
      animateLabel(0);
    }
  };

  const togglePasswordVisibility = () => {
    setIsSecure(!isSecure);
  };

  const labelTranslateY = animatedLabelPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [sizeStyles.height / 2 - 10, -8],
  });

  const labelScale = animatedLabelPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.8],
  });

  const labelColor = animatedLabelPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.textMuted, isFocused ? theme.colors.primary : theme.colors.textSecondary],
  });

  return (
    <MotiView style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <Animated.View
          style={[
            styles.labelContainer,
            {
              transform: [
                { translateY: labelTranslateY },
                { scale: labelScale },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <Animated.Text
            style={[
              styles.label,
              labelStyle,
              {
                color: labelColor,
                fontSize: typography.fontSizes.sm,
                backgroundColor: variant === 'outlined' ? theme.colors.background : 'transparent',
                paddingHorizontal: variant === 'outlined' ? spacing.xs : 0,
              },
            ]}
          >
            {label}
            {isRequired && <Text style={styles.required}> *</Text>}
          </Animated.Text>
        </Animated.View>
      )}

      {/* Input Container */}
      <MotiView
        style={[
          styles.inputContainer,
          variantStyles,
          {
            height: sizeStyles.height,
            borderRadius: borderRadius.md,
            paddingHorizontal: leftIcon ? spacing.xs : sizeStyles.paddingHorizontal,
            opacity: editable ? 1 : 0.6,
          },
          isFocused && styles.focusedContainer,
        ]}
        animate={{
          borderColor: variantStyles.borderColor,
        }}
        transition={{
          type: 'timing',
          duration: 200,
        }}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <IconSymbol
              name={leftIcon}
              size={20}
              color={isFocused ? theme.colors.primary : theme.colors.icon}
            />
          </View>
        )}

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            inputStyle,
            {
              fontSize: sizeStyles.fontSize,
              color: theme.colors.text,
              flex: 1,
            },
          ]}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isSecure}
          placeholderTextColor={theme.colors.textMuted}
          editable={editable}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {(rightIcon || secureTextEntry) && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={secureTextEntry ? togglePasswordVisibility : onRightIconPress}
            activeOpacity={0.7}
          >
            <IconSymbol
              name={
                secureTextEntry 
                  ? (isSecure ? 'eye.slash' : 'eye')
                  : rightIcon!
              }
              size={20}
              color={isFocused ? theme.colors.primary : theme.colors.icon}
            />
          </TouchableOpacity>
        )}
      </MotiView>

      {/* Helper Text or Error */}
      {(helperText || error) && (
        <MotiView
          style={styles.helperContainer}
          animate={{
            opacity: 1,
          }}
          from={{
            opacity: 0,
          }}
        >
          <Text
            style={[
              styles.helperText,
              errorStyle,
              {
                color: error ? theme.colors.error : theme.colors.textSecondary,
              },
            ]}
          >
            {error || helperText}
          </Text>
        </MotiView>
      )}
    </MotiView>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  labelContainer: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  label: {
    fontWeight: typography.fontWeights.medium,
  },
  required: {
    color: '#ef4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  focusedContainer: {
    // Additional styles when focused
  },
  textInput: {
    flex: 1,
    paddingVertical: 0, // Remove default padding
    includeFontPadding: false, // Android specific
    textAlignVertical: 'center', // Android specific
  },
  leftIconContainer: {
    marginRight: spacing.sm,
    marginLeft: spacing.sm,
  },
  rightIconContainer: {
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  helperContainer: {
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: typography.fontSizes.xs,
    marginLeft: spacing.xs,
  },
});