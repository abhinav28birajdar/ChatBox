import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

interface Props {
    chat: {
        name: string;
        lastMessage: string;
        time: string;
        unread: number;
    };
    onPress?: () => void;
}

export const ChatCard = ({ chat, onPress }: Props) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
            <Avatar size="lg" name={chat.name} />
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text variant="subtitle2">{chat.name}</Text>
                    <Text variant="caption" color={colors.textSecondary}>{chat.time}</Text>
                </View>
                <View style={styles.footer}>
                    <Text variant="bodySmall" color={colors.textSecondary} numberOfLines={1} style={{ flex: 1 }}>
                        {chat.lastMessage}
                    </Text>
                    {chat.unread > 0 && <Badge label={chat.unread} size="sm" style={styles.badge} />}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    content: {
        flex: 1,
        marginLeft: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        marginLeft: 8,
    }
});
