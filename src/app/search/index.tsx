import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useAuth } from '@/context/AuthContext';
import { useServers } from '@/context/ServerContext';
import ServerService from '@/services/ServerService';
import UserService from '@/services/UserService';
import DMService from '@/services/DMService';
import { Server, UserProfile } from '@/types';
import { debounce } from '@/utils/helpers';
import * as Haptics from 'expo-haptics';

type SearchTab = 'all' | 'people' | 'servers';

export default function SearchScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { userProfile } = useAuth();

    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState<SearchTab>('all');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [popularServers, setPopularServers] = useState<Server[]>([]);

    useEffect(() => {
        const fetchPopular = async () => {
            try {
                const { servers } = await ServerService.getPublicServers('all', 10);
                setPopularServers(servers);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPopular();
    }, []);

    const performSearch = useCallback(async (text: string, tab: SearchTab) => {
        if (text.length < 3) {
            setResults([]);
            return;
        }
        setLoading(true);
        try {
            const searchResults: any[] = [];
            if (tab === 'servers' || tab === 'all') {
                const servers = await ServerService.searchServers(text);
                searchResults.push(...servers.map((s: Server) => ({ ...s, type: 'server' })));
            }
            if (tab === 'people' || tab === 'all') {
                const users = await UserService.searchUsers(text);
                searchResults.push(...users
                    .filter((u: UserProfile) => u.uid !== userProfile?.uid)
                    .map((u: UserProfile) => ({ ...u, type: 'user' }))
                );
            }
            setResults(searchResults);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [userProfile?.uid]);

    // Debounced search — fires 400ms after the user stops typing.
    const debouncedSearch = useRef(debounce((text: string, tab: SearchTab) => performSearch(text, tab), 400)).current;

    const handleSearch = (text: string) => {
        setQuery(text);
        debouncedSearch(text, activeTab);
    };

    // Re-run search when tab changes if there's already a query.
    useEffect(() => {
        if (query.length >= 3) {
            performSearch(query, activeTab);
        }
    }, [activeTab]);

    const handleJoinServer = async (serverId: string) => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await ServerService.joinServer(serverId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/(tabs)/home');
        } catch (err) {
            console.error(err);
        }
    };

    const handleOpenUserDM = async (targetUserId: string) => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Find or create a DM room for these two users.
            const dmId = await DMService.createDM([targetUserId]);
            router.push({
                pathname: '/chat/chat-room',
                params: { id: dmId, type: 'dm' }
            });
        } catch (err) {
            console.error('Error opening DM:', err);
        }
    };

    const renderResultItem = ({ item }: { item: any }) => {
        if (item.type === 'user') {
            return (
                <TouchableOpacity
                    style={[styles.serverItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        // Look up/create DM room; do not pass raw UID as chat room ID.
                        handleOpenUserDM(item.uid || item.id);
                    }}
                >
                    <Avatar
                        size="lg"
                        uri={item.avatar}
                        fallback={item.displayName}
                    />
                    <View style={styles.serverInfo}>
                        <Text variant="bodyBold">{item.displayName}</Text>
                        <Text variant="caption" color={colors.textSecondary}>
                            @{item.username}
                        </Text>
                    </View>
                    <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
            );
        }

        return (
            <View style={[styles.serverItem, { borderBottomColor: colors.border }]}>
                <Avatar
                    size="lg"
                    uri={item.icon}
                    fallback={item.name}
                    style={{ borderRadius: 12 }}
                />
                <View style={styles.serverInfo}>
                    <Text variant="bodyBold">{item.name}</Text>
                    <Text variant="caption" color={colors.textSecondary} numberOfLines={1}>
                        {item.description}
                    </Text>
                    <View style={styles.serverMeta}>
                        <Text variant="caption" color={colors.primary}>
                            {item.memberCount} members
                        </Text>
                        <View style={[styles.dot, { backgroundColor: colors.textSecondary }]} />
                        <Text variant="caption" color={colors.textSecondary}>
                            {item.category}
                        </Text>
                    </View>
                </View>
                <Button
                    title="Join"
                    size="sm"
                    onPress={() => handleJoinServer(item.id)}
                    style={{ width: 60 }}
                />
            </View>
        );
    };

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Search people or servers..."
                            placeholderTextColor={colors.textSecondary}
                            value={query}
                            onChangeText={handleSearch}
                            autoFocus
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => handleSearch('')}>
                                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={styles.tabsRow}>
                    {(['all', 'people', 'servers'] as SearchTab[]).map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                activeTab === tab && { borderBottomColor: colors.primary }
                            ]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text
                                variant="bodySmall"
                                color={activeTab === tab ? colors.primary : colors.textSecondary}
                                style={{ textTransform: 'capitalize', fontWeight: activeTab === tab ? '700' : '500' }}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {query.length === 0 ? (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <Text variant="subtitle2" style={styles.sectionTitle}>POPULAR SERVERS</Text>
                        {popularServers.map(server => (
                            <TouchableOpacity
                                key={server.id}
                                onPress={() => { }}
                                activeOpacity={0.7}
                            >
                                {renderResultItem({ item: { ...server, type: 'server' } })}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                ) : loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={results}
                        keyExtractor={item => item.id}
                        renderItem={renderResultItem}
                        contentContainerStyle={styles.scrollContent}
                        initialNumToRender={15}
                        maxToRenderPerBatch={10}
                        windowSize={10}
                        ListEmptyComponent={
                            <View style={styles.center}>
                                <Ionicons name="search-outline" size={64} color={colors.surface} />
                                <Text variant="body" color={colors.textSecondary} style={{ marginTop: Spacing.md }}>
                                    No results found for "{query}"
                                </Text>
                            </View>
                        }
                    />
                )}
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    backBtn: {
        padding: Spacing.xs,
        marginRight: Spacing.sm,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        borderRadius: 22,
        paddingHorizontal: Spacing.md,
    },
    input: {
        flex: 1,
        marginLeft: Spacing.sm,
        ...Typography.body,
        fontSize: 16,
    },
    tabsRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    tab: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        marginRight: Spacing.sm,
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    sectionTitle: {
        marginBottom: Spacing.md,
        opacity: 0.6,
    },
    serverItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    serverInfo: {
        flex: 1,
        marginLeft: Spacing.md,
        marginRight: Spacing.sm,
    },
    serverMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        marginHorizontal: 8,
        opacity: 0.5,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
});
