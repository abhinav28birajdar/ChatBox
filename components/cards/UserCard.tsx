import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    user: {
        name: string;
        avatar?: string;
        status: any;
    };
    onPress?: () => void;
}

export const UserCard = ({ user, onPress }: Props) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity onPress={onPress}>
            <Card style={styles.card}>
                <Avatar size="md" source={user.avatar} status={user.status} />
                <View style={styles.info}>
                    <Text variant="subtitle2">{user.name}</Text>
                    <Text variant="caption" color={colors.textSecondary}>Active now</Text>
                </View>
                <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    info: {
        flex: 1,
        marginLeft: 16,
    }
});
