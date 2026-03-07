import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Typography } from '../../constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { communityService } from '../../services/communityService';
import { Community } from '../../types/community';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const CATEGORIES = ['All', 'Games', 'Artists', 'Tech', 'Music', 'Sports'];
const POPULAR_EMOJIS = ['🚀', '🎮', '🎨', '🎸', '⚽', '💻', '🎬', '📚', '🧩'];

export default function CommunityScreen() {
    const { colors, isDark } = useTheme();
    const { user } = useAuthStore();

    const [communities, setCommunities] = useState<Community[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const [modalVisible, setModalVisible] = useState(false);
    const [newCommunityName, setNewCommunityName] = useState('');
    const [newCommunityDesc, setNewCommunityDesc] = useState('');
    const [newCommunityCat, setNewCommunityCat] = useState('Tech');
    const [newCommunityEmoji, setNewCommunityEmoji] = useState('🚀');

    useEffect(() => {
        const unsubscribe = communityService.subscribeToCommunities((data) => {
            setCommunities(data);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filtered = communities.filter(c => {
        const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleCreateCommunity = async () => {
        if (!newCommunityName.trim() || !user) return;

        try {
            await communityService.createCommunity({
                name: newCommunityName,
                description: newCommunityDesc,
                category: newCommunityCat,
                cover: newCommunityEmoji,
            }, user.uid);

            // reset & close modal
            setNewCommunityName('');
            setNewCommunityDesc('');
            setNewCommunityCat('Tech');
            setNewCommunityEmoji('🚀');
            setModalVisible(false);
        } catch (error) {
            console.error("Error creating community:", error);
            alert("Failed to create community.");
        }
    };

    const toggleJoin = async (communityId: string, isMember: boolean) => {
        if (!user) return;
        try {
            if (isMember) {
                await communityService.leaveCommunity(communityId, user.uid);
            } else {
                await communityService.joinCommunity(communityId, user.uid);
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) return <LoadingSpinner fullScreen />;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Community</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={[styles.createBtn, { backgroundColor: colors.primary }]}>
                    <Ionicons name="add" size={20} color="#110D18" />
                    <Text style={styles.createBtnText}>Create</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.surface }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        placeholder="Search communities..."
                        placeholderTextColor={colors.textMuted}
                        style={[styles.searchInput, { color: colors.text }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={styles.categoriesWrapper}>
                <FlatList
                    data={CATEGORIES}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryPill,
                                { backgroundColor: item === selectedCategory ? colors.text : colors.surface }
                            ]}
                            onPress={() => setSelectedCategory(item)}
                        >
                            <Text style={[
                                styles.categoryText,
                                { color: item === selectedCategory ? colors.background : colors.textSecondary }
                            ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    const isMember = user ? item.members?.includes(user.uid) : false;

                    return (
                        <TouchableOpacity style={[styles.communityCard, { backgroundColor: colors.surface }]}>
                            <View style={styles.coverBox}>
                                <Text style={{ fontSize: 32 }}>{item.cover}</Text>
                            </View>
                            <View style={styles.cardInfo}>
                                <Text style={[styles.communityName, { color: colors.text }]}>{item.name}</Text>
                                <Text style={[styles.communityCategory, { color: colors.textSecondary }]}>{item.category}</Text>
                                <Text style={[styles.communityMembers, { color: colors.textMuted }]}>
                                    {(item.members?.length || 0).toLocaleString()} members
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.joinBtn, {
                                    backgroundColor: isMember ? 'transparent' : colors.primary,
                                    borderWidth: isMember ? 1 : 0,
                                    borderColor: colors.border
                                }]}
                                onPress={() => toggleJoin(item.id, isMember)}
                            >
                                <Text style={[styles.joinBtnText, { color: isMember ? colors.text : '#110D18' }]}>
                                    {isMember ? 'Leave' : 'Join'}
                                </Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {searchQuery ? 'No communities found.' : 'No active communities. Be the first to create one!'}
                        </Text>
                    </View>
                }
            />

            {/* Create Community Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Community</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Name</Text>
                        <TextInput
                            style={[styles.inputStyle, { backgroundColor: colors.surface, color: colors.text }]}
                            placeholder="Community Name"
                            placeholderTextColor={colors.textMuted}
                            value={newCommunityName}
                            onChangeText={setNewCommunityName}
                            maxLength={30}
                        />

                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Description (Optional)</Text>
                        <TextInput
                            style={[styles.inputStyle, { backgroundColor: colors.surface, color: colors.text, height: 80 }]}
                            placeholder="What is this community about?"
                            placeholderTextColor={colors.textMuted}
                            value={newCommunityDesc}
                            onChangeText={setNewCommunityDesc}
                            multiline
                            maxLength={100}
                        />

                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Category</Text>
                        <FlatList
                            data={CATEGORIES.filter(c => c !== 'All')}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ flexGrow: 0, marginBottom: 16 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.categoryPill,
                                        { backgroundColor: newCommunityCat === item ? colors.primary : colors.surface }
                                    ]}
                                    onPress={() => setNewCommunityCat(item)}
                                >
                                    <Text style={[styles.categoryText, { color: newCommunityCat === item ? '#110D18' : colors.textSecondary }]}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />

                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Icon / Emoji</Text>
                        <View style={styles.emojiGrid}>
                            {POPULAR_EMOJIS.map(e => (
                                <TouchableOpacity
                                    key={e}
                                    style={[
                                        styles.emojiBtn,
                                        { backgroundColor: newCommunityEmoji === e ? colors.primary : colors.surface }
                                    ]}
                                    onPress={() => setNewCommunityEmoji(e)}
                                >
                                    <Text style={{ fontSize: 24 }}>{e}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.modalSubmitBtn, { backgroundColor: newCommunityName.trim() ? colors.primary : colors.surface }]}
                            onPress={handleCreateCommunity}
                            disabled={!newCommunityName.trim()}
                        >
                            <Text style={[styles.modalSubmitText, { color: newCommunityName.trim() ? '#110D18' : colors.textMuted }]}>Create</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

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
        paddingBottom: 15,
    },
    headerTitle: {
        fontSize: 32,
        fontFamily: Typography.fontFamily.bold,
    },
    createBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    createBtnText: {
        color: '#110D18',
        fontSize: 14,
        fontFamily: Typography.fontFamily.bold,
        marginLeft: 4,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingBottom: 16,
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
        fontSize: 14,
        fontFamily: Typography.fontFamily.medium,
        marginLeft: 8,
    },
    categoriesWrapper: {
        marginBottom: 16,
    },
    categoryPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    categoryText: {
        fontSize: 13,
        fontFamily: Typography.fontFamily.bold,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    communityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 24,
        marginBottom: 12,
    },
    coverBox: {
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardInfo: {
        flex: 1,
    },
    communityName: {
        fontSize: 16,
        fontFamily: Typography.fontFamily.bold,
    },
    communityCategory: {
        fontSize: 12,
        fontFamily: Typography.fontFamily.medium,
        marginTop: 2,
    },
    communityMembers: {
        fontSize: 12,
        fontFamily: Typography.fontFamily.regular,
        marginTop: 4,
    },
    joinBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    joinBtnText: {
        color: '#110D18',
        fontSize: 12,
        fontFamily: Typography.fontFamily.bold,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.medium,
        textAlign: 'center',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: Typography.fontFamily.bold,
    },
    inputLabel: {
        fontSize: 13,
        fontFamily: Typography.fontFamily.medium,
        marginBottom: 8,
    },
    inputStyle: {
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        fontFamily: Typography.fontFamily.medium,
        marginBottom: 16,
    },
    emojiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    emojiBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalSubmitBtn: {
        paddingVertical: 16,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSubmitText: {
        fontSize: 16,
        fontFamily: Typography.fontFamily.bold,
    },
});
