import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Message } from '../../types/message';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';
import { format } from 'date-fns';

interface MessageBubbleProps {
    message: Message;
    isMine: boolean;
    showAvatar?: boolean;
    onLongPress?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isMine,
    onLongPress
}) => {
    const { colors, isDark } = useTheme();

    const renderContent = () => {
        switch (message.type) {
            case 'text':
                return (
                    <Text style={[styles.text, { color: isMine ? '#FFFFFF' : colors.text }]}>
                        {message.text}
                    </Text>
                );
            case 'image':
                return (
                    <Image
                        source={{ uri: message.mediaUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                );
            case 'audio':
                return (
                    <VoiceMessagePlayer
                        uri={message.mediaUrl!}
                        duration={message.duration}
                    />
                );
            default:
                return (
                    <Text style={[styles.text, { color: isMine ? '#FFFFFF' : colors.text }]}>
                        {message.type} attachment
                    </Text>
                );
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onLongPress={onLongPress}
            style={[
                styles.container,
                isMine ? styles.mine : styles.theirs
            ]}
        >
            <View style={[
                styles.bubble,
                {
                    backgroundColor: isMine ? colors.primary : (isDark ? colors.surface : colors.background),
                    borderColor: colors.border,
                    borderWidth: isMine ? 0 : 0.5,
                },
                isMine ? styles.bubbleMine : styles.bubbleTheirs
            ]}>
                {renderContent()}
                <View style={styles.footer}>
                    <Text style={[
                        styles.time,
                        { color: isMine ? 'rgba(255,255,255,0.7)' : colors.textMuted }
                    ]}>
                        {message.createdAt ? format(message.createdAt.toDate(), 'HH:mm') : ''}
                    </Text>
                    {isMine && (
                        <View style={styles.status}>
                            {message.readBy.length > 1 ? (
                                <Text style={styles.readTicks}>✓✓</Text>
                            ) : (
                                <Text style={styles.sentTicks}>✓</Text>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 4,
        maxWidth: '85%',
    },
    mine: {
        alignSelf: 'flex-end',
    },
    theirs: {
        alignSelf: 'flex-start',
    },
    bubble: {
        padding: 10,
        borderRadius: 20,
        minWidth: 60,
    },
    bubbleMine: {
        borderBottomRightRadius: 4,
    },
    bubbleTheirs: {
        borderBottomLeftRadius: 4,
    },
    text: {
        fontSize: 16,
        lineHeight: 22,
    },
    image: {
        width: 250,
        height: 180,
        borderRadius: 12,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
    },
    time: {
        fontSize: 10,
        marginRight: 4,
    },
    status: {
        marginLeft: 2,
    },
    sentTicks: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
    readTicks: {
        fontSize: 12,
        color: '#3B82F6',
        fontWeight: 'bold',
    },
});
