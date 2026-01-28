import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { SearchBar } from '@/components/shared/SearchBar';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';

const CATEGORIES = [
    { name: 'Gaming', icon: 'game-controller', color: '#8A4FFF' },
    { name: 'Music', icon: 'musical-notes', color: '#4ADE80' },
    { name: 'Tech', icon: 'terminal', color: '#FACC15' },
    { name: 'Art', icon: 'color-palette', color: '#FF4B4B' },
];

const RECOMMENDATIONS = [
    { id: '1', name: 'Dev Den', members: '12k', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400' },
    { id: '2', name: 'Lo-Fi Beats', members: '45k', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400' },
    { id: '3', name: 'Crypto Hub', members: '8k', image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400' },
];

export default function ExploreScreen() {
    const { colors } = useTheme();

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text variant="h2">Explore</Text>
                    <Text variant="bodySmall" color={colors.textSecondary}>Discover new communities to join.</Text>
                </View>

                <View style={styles.search}>
                    <SearchBar placeholder="Search for servers..." />
                </View>

                <View style={styles.section}>
                    <Text variant="subtitle2" style={styles.sectionTitle}>Categories</Text>
                    <View style={styles.categoryGrid}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity key={cat.name} style={[styles.catItem, { backgroundColor: colors.surface }]}>
                                <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                                <Text variant="caption" style={{ marginTop: 8 }}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text variant="subtitle2" style={styles.sectionTitle}>Recommended for You</Text>
                    {RECOMMENDATIONS.map((res) => (
                        <Card key={res.id} style={styles.serverCard}>
                            <Image source={{ uri: res.image }} style={styles.serverImg} />
                            <View style={styles.serverInfo}>
                                <Text variant="subtitle2">{res.name}</Text>
                                <View style={styles.row}>
                                    <View style={[styles.dot, { backgroundColor: '#4ADE80' }]} />
                                    <Text variant="caption" color={colors.textSecondary}>{res.members} members online</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={[styles.joinBtn, { backgroundColor: colors.primary }]}>
                                <Text variant="caption" color="#000" style={{ fontWeight: '700' }}>JOIN</Text>
                            </TouchableOpacity>
                        </Card>
                    ))}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        marginBottom: 20,
    },
    search: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    sectionTitle: {
        marginBottom: 16,
        fontWeight: '700',
    },
    categoryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    catItem: {
        width: '22%',
        aspectRatio: 1,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    serverCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        padding: 12,
    },
    serverImg: {
        width: 50,
        height: 50,
        borderRadius: 12,
    },
    serverInfo: {
        flex: 1,
        marginLeft: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    joinBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    }
});
