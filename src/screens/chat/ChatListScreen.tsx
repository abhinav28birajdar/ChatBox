import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { ConversationItem } from '../../components/chat/ConversationItem';
import { messageService } from '../../services/messageService';
import { presenceService } from '../../services/presenceService';
import { userService } from '../../services/userService';
import { Conversation } from '../../types/message';
import { FirestoreUser } from '../../types/user';
import { Typography } from '../../constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES } from '../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function ChatListScreen() {
    const { colors } = useTheme();
    const { user } = useAuthStore();
    const navigation = useNavigation<any>();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [otherUsers, setOtherUsers] = useState<{ [id: string]: FirestoreUser }>({});

    useEffect(() => {
        const unsubscribe = messageService.getConversations(user!.uid, async (convs) => {
            setConversations(convs);

            // Resolve other users
            const newOtherUsers = { ...otherUsers };
            let updated = false;

            for (const conv of convs) {
                const otherUserId = conv.participants.find(id => id !== user!.uid);
                if (otherUserId && !newOtherUsers[otherUserId]) {
                    const userData = await userService.getUser(otherUserId);
                    if (userData) {
                        newOtherUsers[otherUserId] = userData;
                        updated = true;
                    }
                }
            }

            if (updated) setOtherUsers(newOtherUsers);
            setIsLoading(false);
            setRefreshing(false);
        });

        return () => unsubscribe();
    }, [user!.uid]);

    const onRefresh = () => {
        setRefreshing(true);
        // Firebase listeners will re-fetch
    };

    const filteredConversations = conversations.filter(conv => {
        const otherUserId = conv.participants.find(id => id !== user!.uid);
        const otherUserData = otherUserId ? otherUsers[otherUserId] : null;
        if (!searchQuery) return true;
        return otherUserData?.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            otherUserData?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (isLoading && conversations.length === 0) return <LoadingSpinner fullScreen />;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.MAIN.FRIENDS)}>
                    <Ionicons name="create-outline" size={24} color={colors.primary} style={[styles.composeIcon, { borderColor: colors.primary }]} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.surface }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        placeholder="Search messages..."
                        placeholderTextColor={colors.textMuted}
                        style={[styles.searchInput, { color: colors.text }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <FlatList
                data={filteredConversations}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const otherUserId = item.participants.find(id => id !== user!.uid);
                    const otherUserData = otherUserId ? otherUsers[otherUserId] : null;

                    return (
                        <ConversationItem
                            conversation={item}
                            otherUserName={otherUserData?.displayName || 'Loading...'}
                            otherUserPhoto={otherUserData?.photoURL}
                            isOnline={otherUserData?.isOnline}
                            onPress={() => navigation.navigate(ROUTES.CHAT.DIRECT, {
                                conversationId: item.id,
                                otherUser: otherUserData || { uid: otherUserId || '', displayName: 'User', photoURL: '' }
                            })}
                        />
                    );
                }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={80} color={colors.textMuted} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {searchQuery ? 'No conversations found.' : 'No messages yet.'}
                        </Text>
                        <TouchableOpacity style={styles.startBtn} onPress={() => navigation.navigate(ROUTES.MAIN.FRIENDS)}>
                            <Text style={[styles.startBtnText, { color: colors.primary }]}>Start a conversation</Text>
                        </TouchableOpacity>
                    </View>
                }
                contentContainerStyle={styles.listContent}
            />
        </View>
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
        paddingTop: 60,
        paddingBottom: 10,
    },
    title: {
        fontSize: 32,
        fontFamily: Typography.fontFamily.bold,
    },
    composeIcon: {
        padding: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 48,
        borderRadius: 16,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: Typography.fontFamily.medium,
        marginLeft: 8,
    },
    listContent: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        fontSize: Typography.fontSize.md,
        fontFamily: Typography.fontFamily.medium,
        marginTop: 16,
    },
    startBtn: {
        marginTop: 24,
    },
    startBtnText: {
        fontSize: Typography.fontSize.md,
        fontFamily: Typography.fontFamily.bold,
    },
});
