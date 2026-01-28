import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Props {
    title: string;
    showAvatar?: boolean;
}

export const AppHeader = ({ title, showAvatar = true }: Props) => {
    const { colors } = useTheme();
    const router = useRouter();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.left}>
                {showAvatar && (
                    <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                        <Avatar size="sm" source="https://i.pravatar.cc/150?u=me" />
                    </TouchableOpacity>
                )}
                <Text variant="h3" style={{ marginLeft: showAvatar ? 12 : 0 }}>{title}</Text>
            </View>

            <View style={styles.right}>
                <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="search" size={24} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(tabs)/notifications')}>
                    <Ionicons name="notifications-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginTop: 40,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    right: {
        flexDirection: 'row',
    },
    iconBtn: {
        marginLeft: 16,
    }
});
