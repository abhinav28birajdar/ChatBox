import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { MessageInput } from '../../components/chat/MessageInput';
import { ChatHeader } from '../../components/chat/ChatHeader';
import { TypingIndicator } from '../../components/chat/TypingIndicator';
import { messageService } from '../../services/messageService';
import { presenceService } from '../../services/presenceService';
import { Message, Conversation } from '../../types/message';
import { FirestoreUser } from '../../types/user';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ROUTES } from '../../constants/routes';

export const DirectMessageScreen: React.FC = () => {
    const { colors } = useTheme();
    const { user } = useAuthStore();
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { conversationId, otherUser } = route.params as { conversationId: string, otherUser: FirestoreUser };

    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserPresence, setOtherUserPresence] = useState<{ isOnline: boolean, lastSeen?: any }>({ isOnline: false });
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const unsubscribeMessages = messageService.subscribeToMessages(conversationId, (newMessages) => {
            setMessages(newMessages);
            setIsLoading(false);
            // Mark as read
            if (newMessages.length > 0) {
                messageService.markAsRead(conversationId, newMessages[newMessages.length - 1].id, user!.uid);
            }
        });

        const unsubscribeTyping = presenceService.subscribeTyping(conversationId, otherUser.uid, (isOtherTyping) => {
            setIsTyping(isOtherTyping as any);
        });

        const unsubscribePresence = presenceService.subscribePresence(otherUser.uid, (presence) => {
            setOtherUserPresence(presence as any);
        });

        return () => {
            unsubscribeMessages();
            unsubscribeTyping();
            unsubscribePresence();
        };
    }, [conversationId, otherUser.uid]);

    const handleSendMessage = async (text: string, type: 'text' | 'image' | 'video' | 'audio' | 'location' | 'file', metadata?: any) => {
        try {
            await messageService.sendMessage(conversationId, {
                senderId: user!.uid,
                text,
                type,
                ...metadata
            });
        } catch (error: any) {
            Alert.alert('Error', 'Failed to send message: ' + error.message);
        }
    };

    const handleTyping = (typing: boolean) => {
        presenceService.setTyping(conversationId, user!.uid, typing);
    };

    if (isLoading) return <LoadingSpinner fullScreen />;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ChatHeader
                title={otherUser.displayName}
                photoURL={otherUser.photoURL}
                isOnline={otherUserPresence.isOnline}
                onBack={() => navigation.goBack()}
                onCall={() => Alert.alert('Call', 'Voice call coming soon!')}
                onVideoCall={() => Alert.alert('Video Call', 'Video call coming soon!')}
                onInfo={() => navigation.navigate(ROUTES.MAIN.USER_DETAIL as any, { userId: otherUser.uid, user: otherUser })}
            />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <MessageBubble
                            message={item}
                            isMine={item.senderId === user?.uid}
                            showAvatar={index === 0 || messages[index - 1].senderId !== item.senderId}
                        />
                    )}
                    contentContainerStyle={styles.messageList}
                    inverted
                />

                {isTyping && (
                    <View style={styles.typingContainer}>
                        <TypingIndicator />
                    </View>
                )}

                <MessageInput
                    onSendMessage={handleSendMessage}
                    onTyping={handleTyping}
                    conversationId={conversationId}
                />
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    messageList: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    typingContainer: {
        paddingLeft: 20,
        paddingBottom: 8,
    },
});
