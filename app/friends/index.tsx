import React from 'react';
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { mockUsers } from '@/constants/mockData';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';

export default function FriendsScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.titleRow}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text variant="h3" style={{ marginLeft: 16 }}>Friends</Text>
            </View>

            <Card style={styles.requestCard}>
                <View style={styles.requestInfo}>
                    <View style={styles.avatarGroup}>
                        <Avatar size="sm" source={mockUsers[0]?.avatar} style={styles.overlapAvatar} />
                        <Avatar size="sm" source={mockUsers[1]?.avatar} style={[styles.overlapAvatar, { marginLeft: -12 }]} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text variant="subtitle2">Incoming Friend Request</Text>
                        <Text variant="bodySmall" color={colors.textSecondary}>From Crawford and Tawny</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>
            </Card>

            <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
                <Ionicons name="search" size={20} color={colors.textSecondary} />
                <TextInput
                    placeholder="Search in the friends list"
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.searchInput, { color: colors.text }]}
                />
                <Ionicons name="options" size={20} color={colors.textSecondary} />
            </View>
        </View>
    );

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <FlatList
                data={mockUsers}
                ListHeaderComponent={renderHeader}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item, index }) => {
                    const showLetter = index === 0 || mockUsers[index - 1].name.charAt(0) !== item.name.charAt(0);
                    return (
                        <View>
                            {showLetter && (
                                <Text variant="subtitle2" color={colors.textSecondary} style={styles.letterSection}>
                                    {item.name.charAt(0)}
                                </Text>
                            )}
                            <TouchableOpacity style={styles.friendItem}>
                                <Avatar size="md" source={item.avatar} status={item.status as any} />
                                <View style={styles.friendInfo}>
                                    <Text variant="subtitle2">{item.name}</Text>
                                    <Text variant="bodySmall" color={colors.textSecondary}>{item.status}</Text>
                                </View>
                                <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    );
                }}
            />
            <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]}>
                <Ionicons name="add" size={32} color="#000" />
            </TouchableOpacity>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: Spacing.md,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        marginTop: 8,
    },
    requestCard: {
        marginBottom: Spacing.lg,
        backgroundColor: '#24192E',
    },
    requestInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarGroup: {
        flexDirection: 'row',
    },
    overlapAvatar: {
        borderWidth: 2,
        borderColor: '#24192E',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 48,
        borderRadius: 24,
        marginBottom: 24,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
    },
    list: {
        paddingBottom: 100,
    },
    letterSection: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 8,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: 12,
    },
    friendInfo: {
        flex: 1,
        marginLeft: 12,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
