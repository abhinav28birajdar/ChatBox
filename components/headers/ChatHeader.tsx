import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Props {
    name: string;
    onPressInfo?: () => void;
}

export const ChatHeader = ({ name, onPressInfo }: Props) => {
    const { colors } = useTheme();
    const router = useRouter();

    return (
        <View style={[styles.container, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={28} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.info} onPress={onPressInfo}>
                <Avatar size="sm" name={name} />
                <View style={{ marginLeft: 12 }}>
                    <Text variant="subtitle2">{name}</Text>
                    <Text variant="caption" color={colors.success}>Online</Text>
                </View>
            </TouchableOpacity>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionIcon}>
                    <Ionicons name="call-outline" size={22} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionIcon}>
                    <Ionicons name="videocam-outline" size={22} color={colors.text} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 40,
    },
    info: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    actions: {
        flexDirection: 'row',
    },
    actionIcon: {
        marginLeft: 20,
    }
});
