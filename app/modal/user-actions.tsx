import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Ionicons } from '@expo/vector-icons';

export default function UserActionsModal() {
    const { colors } = useTheme();
    const router = useRouter();
    const { name } = useLocalSearchParams();

    const Action = ({ icon, title, color = colors.text, onPress }: any) => (
        <TouchableOpacity style={styles.actionRow} onPress={onPress}>
            <Ionicons name={icon} size={24} color={color} />
            <Text variant="subtitle2" style={{ marginLeft: 16, color }}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />

            <View style={styles.header}>
                <Avatar size="lg" name={name as string} status="online" />
                <View style={{ marginLeft: 16 }}>
                    <Text variant="h3">{name || 'User'}</Text>
                    <Text variant="bodySmall" color={colors.textSecondary}>Active now</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <Action icon="chatbubble-outline" title="Message" onPress={() => router.back()} />
                <Action icon="person-outline" title="View Profile" onPress={() => router.back()} />
                <Action icon="person-add-outline" title="Follow User" onPress={() => router.back()} />
                <Action icon="notifications-outline" title="Mute Notifications" onPress={() => router.back()} />
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Action icon="flag-outline" title="Report User" color={colors.error} onPress={() => router.back()} />
                <Action icon="ban" title="Block User" color={colors.error} onPress={() => router.back()} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 32,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    actions: {
        flex: 1,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    divider: {
        height: 1,
        marginVertical: 16,
        opacity: 0.1,
    }
});
