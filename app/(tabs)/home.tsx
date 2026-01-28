import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { mockChats, mockUsers } from '@/constants/mockData';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';

export default function HomeScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [activeServer, setActiveServer] = useState('DM');

    const renderSidebar = () => (
        <View style={[styles.sidebar, { backgroundColor: '#1A1221' }]}>
            <TouchableOpacity
                style={[
                    styles.sidebarIcon,
                    { backgroundColor: activeServer === 'DM' ? colors.primary : colors.surface }
                ]}
                onPress={() => setActiveServer('DM')}
            >
                <Ionicons name="chatbubble" size={24} color={activeServer === 'DM' ? '#000' : colors.primary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <ScrollView showsVerticalScrollIndicator={false}>
                {[
                    { id: 'S1', initials: 'VT', color: '#8A4FFF' },
                    { id: 'S2', initials: 'UG', color: '#4ADE80' },
                    { id: 'S3', initials: 'AD', color: '#FF4B4B' },
                    { id: 'S4', initials: 'P', color: '#FACC15' },
                ].map((server) => (
                    <TouchableOpacity
                        key={server.id}
                        style={[
                            styles.sidebarServer,
                            { backgroundColor: server.color },
                            activeServer === server.id && styles.activeServerBorder
                        ]}
                        onPress={() => setActiveServer(server.id)}
                    >
                        <Text variant="caption" color="#000" style={{ fontWeight: '800' }}>{server.initials}</Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity style={[styles.sidebarServer, { borderStyle: 'dashed', borderWidth: 2, borderColor: '#333' }]}>
                    <Ionicons name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {renderSidebar()}

            <View style={[styles.content, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <Text variant="h3">Direct Messages</Text>
                    <TouchableOpacity>
                        <Ionicons name="search" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.friendsSection}>
                    <TouchableOpacity onPress={() => router.push('/friends')}>
                        <Text variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>ACTIVE FRIENDS &gt;</Text>
                    </TouchableOpacity>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={mockUsers}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.storyItem}>
                                <Avatar size="md" source={item.avatar} status={item.status as any} />
                                <Text variant="caption" style={{ marginTop: 6 }} numberOfLines={1}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={{ paddingLeft: 16 }}
                    />
                </View>

                <FlatList
                    data={mockChats}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.chatList}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.chatItem}>
                            <Avatar size="lg" name={item.name} />
                            <View style={styles.chatInfo}>
                                <View style={styles.chatHeader}>
                                    <Text variant="subtitle2">{item.name}</Text>
                                    <Text variant="caption" color={colors.textSecondary}>{item.time}</Text>
                                </View>
                                <Text variant="bodySmall" color={colors.textSecondary} numberOfLines={1}>{item.lastMessage}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />

                <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]}>
                    <Ionicons name="chatbubbles" size={26} color="#000" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebar: {
        width: 80,
        alignItems: 'center',
        paddingTop: 60,
    },
    sidebarIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    divider: {
        width: 36,
        height: 2,
        backgroundColor: '#333',
        marginBottom: 12,
        borderRadius: 1,
    },
    sidebarServer: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    activeServerBorder: {
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    content: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontWeight: '700',
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    friendsSection: {
        marginBottom: 24,
    },
    storyItem: {
        alignItems: 'center',
        marginRight: 20,
        width: 60,
    },
    chatList: {
        paddingHorizontal: 16,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 4,
    },
    chatInfo: {
        flex: 1,
        marginLeft: 16,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    }
});
