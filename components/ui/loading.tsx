/**
 * Loading Component
 * Animated loading indicators and skeletons
 */

import { borderRadius, spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MotiView } from 'moti';
import React from 'react';
import { Dimensions, StyleSheet, View, ViewStyle } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export function LoadingSpinner({ size = 24, color, style }: LoadingSpinnerProps) {
  const theme = useTheme();
  const spinnerColor = color || theme.colors.primary;

  return (
    <MotiView
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: `${spinnerColor}20`,
          borderTopColor: spinnerColor,
        },
        style,
      ]}
      animate={{
        rotateZ: '360deg',
      }}
      transition={{
        type: 'timing',
        duration: 1000,
        loop: true,
      }}
    />
  );
}

export interface LoadingDotsProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export function LoadingDots({ size = 8, color, style }: LoadingDotsProps) {
  const theme = useTheme();
  const dotColor = color || theme.colors.primary;

  return (
    <View style={[styles.dotsContainer, style]}>
      {[0, 1, 2].map((index) => (
        <MotiView
          key={index}
          style={[
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: dotColor,
              marginHorizontal: size / 4,
            },
          ]}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            type: 'timing',
            duration: 600,
            delay: index * 200,
            loop: true,
          }}
        />
      ))}
    </View>
  );
}

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ 
  width = '100%', 
  height = 20, 
  borderRadius: radius = 4,
  style 
}: SkeletonProps) {
  const theme = useTheme();

  return (
    <MotiView
      style={[
        {
          width,
          height,
          backgroundColor: theme.colors.surface,
          borderRadius: radius,
        },
        style,
      ]}
      animate={{
        opacity: [0.3, 0.7, 0.3],
      }}
      transition={{
        type: 'timing',
        duration: 1000,
        loop: true,
      }}
    />
  );
}

export interface MessageSkeletonProps {
  isOwn?: boolean;
  style?: ViewStyle;
}

export function MessageSkeleton({ isOwn = false, style }: MessageSkeletonProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.messageSkeletonContainer,
        {
          alignItems: isOwn ? 'flex-end' : 'flex-start',
        },
        style,
      ]}
    >
      <View
        style={[
          styles.messageSkeletonBubble,
          {
            backgroundColor: theme.colors.surface,
            alignSelf: isOwn ? 'flex-end' : 'flex-start',
          },
        ]}
      >
        <Skeleton width="80%" height={16} style={{ marginBottom: spacing.xs }} />
        <Skeleton width="60%" height={16} />
      </View>
    </View>
  );
}

export interface ChatListSkeletonProps {
  count?: number;
  style?: ViewStyle;
}

export function ChatListSkeleton({ count = 5, style }: ChatListSkeletonProps) {
  return (
    <View style={[styles.chatListContainer, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.chatItemSkeleton}>
          <Skeleton width={50} height={50} borderRadius={25} />
          <View style={styles.chatItemContent}>
            <View style={styles.chatItemHeader}>
              <Skeleton width="40%" height={16} />
              <Skeleton width={60} height={12} />
            </View>
            <Skeleton width="80%" height={14} style={{ marginTop: spacing.xs }} />
          </View>
        </View>
      ))}
    </View>
  );
}

export interface FullScreenLoadingProps {
  message?: string;
  showSpinner?: boolean;
}

export function FullScreenLoading({ 
  message = 'Loading...', 
  showSpinner = true 
}: FullScreenLoadingProps) {
  const theme = useTheme();

  return (
    <MotiView
      style={[
        styles.fullScreenContainer,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
      animate={{ opacity: 1 }}
      from={{ opacity: 0 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      {showSpinner && <LoadingSpinner size={40} />}
      {message && (
        <MotiView
          style={{ marginTop: spacing.md }}
          animate={{ opacity: 1 }}
          from={{ opacity: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 200 }}
        >
          <Skeleton width={120} height={16} />
        </MotiView>
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageSkeletonContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  messageSkeletonBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  chatListContainer: {
    paddingHorizontal: spacing.md,
  },
  chatItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  chatItemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  chatItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});