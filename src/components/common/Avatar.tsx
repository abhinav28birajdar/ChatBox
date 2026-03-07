import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface AvatarProps {
    uri?: string;
    name?: string;
    size?: number;
    showPresence?: boolean;
    isOnline?: boolean;
    onPress?: () => void;
    style?: any;
}

export const Avatar: React.FC<AvatarProps> = ({
    uri,
    name,
    size = 48,
    showPresence = false,
    isOnline = false,
    onPress,
    style
}) => {
    const { colors, isDark } = useTheme();

    const getInitials = () => {
        if (!name) return '?';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const renderContent = () => {
        if (uri && uri !== '') {
            return <Image source={{ uri: uri }} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} />;
        }
        return (
            <View style={[
                styles.initialsContainer,
                { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surface }
            ]}>
                <Text style={[styles.initials, { fontSize: size * 0.4, color: '#94A3B8' }]}>{getInitials()}</Text>
            </View>
        );
    };

    return (
        <TouchableOpacity onPress={onPress} disabled={!onPress} style={[styles.container, { width: size, height: size }, style]}>
            {renderContent()}
            {showPresence && (
                <View style={[
                    styles.onlineIndicator,
                    {
                        width: size * 0.3,
                        height: size * 0.3,
                        borderRadius: size * 0.15,
                        backgroundColor: isOnline ? colors.success : colors.textMuted,
                        borderColor: colors.background,
                        borderWidth: 2
                    }
                ]} />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        resizeMode: 'cover',
    },
    initialsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        fontWeight: 'bold',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        borderWidth: 2,
    },
});
