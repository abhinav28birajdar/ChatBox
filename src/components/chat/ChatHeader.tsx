import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Avatar } from '../common/Avatar';
import { Typography } from '../../constants/typography';
import { DIMENSIONS } from '../../constants/dimensions';
import { format, isToday, isYesterday } from 'date-fns';

interface ChatHeaderProps {
    title: string;
    photoURL?: string;
    isOnline?: boolean;
    lastSeen?: any;
    onBack: () => void;
    onCall: () => void;
    onVideoCall: () => void;
    onInfo: () => void;
    style?: ViewStyle;
}

const formatLastSeen = (timestamp: any) => {
    if (!timestamp) return '';
    try {
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        if (isToday(date)) return `today at ${format(date, 'p')}`;
        if (isYesterday(date)) return `yesterday at ${format(date, 'p')}`;
        return format(date, 'MMM d, p');
    } catch (e) {
        return '';
    }
};

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    title,
    photoURL,
    isOnline,
    lastSeen,
    onBack,
    onCall,
    onVideoCall,
    onInfo,
    style
}) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: 10 }, style]}>
            <View style={styles.left}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onInfo} style={styles.userInfo}>
                    <Avatar
                        uri={photoURL}
                        size={40}
                        showPresence
                        isOnline={isOnline}
                    />
                    <View style={styles.textContainer}>
                        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
                        <Text style={[styles.status, { color: isOnline ? colors.online : colors.textSecondary }]}>
                            {isOnline ? 'Active Now' : lastSeen ? `Last seen ${formatLastSeen(lastSeen)}` : 'Offline'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.right}>
                <TouchableOpacity onPress={onCall} style={styles.iconButton}>
                    <Ionicons name="call-outline" size={24} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onVideoCall} style={styles.iconButton}>
                    <Ionicons name="videocam-outline" size={26} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onInfo} style={styles.iconButton}>
                    <Ionicons name="information-circle-outline" size={26} color={colors.primary} />
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
        paddingHorizontal: 16,
        paddingTop: DIMENSIONS.isIOS ? 0 : 40,
        height: DIMENSIONS.isIOS ? 56 : 96,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        zIndex: 100,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backButton: {
        marginRight: 8,
        padding: 4,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    textContainer: {
        marginLeft: 12,
        flex: 1,
    },
    title: {
        fontSize: Typography.fontSize.md,
        fontFamily: Typography.fontFamily.bold,
    },
    status: {
        fontSize: Typography.fontSize.xs,
        fontFamily: Typography.fontFamily.regular,
        marginTop: 2,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        marginLeft: 18,
        padding: 4,
    },
});
