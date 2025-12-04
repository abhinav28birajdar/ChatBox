/**
 * Advanced Theme System for ChatBox
 * Complete design tokens with light/dark mode support
 * Typography scale, spacing, colors, shadows, and animations
 */

import { Platform } from 'react-native';

// Base Design Tokens
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },
  fontWeights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeights: {
    none: 1,
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 2,
  },
} as const;

// Color Palette
const palette = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },
  chat: {
    light: '#f0f9ff',
    dark: '#0f172a',
  },
} as const;

// Theme Configuration
export const lightTheme = {
  colors: {
    primary: palette.primary[600],
    primaryLight: palette.primary[500],
    primaryDark: palette.primary[700],
    
    background: '#ffffff',
    surface: palette.gray[50],
    surfaceSecondary: palette.gray[100],
    
    text: palette.gray[900],
    textSecondary: palette.gray[600],
    textMuted: palette.gray[500],
    textInverse: '#ffffff',
    
    border: palette.gray[200],
    borderLight: palette.gray[100],
    
    success: palette.success[500],
    successLight: palette.success[50],
    warning: palette.warning[500],
    warningLight: palette.warning[50],
    error: palette.error[500],
    errorLight: palette.error[50],
    
    // Chat specific
    messageOwn: palette.primary[500],
    messageOther: palette.gray[100],
    chatBackground: palette.chat.light,
    
    // Tab colors
    tabIconDefault: palette.gray[400],
    tabIconSelected: palette.primary[600],
    tint: palette.primary[600],
    icon: palette.gray[500],
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 5,
    },
  },
} as const;

export const darkTheme = {
  colors: {
    primary: palette.primary[400],
    primaryLight: palette.primary[300],
    primaryDark: palette.primary[500],
    
    background: palette.gray[900],
    surface: palette.gray[800],
    surfaceSecondary: palette.gray[700],
    
    text: '#ffffff',
    textSecondary: palette.gray[300],
    textMuted: palette.gray[400],
    textInverse: palette.gray[900],
    
    border: palette.gray[600],
    borderLight: palette.gray[700],
    
    success: palette.success[500],
    successLight: palette.success[50],
    warning: palette.warning[500],
    warningLight: palette.warning[50],
    error: palette.error[500],
    errorLight: palette.error[50],
    
    // Chat specific
    messageOwn: palette.primary[600],
    messageOther: palette.gray[700],
    chatBackground: palette.chat.dark,
    
    // Tab colors
    tabIconDefault: palette.gray[400],
    tabIconSelected: palette.primary[400],
    tint: palette.primary[400],
    icon: palette.gray[400],
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 5,
    },
  },
} as const;

// Legacy Colors (for backward compatibility)
export const Colors = {
  light: {
    text: lightTheme.colors.text,
    background: lightTheme.colors.background,
    tint: lightTheme.colors.tint,
    icon: lightTheme.colors.icon,
    tabIconDefault: lightTheme.colors.tabIconDefault,
    tabIconSelected: lightTheme.colors.tabIconSelected,
  },
  dark: {
    text: darkTheme.colors.text,
    background: darkTheme.colors.background,
    tint: darkTheme.colors.tint,
    icon: darkTheme.colors.icon,
    tabIconDefault: darkTheme.colors.tabIconDefault,
    tabIconSelected: darkTheme.colors.tabIconSelected,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Animation constants
export const animations = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

export type Theme = typeof lightTheme;
export type ThemeColors = Theme['colors'];
export type ThemeShadows = Theme['shadows'];
