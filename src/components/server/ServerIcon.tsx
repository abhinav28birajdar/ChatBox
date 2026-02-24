/**
 * ServerIcon - Circular server icon for sidebar
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '../ui/Text';
import { getInitials } from '@/utils/helpers';

interface Props {
  name: string;
  icon?: string;
  isActive?: boolean;
  unreadCount?: number;
  onPress?: () => void;
  onLongPress?: () => void;
  size?: number;
}

export const ServerIcon = React.memo(({
  name,
  icon,
  isActive = false,
  unreadCount = 0,
  onPress,
  onLongPress,
  size = 48,
}: Props) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      style={styles.container}
    >
      {/* Active indicator */}
      <View
        style={[
          styles.indicator,
          {
            backgroundColor: colors.text,
            height: isActive ? 36 : unreadCount > 0 ? 8 : 0,
            opacity: isActive || unreadCount > 0 ? 1 : 0,
          },
        ]}
      />

      <View
        style={[
          styles.iconContainer,
          {
            width: size,
            height: size,
            borderRadius: isActive ? 16 : size / 2,
            backgroundColor: icon ? 'transparent' : colors.surface,
            borderWidth: isActive ? 2 : 0,
            borderColor: colors.primary,
          },
        ]}
      >
        {icon ? (
          <Image
            source={{ uri: icon }}
            style={[
              styles.image,
              { borderRadius: isActive ? 14 : (size - 4) / 2 },
            ]}
          />
        ) : (
          <Text variant="caption" color={colors.primary}>
            {getInitials(name)}
          </Text>
        )}
      </View>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.error }]}>
          <Text variant="caption" color="#FFF" style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});
ServerIcon.displayName = 'ServerIcon';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  indicator: {
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    marginRight: 8,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
  },
});
