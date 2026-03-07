import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, Alert } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { useAuthStore } from '../../store/authStore';
import { FriendCard } from '../../components/profile/FriendCard';
import { userService } from '../../services/userService';
import { messageService } from '../../services/messageService';
import { FirestoreUser } from '../../types/user';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ROUTES } from '../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { debounce } from '../../utils/debounce';

export default function FriendsScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();
    const { user, firestoreUser } = useAuthStore();

    const [friends, setFriends] = useState<FirestoreUser[]>([]);
    const [pendingRequests, setPendingRequests] = useState<FirestoreUser[]>([]);
    const [searchResults, setSearchResults] = useState<FirestoreUser[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'search'>('all');

    const fetchData = useCallback(async () => {
        try {
            const [userFriends, userPending] = await Promise.all([
                userService.getFriends(user!.uid),
                userService.getPendingRequests(user!.uid),
            ]);
            setFriends(userFriends);
            setPendingRequests(userPending);
        } catch (_error) {
            // Silently fail — user data stays stale
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Debounced search — fires after 500 ms of no typing
    const debouncedSearch = useMemo(() =>
        debounce(async (query: string) => {
            if (!query.trim()) return;
            try {
                setIsLoading(true);
                const results = await userService.searchUsers(query.trim());
                setSearchResults(results.filter(u => u.uid !== user!.uid));
                setActiveTab('search');
            } catch (_error) {
                // noop
            } finally {
                setIsLoading(false);
            }
        }, 500)
        , [user]);

    const handleSearch = useCallback(() => {
        if (!searchQuery.trim()) return;
        debouncedSearch(searchQuery);
    }, [searchQuery, debouncedSearch]);

    const handleMessage = useCallback(async (friend: FirestoreUser) => {
        try {
            const conversationId = await messageService.getOrCreateConversation(user!.uid, friend.uid);
            navigation.navigate(ROUTES.CHAT.DIRECT, { conversationId, otherUser: friend });
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    }, [user, navigation]);

    if (isLoading && !refreshing) return <LoadingSpinner fullScreen />;

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
                name={activeTab === 'all' ? 'account-multiple-outline' : activeTab === 'pending' ? 'clock-outline' : 'magnify'}
                size={80}
                color={colors.textMuted}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {activeTab === 'all' ? 'No friends yet.' : activeTab === 'pending' ? 'No pending requests.' : 'Search for friends above.'}
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Explore</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Discover new friends to chat with.</Text>

                <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.surface }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        placeholder="Search for friends..."
                        placeholderTextColor={colors.textMuted}
                        style={[styles.searchInput, { color: colors.text }]}
                        value={searchQuery}
                        onChangeText={(text) => {
                            setSearchQuery(text);
                            debouncedSearch(text);
                        }}
                    />
                </View>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'all' && { borderBottomColor: colors.primary }]}
                    onPress={() => setActiveTab('all')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'all' ? colors.primary : colors.textMuted }]}>
                        Friends ({friends.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'pending' && { borderBottomColor: colors.primary }]}
                    onPress={() => setActiveTab('pending')}
                >
                    <View style={styles.tabRow}>
                        <Text style={[styles.tabText, { color: activeTab === 'pending' ? colors.primary : colors.textMuted }]}>
                            Requests
                        </Text>
                        {pendingRequests.length > 0 && (
                            <View style={[styles.badge, { backgroundColor: colors.error }]}>
                                <Text style={styles.badgeText}>{pendingRequests.length}</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'search' && { borderBottomColor: colors.primary }]}
                    onPress={() => setActiveTab('search')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'search' ? colors.primary : colors.textMuted }]}>
                        Search
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={activeTab === 'all' ? friends : activeTab === 'pending' ? pendingRequests : searchResults}
                keyExtractor={(item) => item.uid}
                renderItem={({ item }) => (
                    <FriendCard
                        uid={item.uid}
                        displayName={item.displayName}
                        photoURL={item.photoURL}
                        isOnline={item.isOnline}
                        subtitle={activeTab === 'search' ? item.email : undefined}
                        status={
                            firestoreUser?.friends?.includes(item.uid) ? 'friend' :
                                pendingRequests.some(p => p.uid === item.uid) ? 'pending_incoming' :
                                    firestoreUser?.sentRequests?.includes(item.uid) ? 'pending_outgoing' : 'none'
                        }
                        onPress={() => navigation.navigate(ROUTES.MAIN.USER_DETAIL, { userId: item.uid, user: item })}
                        onAction={() => {
                            if (firestoreUser?.friends?.includes(item.uid)) {
                                handleMessage(item);
                            } else {
                                fetchData();
                            }
                        }}
                    />
                )}
                contentContainerStyle={styles.listContent}
                removeClippedSubviews
                initialNumToRender={15}
                maxToRenderPerBatch={10}
                windowSize={5}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.primary} />
                }
                ListEmptyComponent={renderEmpty}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    title: {
        fontSize: 32,
        fontFamily: Typography.fontFamily.bold,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.medium,
        marginBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 50,
        borderRadius: 24,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: Typography.fontSize.sm,
        fontFamily: Typography.fontFamily.medium,
        marginLeft: 8,
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    tab: {
        paddingVertical: 12,
        marginRight: 24,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabText: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.bold,
    },
    badge: {
        marginLeft: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 18,
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 100,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: Typography.fontFamily.medium,
        marginTop: 16,
    },
});
