/**
 * Chat List Skeleton
 * Loading state for chat list
 */

import { MotiView } from 'moti';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Card } from './card';

interface ChatListSkeletonProps {
  count?: number;
}

const SkeletonItem: React.FC = () => {
  const theme = useTheme();

  const skeletonAnimation = {
    opacity: [0.3, 0.7, 0.3],
  };

  return (
    <Card variant="filled" padding="md" style={styles.skeletonItem}>
      <View style={styles.skeletonContent}>
        {/* Avatar skeleton */}
        <MotiView
          style={[
            styles.avatarSkeleton,
            { backgroundColor: theme.colors.border }
          ]}
          animate={skeletonAnimation}
          transition={{
            type: 'timing',
            duration: 1500,
            loop: true,
          }}
        />

        <View style={styles.contentSkeleton}>
          {/* Name skeleton */}
          <View style={styles.headerSkeleton}>
            <MotiView
              style={[
                styles.nameSkeleton,
                { backgroundColor: theme.colors.border }
              ]}
              animate={skeletonAnimation}
              transition={{
                type: 'timing',
                duration: 1500,
                loop: true,
                delay: 100,
              }}
            />
            
            <MotiView
              style={[
                styles.timeSkeleton,
                { backgroundColor: theme.colors.border }
              ]}
              animate={skeletonAnimation}
              transition={{
                type: 'timing',
                duration: 1500,
                loop: true,
                delay: 200,
              }}
            />
          </View>

          {/* Message skeleton */}
          <MotiView
            style={[
              styles.messageSkeleton,
              { backgroundColor: theme.colors.border }
            ]}
            animate={skeletonAnimation}
            transition={{
              type: 'timing',
              duration: 1500,
              loop: true,
              delay: 300,
            }}
          />
        </View>
      </View>
    </Card>
  );
};

export const ChatListSkeleton: React.FC<ChatListSkeletonProps> = ({ count = 8 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skeletonItem: {
    marginBottom: spacing.sm,
  },
  skeletonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSkeleton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  contentSkeleton: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  nameSkeleton: {
    width: '60%',
    height: 16,
    borderRadius: 8,
  },
  timeSkeleton: {
    width: 40,
    height: 12,
    borderRadius: 6,
  },
  messageSkeleton: {
    width: '80%',
    height: 14,
    borderRadius: 7,
  },
});