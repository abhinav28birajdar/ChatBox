import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { SearchBar } from '@/components/shared/SearchBar';
import { Ionicons } from '@expo/vector-icons';
import { mockChats } from '@/constants/mockData';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';

export default function ChatScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text variant="h2">Messages</Text>
                <TouchableOpacity
                    style={[styles.iconBtn, { backgroundColor: colors.surface }]}
                    onPress={() => router.push('/chat/create-chat')}
                >
                    <Ionicons name="create-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.search}>
                <SearchBar placeholder="Search messages..." />
            </View>

            <FlatList
                data={mockChats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.chatItem}
                        onPress={() => router.push({
                            pathname: '/chat/chat-room',
                            params: { id: item.id, name: item.name }
                        })}
                    >
                        <Avatar size="lg" name={item.name} />
                        <View style={styles.content}>
                            <View style={styles.row}>
                                <Text variant="subtitle2">{item.name}</Text>
                                <Text variant="caption" color={colors.textSecondary}>{item.time}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text variant="bodySmall" color={colors.textSecondary} numberOfLines={1} style={{ flex: 1 }}>
                                    {item.lastMessage}
                                </Text>
                                {item.unread > 0 && (
                                    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                                        <Text variant="caption" color="#000" style={{ fontWeight: '700' }}>{item.unread}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.list}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    search: {
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    list: {
        paddingHorizontal: 20,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    content: {
        flex: 1,
        marginLeft: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    badge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
    }
});
