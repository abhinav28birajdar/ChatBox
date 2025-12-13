/**
 * Avatar Component
 * User avatar with fallback and status indicator
 * Optimized with React.memo for better performance
 */

import { typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Image } from 'expo-image';
import { MotiView } from 'moti';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

export interface AvatarProps {
  size?: number;
  imageUri?: string | null;
  name?: string;
  showStatus?: boolean;
  status?: 'online' | 'away' | 'busy' | 'offline';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Avatar = React.memo(function Avatar({
  size = 40,
  imageUri,
  name = '',
  showStatus = false,
  status = 'offline',
  style,
  textStyle,
}: AvatarProps) {
  const theme = useTheme();

  const getInitials = useMemo(() => {
    if (!name) return '?';
    
    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }, [name]);

  const statusColor = useMemo(() => {
    switch (status) {
      case 'online':
        return theme.colors.success;
      case 'away':
        return '#f59e0b'; // Yellow
      case 'busy':
        return theme.colors.error;
      case 'offline':
        return theme.colors.textMuted;
      default:
        return theme.colors.textMuted;
    }
  }, [status, theme.colors]);

  const avatarStyle = [
    styles.avatar,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: imageUri ? 'transparent' : theme.colors.primary,
    },
    style,
  ];

  const initialsTextStyle = [
    styles.initials,
    {
      fontSize: size * 0.4,
      color: theme.colors.textInverse,
    },
    textStyle,
  ];

  const statusSize = size * 0.25;
  const statusStyle = useMemo(() => ({
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    width: statusSize,
    height: statusSize,
    borderRadius: statusSize / 2,
    backgroundColor: statusColor,
    borderWidth: 2,
    borderColor: theme.colors.background,
  }), [statusSize, statusColor, theme.colors.background]);

  return (
    <MotiView
      style={styles.container}
      animate={{ scale: 1 }}
      from={{ scale: 0.8 }}
      transition={{ type: 'timing', duration: 200 }}
    >
      <View style={avatarStyle}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
            contentFit="cover"
            placeholder={null}
            transition={200}
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={styles.fallback}>
            <Text style={initialsTextStyle}>
              {getInitials}
            </Text>
          </View>
        )}
      </View>
      
      {showStatus && (
        <MotiView
          style={statusStyle}
          animate={{
            scale: status === 'online' ? [1, 1.1, 1] : 1,
          }}
          transition={{
            type: 'timing',
            duration: 1000,
            loop: status === 'online',
          }}
        />
      )}
    </MotiView>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    // Image styles are applied dynamically
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: typography.fontWeights.semibold,
    textAlign: 'center',
  },
});