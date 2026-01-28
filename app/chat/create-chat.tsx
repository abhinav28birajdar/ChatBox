import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { mockUsers } from '@/constants/mockData';

export default function CreateChatScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [search, setSearch] = useState('');

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text variant="button" color={colors.primary}>Cancel</Text>
                    </TouchableOpacity>
                    <Text variant="subtitle1">New Chat</Text>
                    <View style={{ width: 50 }} />
                </View>

                <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
                    <Text variant="caption" color={colors.textSecondary}>To:</Text>
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Type a name"
                        placeholderTextColor={colors.textSecondary}
                        value={search}
                        onChangeText={setSearch}
                        autoFocus
                    />
                    <TouchableOpacity>
                        <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <Text variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>SUGGESTED</Text>

            <FlatList
                data={mockUsers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.userItem}
                        onPress={() => router.replace({
                            pathname: '/chat/chat-room',
                            params: { id: item.id, name: item.name }
                        })}
                    >
                        <Avatar size="md" source={item.avatar} status={item.status as any} />
                        <View style={styles.userInfo}>
                            <Text variant="subtitle2">{item.name}</Text>
                            <Text variant="caption" color={colors.textSecondary}>@{item.name.toLowerCase()}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.list}
            />

            <View style={styles.groupButton}>
                <Button
                    title="Create a Group"
                    onPress={() => { }}
                    variant="outline"
                    icon={<Ionicons name="people" size={20} color={colors.text} />}
                />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 52,
        borderRadius: 12,
    },
    input: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    sectionTitle: {
        fontWeight: '800',
        paddingHorizontal: 20,
        marginTop: 8,
        marginBottom: 12,
    },
    list: {
        paddingHorizontal: 16,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    userInfo: {
        marginLeft: 16,
    },
    groupButton: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    }
});
