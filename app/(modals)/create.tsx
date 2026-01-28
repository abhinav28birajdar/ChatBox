import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { useRouter } from 'expo-router';

export default function CreateModal() {
    const { colors } = useTheme();
    const router = useRouter();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.card, { backgroundColor: '#1E1428' }]}>
                <View style={styles.logoContainer}>
                    <View style={[styles.logo, { backgroundColor: '#FFE031' }]}>
                        <Ionicons name="leaf" size={24} color="#000" />
                    </View>
                </View>

                <Text variant="caption" color={colors.textSecondary} align="center">You've been invited to join</Text>
                <Text variant="h2" align="center" style={{ marginVertical: 8 }}>EcomDimes</Text>

                <View style={styles.invitedBy}>
                    <Text variant="caption" color={colors.textSecondary}>Invited by</Text>
                    <View style={styles.inviterBadge}>
                        <Avatar size="xs" source="https://i.pravatar.cc/150?u=frank" />
                        <Text variant="caption" style={{ marginLeft: 4 }}>Frank</Text>
                    </View>
                </View>

                <View style={styles.stats}>
                    <Text variant="caption" color={colors.textSecondary}># general</Text>
                    <View style={styles.dot} />
                    <Text variant="caption" color={colors.textSecondary}>3,578 Members</Text>
                </View>

                <Button
                    title="Accept Invite"
                    onPress={() => router.back()}
                    style={styles.actionBtn}
                />

                <TouchableOpacity onPress={() => router.back()}>
                    <Text variant="button" color={colors.textSecondary} align="center">No Thanks</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        padding: 32,
        borderRadius: 32,
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 24,
    },
    logo: {
        width: 56,
        height: 56,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    invitedBy: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    inviterBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#555',
        marginHorizontal: 8,
    },
    actionBtn: {
        width: '100%',
        marginBottom: 20,
    }
});
