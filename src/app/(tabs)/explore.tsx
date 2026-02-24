import React, { useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { SearchBar } from '@/components/shared/SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ServerCard } from '@/components/server/ServerCard';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { useServers } from '@/context/ServerContext';
import { serverCategoryConfig } from '@/constants/Config';

import type { Server } from '@/services/ServerService';
import type { ServerCategory } from '@/types';

export default function ExploreScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { exploreServers, joinServer, loading } = useServers();

    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Use real servers from Firebase instead of mock data
    const filteredServers = useMemo(() => {
        let list = exploreServers;

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (s: Server) => s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
            );
        }

        if (activeCategory) {
            list = list.filter((s: Server) => s.category === activeCategory);
        }

        return list;
    }, [exploreServers, search, activeCategory]);

    // Featured servers are just the top 5 by member count
    const featuredServers = useMemo(() => {
        return exploreServers.slice(0, 5);
    }, [exploreServers]);

    const handleJoin = async (server: Server) => {
        try {
            await joinServer(server.id);
            // Navigate to server details after joining
            router.push({
                pathname: '/server',
                params: { serverId: server.id }
            });
        } catch (error) {
            console.error('Error joining server:', error);
        }
    };

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text variant="h2">Explore</Text>
                    <Text variant="bodySmall" color={colors.textSecondary}>
                        Discover new communities to join
                    </Text>
                </View>

                <View style={styles.searchSection}>
                    <SearchBar placeholder="Search servers..." value={search} onChangeText={setSearch} />
                </View>

                {/* Categories */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScroll}
                >
                    <TouchableOpacity
                        style={[
                            styles.categoryChip,
                            { backgroundColor: !activeCategory ? colors.primary : colors.surface },
                        ]}
                        onPress={() => setActiveCategory(null)}
                    >
                        <Text variant="caption" color={!activeCategory ? '#000' : colors.text} style={{ fontWeight: '600' }}>
                            All
                        </Text>
                    </TouchableOpacity>
                    {Object.entries(serverCategoryConfig).map(([id, cat]) => (
                        <TouchableOpacity
                            key={id}
                            style={[
                                styles.categoryChip,
                                { backgroundColor: activeCategory === id ? colors.primary : colors.surface },
                            ]}
                            onPress={() => setActiveCategory(activeCategory === id ? null : id)}
                        >
                            <Ionicons
                                name={cat.icon as any}
                                size={14}
                                color={activeCategory === id ? '#000' : cat.color}
                                style={{ marginRight: 4 }}
                            />
                            <Text
                                variant="caption"
                                color={activeCategory === id ? '#000' : colors.text}
                                style={{ fontWeight: '600' }}
                            >
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Featured Servers */}
                {!search && !activeCategory && (
                    <View style={styles.section}>
                        <Text variant="subtitle1" style={styles.sectionTitle}>Featured</Text>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={featuredServers}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <ServerCard
                                    server={item}
                                    variant="featured"
                                    onPress={() => handleJoin(item)}
                                    onJoin={() => handleJoin(item)}
                                    style={{ marginRight: Spacing.md }}
                                />
                            )}
                            contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
                        />
                    </View>
                )}

                {/* Server List */}
                <View style={styles.section}>
                    <Text variant="subtitle1" style={[styles.sectionTitle, { paddingHorizontal: Spacing.lg }]}>
                        {activeCategory
                            ? serverCategoryConfig[activeCategory as ServerCategory]?.label ?? 'Servers'
                            : search
                                ? 'Search Results'
                                : 'Popular'}
                    </Text>
                    {filteredServers.length === 0 ? (
                        <EmptyState
                            icon="planet-outline"
                            title="No servers found"
                            subtitle="Try a different search or category"
                        />
                    ) : (
                        filteredServers.map((server) => (
                            <View key={server.id} style={styles.serverListItem}>
                                <ServerCard
                                    server={server}
                                    variant="list"
                                    onPress={() => handleJoin(server)}
                                    onJoin={() => handleJoin(server)}
                                />
                            </View>
                        ))
                    )}
                </View>

                <View style={{ height: Spacing.xxl }} />
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, marginBottom: Spacing.lg },
    searchSection: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
    categoryScroll: {
        paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.sm,
    },
    categoryChip: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: 20,
    },
    section: { marginBottom: Spacing.xl },
    sectionTitle: { fontWeight: '700', marginBottom: Spacing.md },
    serverListItem: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
});
