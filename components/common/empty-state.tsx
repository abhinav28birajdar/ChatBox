/**
 * Empty State Component
 * Display when there's no content to show
 */

import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { MotiView } from 'moti';
import React from 'react';
import { StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  iconName?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

export function EmptyState({
  title,
  subtitle,
  iconName,
  actionLabel,
  onAction,
  style,
  titleStyle,
  subtitleStyle,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <MotiView
      style={[styles.container, style]}
      animate={{ opacity: 1, scale: 1 }}
      from={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'timing', duration: 300 }}
    >
      {iconName && (
        <MotiView
          style={[
            styles.iconContainer,
            {
              backgroundColor: theme.colors.surfaceSecondary,
            },
          ]}
          animate={{ scale: 1 }}
          from={{ scale: 0.8 }}
          transition={{ type: 'timing', duration: 400, delay: 100 }}
        >
          <IconSymbol
            name={iconName}
            size={40}
            color={theme.colors.textMuted}
          />
        </MotiView>
      )}

      <MotiView
        animate={{ opacity: 1, translateY: 0 }}
        from={{ opacity: 0, translateY: 20 }}
        transition={{ type: 'timing', duration: 400, delay: 200 }}
      >
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text,
            },
            titleStyle,
          ]}
        >
          {title}
        </Text>

        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              {
                color: theme.colors.textSecondary,
              },
              subtitleStyle,
            ]}
          >
            {subtitle}
          </Text>
        )}
      </MotiView>

      {actionLabel && onAction && (
        <MotiView
          animate={{ opacity: 1, translateY: 0 }}
          from={{ opacity: 0, translateY: 20 }}
          transition={{ type: 'timing', duration: 400, delay: 300 }}
          style={styles.actionContainer}
        >
          <Button
            title={actionLabel}
            onPress={onAction}
            variant="primary"
            size="md"
          />
        </MotiView>
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.md,
    marginBottom: spacing.xl,
  },
  actionContainer: {
    marginTop: spacing.md,
  },
});