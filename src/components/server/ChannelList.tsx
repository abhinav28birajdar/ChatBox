import React, { memo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Channel } from '@/services/ChannelService';
import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import * as Haptics from 'expo-haptics';

interface ChannelListProps {
    channels: Channel[];
    activeChannelId?: string;
    onChannelPress: (channelId: string) => void;
    onChannelLongPress?: (channelId: string) => void;
}

interface GroupedChannels {
    categoryId: string;
    categoryName: string;
    channels: Channel[];
}

const ChannelList = memo(({
    channels,
    activeChannelId,
    onChannelPress,
    onChannelLongPress,
}: ChannelListProps) => {
    const { colors } = useTheme();

    // Group channels by category
    const groupedChannels: GroupedChannels[] = React.useMemo(() => {
        const groups: Record<string, Channel[]> = {};

        channels.forEach((channel) => {
            const categoryId = channel.categoryId || 'uncategorized';
            if (!groups[categoryId]) {
                groups[categoryId] = [];
            }
            groups[categoryId].push(channel);
        });

        return Object.entries(groups).map(([categoryId, channels]) => ({
            categoryId,
            categoryName: categoryId === 'uncategorized' ? 'Channels' : categoryId,
            channels: channels.sort((a, b) => a.position - b.position),
        }));
    }, [channels]);

    const getChannelIcon = (type: string) => {
        switch (type) {
            case 'text':
                return 'chatbubble-outline';
            case 'voice':
                return 'volume-high-outline';
            case 'announcement':
                return 'megaphone-outline';
            case 'stage':
                return 'mic-outline';
            default:
                return 'chatbubble-outline';
        }
    };

    const renderChannel = (channel: Channel) => {
        const isActive = channel.id === activeChannelId;

        return (
            <TouchableOpacity
                key={channel.id}
                style={[
                    styles.channelItem,
                    isActive && { backgroundColor: colors.surface },
                ]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onChannelPress(channel.id);
                }}
                onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    onChannelLongPress?.(channel.id);
                }}
            >
                <Ionicons
                    name={getChannelIcon(channel.type)}
                    size={20}
                    color={isActive ? colors.primary : colors.textSecondary}
                />
                <Text
                    variant="body"
                    color={isActive ? colors.primary : colors.text}
                    style={styles.channelName}
                >
                    {channel.name}
                </Text>

                {channel.nsfw && (
                    <Badge text="18+" variant="error" size="small" />
                )}

                {channel.slowMode > 0 && (
                    <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                )}
            </TouchableOpacity>
        );
    };

    const renderCategory = ({ item }: { item: GroupedChannels }) => {
        return (
            <View style={styles.category}>
                <View style={styles.categoryHeader}>
                    <Text variant="caption" color={colors.textSecondary} style={styles.categoryName}>
                        {item.categoryName.toUpperCase()}
                    </Text>
                </View>
                {item.channels.map(renderChannel)}
            </View>
        );
    };

    return (
        <FlatList
            data={groupedChannels}
            renderItem={renderCategory}
            keyExtractor={(item) => item.categoryId}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
        />
    );
});

ChannelList.displayName = 'ChannelList';

const styles = StyleSheet.create({
    container: {
        paddingVertical: Spacing.sm,
    },
    category: {
        marginBottom: Spacing.md,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
    },
    categoryName: {
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    channelItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        gap: Spacing.sm,
        borderRadius: Spacing.round.sm,
        marginHorizontal: Spacing.xs,
    },
    channelName: {
        flex: 1,
    },
});

export default ChannelList;
