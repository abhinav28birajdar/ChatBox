import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    notification: {
        type: string;
        user: string;
        content?: string;
        time: string;
        read: boolean;
    };
}

export const NotificationCard = ({ notification }: Props) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, !notification.read && { backgroundColor: 'rgba(255,224,49,0.03)' }]}>
            <Avatar size="md" name={notification.user} />
            <View style={styles.content}>
                <Text variant="bodySmall" color={colors.text}>
                    <Text variant="subtitle2" style={{ fontSize: 14 }}>{notification.user} </Text>
                    {notification.content || 'interacted with you'}
                </Text>
                <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 4 }}>{notification.time}</Text>
            </View>
            {!notification.read && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginVertical: 4,
    },
    content: {
        flex: 1,
        marginLeft: 16,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    }
});
