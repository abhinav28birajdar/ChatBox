import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Avatar } from '../common/Avatar';
import { Typography } from '../../constants/typography';

interface FriendCardProps {
    uid: string;
    displayName: string;
    photoURL?: string;
    isOnline?: boolean;
    subtitle?: string;
    status?: 'friend' | 'pending_incoming' | 'pending_outgoing' | 'none';
    onPress: () => void;
    onAction?: () => void;
    onDecline?: () => void;
}

export const FriendCard: React.FC<FriendCardProps> = ({
    uid,
    displayName,
    photoURL,
    isOnline,
    subtitle,
    status = 'none',
    onPress,
    onAction,
    onDecline
}) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity style={[styles.container, { backgroundColor: colors.surface }]} onPress={onPress}>
            <View style={styles.leftContent}>
                <Avatar uri={photoURL} size={48} showPresence isOnline={isOnline} />
                <View style={styles.info}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{displayName}</Text>

                    <View style={styles.statusRow}>
                        <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.online : colors.textMuted }]} />
                        <Text style={[styles.statusText, { color: colors.textSecondary }]} numberOfLines={1}>
                            {subtitle ? subtitle : (isOnline ? 'Active Now' : 'Offline')}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                {status === 'none' && (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={onAction}>
                        <Text style={styles.actionButtonText}>ADD</Text>
                    </TouchableOpacity>
                )}

                {status === 'friend' && (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={onAction}>
                        <Text style={styles.actionButtonText}>CHAT</Text>
                    </TouchableOpacity>
                )}

                {status === 'pending_outgoing' && (
                    <View style={[styles.actionButton, { backgroundColor: colors.border }]}>
                        <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>PENDING</Text>
                    </View>
                )}

                {status === 'pending_incoming' && (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary, paddingHorizontal: 12 }]} onPress={onAction}>
                            <Text style={styles.actionButtonText}>ACCEPT</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 24,
        marginBottom: 12,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    info: {
        marginLeft: 16,
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontFamily: Typography.fontFamily.bold,
        marginBottom: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 13,
        fontFamily: Typography.fontFamily.medium,
    },
    actions: {
        marginLeft: 12,
    },
    actionButton: {
        paddingHorizontal: 16,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#110D18',
        fontSize: 12,
        fontFamily: Typography.fontFamily.bold,
        letterSpacing: 0.5,
    },
});
