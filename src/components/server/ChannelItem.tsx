/**
 * ChannelItem - Individual channel row in server's channel list
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/Spacing';
import { Text } from '../ui/Text';
import type { Channel } from '@/types';

interface Props {
  channel: Channel;
  isActive?: boolean;
  unreadCount?: number;
  onPress?: () => void;
  onLongPress?: () => void;
}

const channelIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  text: 'chatbubble-outline',
  voice: 'volume-high-outline',
  announcement: 'megaphone-outline',
};

export const ChannelItem = React.memo(({
  channel,
  isActive = false,
  unreadCount = 0,
  onPress,
  onLongPress,
}: Props) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isActive ? colors.surface : 'transparent',
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={channelIcons[channel.type] || 'chatbubble-outline'}
        size={18}
        color={isActive ? colors.text : colors.textSecondary}
      />
      <Text
        variant={unreadCount > 0 ? 'subtitle2' : 'body'}
        color={isActive || unreadCount > 0 ? colors.text : colors.textSecondary}
        style={styles.name}
        numberOfLines={1}
      >
        {channel.name}
      </Text>
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.error }]}>
          <Text variant="caption" color="#FFF" style={styles.badgeText}>
            {unreadCount}
          </Text>
        </View>
      )}
      {channel.type === 'voice' && (
        <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );
});
ChannelItem.displayName = 'ChannelItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Spacing.round.sm,
    marginHorizontal: Spacing.sm,
    marginVertical: 1,
  },
  name: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginLeft: Spacing.xs,
  },
  badgeText: {
    fontSize: 10,
  },
});
