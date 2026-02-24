/**
 * ServerCard - Card for server discovery/explore
 */
import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/Spacing';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import type { Server } from '@/services/ServerService';
import { formatMemberCount } from '@/utils/helpers';
import { serverCategoryConfig } from '@/constants/Config';

interface Props {
  server: Server;
  onPress?: () => void;
  onJoin?: () => void;
  variant?: 'card' | 'list' | 'featured';
  style?: StyleProp<ViewStyle>;
}

export const ServerCard = React.memo(({ server, onPress, onJoin, variant = 'card', style }: Props) => {
  const { colors } = useTheme();
  const categoryInfo = serverCategoryConfig[server.category as keyof typeof serverCategoryConfig];

  if (variant === 'featured') {
    return (
      <TouchableOpacity
        style={[styles.featured, { backgroundColor: colors.surface }, style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: server.banner || server.icon }}
          style={styles.featuredBanner}
        />
        <View style={styles.featuredContent}>
          <View style={styles.featuredHeader}>
            {server.icon && (
              <Image source={{ uri: server.icon }} style={styles.featuredIcon} />
            )}
            <View style={styles.featuredInfo}>
              <Text variant="subtitle2" numberOfLines={1}>{server.name}</Text>
              <Text variant="caption" color={colors.textSecondary}>
                {formatMemberCount(server.memberCount)} members
              </Text>
            </View>
          </View>
          <Text variant="bodySmall" color={colors.textSecondary} numberOfLines={2} style={styles.desc}>
            {server.description}
          </Text>
          <Button title="Join Server" size="sm" onPress={() => onJoin?.()} />
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'list') {
    return (
      <TouchableOpacity
        style={[styles.listItem, { borderBottomColor: colors.border }, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {server.icon ? (
          <Image source={{ uri: server.icon }} style={styles.listIcon} />
        ) : (
          <View style={[styles.listIconPlaceholder, { backgroundColor: colors.surface }]}>
            <Text variant="subtitle2" color={colors.primary}>
              {server.name.charAt(0)}
            </Text>
          </View>
        )}
        <View style={styles.listInfo}>
          <Text variant="subtitle2" numberOfLines={1}>{server.name}</Text>
          <Text variant="caption" color={colors.textSecondary} numberOfLines={1}>
            {server.description}
          </Text>
          <View style={styles.listMeta}>
            <Ionicons name="people-outline" size={12} color={colors.textSecondary} />
            <Text variant="caption" color={colors.textSecondary} style={styles.metaText}>
              {formatMemberCount(server.memberCount)} members
            </Text>
          </View>
        </View>
        <Button title="Join" size="sm" onPress={() => onJoin?.()} />
      </TouchableOpacity>
    );
  }

  // Default card
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        {server.icon ? (
          <Image source={{ uri: server.icon }} style={styles.cardIcon} />
        ) : (
          <View style={[styles.cardIconPlaceholder, { backgroundColor: colors.card }]}>
            <Text variant="h3" color={colors.primary}>
              {server.name.charAt(0)}
            </Text>
          </View>
        )}
      </View>
      <Text variant="subtitle2" numberOfLines={1} style={styles.cardName}>
        {server.name}
      </Text>
      <Text variant="caption" color={colors.textSecondary} numberOfLines={2} style={styles.cardDesc}>
        {server.description}
      </Text>
      <View style={styles.cardFooter}>
        <View style={styles.cardMeta}>
          <Ionicons name="people" size={14} color={colors.textSecondary} />
          <Text variant="caption" color={colors.textSecondary} style={styles.metaText}>
            {formatMemberCount(server.memberCount)}
          </Text>
        </View>
        {categoryInfo && (
          <View style={[styles.categoryTag, { backgroundColor: categoryInfo.color + '20' }]}>
            <Text variant="caption" color={categoryInfo.color}>
              {categoryInfo.label}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});
ServerCard.displayName = 'ServerCard';

const styles = StyleSheet.create({
  // Featured
  featured: {
    width: 280,
    borderRadius: Spacing.round.lg,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  featuredBanner: {
    width: '100%',
    height: 100,
  },
  featuredContent: {
    padding: Spacing.md,
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featuredIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.sm,
  },
  featuredInfo: {
    flex: 1,
  },
  desc: {
    marginBottom: Spacing.sm,
  },

  // List
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  listIconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listInfo: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  metaText: {
    marginLeft: 4,
    marginRight: Spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Card
  card: {
    width: 160,
    borderRadius: Spacing.round.lg,
    padding: Spacing.md,
    marginRight: Spacing.sm,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  cardIconPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardName: {
    textAlign: 'center',
    marginBottom: 4,
  },
  cardDesc: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  cardFooter: {
    alignItems: 'center',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
});
