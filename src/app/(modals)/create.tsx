import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/Spacing';
import { useRouter } from 'expo-router';
import { useServers } from '@/context/ServerContext';
import MediaService from '@/services/MediaService';
import * as Haptics from 'expo-haptics';

type Mode = 'choose' | 'create' | 'join';

export default function CreateModal() {
    const { colors } = useTheme();
    const router = useRouter();
    const { createServer, joinServer } = useServers();

    const [mode, setMode] = useState<Mode>('choose');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'general',
        iconUri: '',
        type: 'public' as 'public' | 'private',
    });
    const [inviteCode, setInviteCode] = useState('');

    const categories = [
        { id: 'gaming', label: 'Gaming', icon: 'game-controller' },
        { id: 'music', label: 'Music', icon: 'musical-notes' },
        { id: 'tech', label: 'Tech', icon: 'code-slash' },
        { id: 'art', label: 'Art', icon: 'color-palette' },
        { id: 'education', label: 'Education', icon: 'school' },
        { id: 'general', label: 'General', icon: 'chatbubbles' },
    ];

    const handleCreate = async () => {
        if (!formData.name.trim()) return;
        setLoading(true);
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await createServer({
                ...formData,
                name: formData.name.trim(),
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
        } catch (error) {
            console.error(error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!inviteCode.trim()) return;
        setLoading(true);
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await joinServer(inviteCode.trim());
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.back();
        } catch (error) {
            console.error(error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    const handlePickIcon = async () => {
        try {
            const results = await MediaService.pickImageFromGallery(false);
            if (results.length > 0) {
                setFormData(prev => ({ ...prev, iconUri: results[0].uri }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (mode === 'choose') {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <Text variant="h2" align="center">Create or Join</Text>
                    <Text variant="bodySmall" color={colors.textSecondary} align="center" style={styles.subtitle}>
                        Your journey starts with a community
                    </Text>

                    <TouchableOpacity
                        style={[styles.optionCard, { backgroundColor: colors.background, borderColor: colors.primary }]}
                        onPress={() => setMode('create')}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons name="add" size={32} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: Spacing.md }}>
                            <Text variant="subtitle1">Create a Server</Text>
                            <Text variant="caption" color={colors.textSecondary}>Start your own space for friends or fans</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.optionCard, { backgroundColor: colors.background, borderColor: colors.secondary }]}
                        onPress={() => setMode('join')}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: colors.secondary + '20' }]}>
                            <Ionicons name="link" size={28} color={colors.secondary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: Spacing.md }}>
                            <Text variant="subtitle1">Join a Server</Text>
                            <Text variant="caption" color={colors.textSecondary}>Got an invite? Come join the fun!</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <Button
                        title="Cancel"
                        variant="ghost"
                        onPress={() => router.back()}
                        style={{ marginTop: Spacing.xl }}
                    />
                </View>
            </View>
        );
    }

    if (mode === 'create') {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => setMode('choose')}>
                            <Ionicons name="chevron-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text variant="subtitle1" style={{ marginLeft: Spacing.sm }}>Back</Text>
                    </View>

                    <Text variant="h2" align="center">Create Server</Text>

                    <View style={styles.iconPickerSection}>
                        <TouchableOpacity onPress={handlePickIcon}>
                            <Avatar
                                size={80}
                                uri={formData.iconUri}
                                fallback={formData.name || 'S'}
                            />
                            <View style={[styles.iconAddBtn, { backgroundColor: colors.primary }]}>
                                <Ionicons name="camera" size={14} color={colors.background} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Input
                        label="SERVER NAME"
                        placeholder="What should we call it?"
                        value={formData.name}
                        onChangeText={t => setFormData(prev => ({ ...prev, name: t }))}
                    />

                    <View style={{ marginBottom: Spacing.lg }}>
                        <Text variant="caption" color={colors.textSecondary} style={styles.label}>
                            CATEGORY
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.catChip,
                                        { backgroundColor: formData.category === cat.id ? colors.primary : colors.background },
                                        formData.category === cat.id && { borderColor: colors.primary }
                                    ]}
                                    onPress={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                                >
                                    <Ionicons
                                        name={cat.icon as any}
                                        size={14}
                                        color={formData.category === cat.id ? colors.background : colors.text}
                                    />
                                    <Text
                                        variant="caption"
                                        color={formData.category === cat.id ? colors.background : colors.text}
                                        style={{ marginLeft: 4, fontWeight: '600' }}
                                    >
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <Button
                        title="Create Server"
                        onPress={handleCreate}
                        loading={loading}
                        style={{ marginBottom: Spacing.md }}
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setMode('choose')}>
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text variant="subtitle1" style={{ marginLeft: Spacing.sm }}>Back</Text>
                </View>

                <View style={{ alignItems: 'center', marginBottom: Spacing.xl }}>
                    <View style={[styles.iconCircle, { width: 64, height: 64, backgroundColor: colors.secondary + '20' }]}>
                        <Ionicons name="link" size={32} color={colors.secondary} />
                    </View>
                    <Text variant="h2" style={{ marginTop: Spacing.md }}>Join Server</Text>
                    <Text variant="bodySmall" color={colors.textSecondary} align="center">
                        Enter an invite code below to join
                    </Text>
                </View>

                <Input
                    label="INVITE CODE"
                    placeholder="e.g. GAMER-123"
                    value={inviteCode}
                    onChangeText={setInviteCode}
                    autoCapitalize="characters"
                />

                <Button
                    title="Join Server"
                    onPress={handleJoin}
                    loading={loading}
                    style={{ marginBottom: Spacing.md }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: Spacing.lg, justifyContent: 'center' },
    card: { padding: Spacing.xl, borderRadius: 24, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
    subtitle: { marginTop: Spacing.xs, marginBottom: Spacing.xl },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: 16,
        borderWidth: 1.5,
        marginBottom: Spacing.md,
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconPickerSection: {
        alignItems: 'center',
        marginVertical: Spacing.xl,
    },
    iconAddBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    label: {
        fontWeight: '700',
        marginBottom: Spacing.sm,
        marginLeft: 4,
    },
    catChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: Spacing.sm,
        borderWidth: 1,
        borderColor: 'transparent',
    },
});
