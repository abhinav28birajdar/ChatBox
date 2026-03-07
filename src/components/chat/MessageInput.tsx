import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { VoiceMessagePlayer } from './VoiceMessagePlayer'; // To be created next

interface MessageInputProps {
    onSendMessage: (text: string, type: 'text' | 'image' | 'video' | 'audio' | 'file') => void;
    conversationId: string;
    onTyping: (isTyping: boolean) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
    onSendMessage,
    conversationId,
    onTyping
}) => {
    const { colors, isDark } = useTheme();
    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleTextChange = (val: string) => {
        setText(val);
        if (!isTyping && val.length > 0) {
            setIsTyping(true);
            onTyping(true);
        } else if (isTyping && val.length === 0) {
            setIsTyping(false);
            onTyping(false);
        }
    };

    const handleSend = () => {
        if (text.trim().length === 0) return;
        onSendMessage(text, 'text');
        setText('');
        setIsTyping(false);
        onTyping(false);
    };

    const handleAttach = () => {
        Alert.alert('Attach', 'Feature coming soon!', [{ text: 'OK' }]);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border }]}
        >
            <View style={styles.inputRow}>
                <TouchableOpacity onPress={handleAttach} style={styles.iconButton}>
                    <Ionicons name="add" size={24} color={colors.primary} />
                </TouchableOpacity>

                <View style={[
                    styles.inputWrapper,
                    { backgroundColor: isDark ? colors.surface : colors.primaryLight, borderColor: colors.border }
                ]}>
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Type a message..."
                        placeholderTextColor={colors.textMuted}
                        value={text}
                        onChangeText={handleTextChange}
                        multiline
                        maxLength={1000}
                    />
                    <TouchableOpacity style={styles.emojiButton}>
                        <Ionicons name="happy-outline" size={22} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>

                {text.length > 0 ? (
                    <TouchableOpacity
                        onPress={handleSend}
                        style={[styles.sendButton, { backgroundColor: colors.primary }]}
                    >
                        <Ionicons name="send" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.micButton}>
                        <Ionicons name="mic-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        paddingVertical: 10,
        borderTopWidth: 1,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24,
        paddingHorizontal: 12,
        marginHorizontal: 8,
        minHeight: 44,
        maxHeight: 120,
        borderWidth: 1,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingTop: 10,
        paddingBottom: 10,
    },
    iconButton: {
        padding: 8,
    },
    emojiButton: {
        padding: 4,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 0,
    },
    micButton: {
        padding: 8,
    },
});
