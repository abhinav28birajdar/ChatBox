import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Avatar } from '@/components/ui/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';

const MOCK_MESSAGES = [
    { id: '1', text: 'Hey, how is it going?', sender: 'them', time: '10:00 AM' },
    { id: '2', text: 'Pretty good! Just working on the new UI.', sender: 'me', time: '10:01 AM' },
    { id: '3', text: 'Looks awesome so far. When can we test it?', sender: 'them', time: '10:02 AM' },
    { id: '4', text: 'Soon! I am finishing up the chat transitions.', sender: 'me', time: '10:05 AM' },
];

export default function ChatRoomScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { name } = useLocalSearchParams();
    const [message, setMessage] = useState('');

    return (
        <ScreenWrapper style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerInfo} onPress={() => { }}>
                    <Avatar size="sm" name={name as string} />
                    <View style={{ marginLeft: 12 }}>
                        <Text variant="subtitle2">{name || 'Chat'}</Text>
                        <Text variant="caption" color="#4ADE80">Online</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.actionIcon}>
                        <Ionicons name="call-outline" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionIcon}>
                        <Ionicons name="videocam-outline" size={22} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={MOCK_MESSAGES}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={[
                        styles.messageWrapper,
                        item.sender === 'me' ? styles.myMessageWrapper : styles.theirMessageWrapper
                    ]}>
                        <View style={[
                            styles.bubble,
                            { backgroundColor: item.sender === 'me' ? colors.primary : colors.surface }
                        ]}>
                            <Text
                                variant="bodySmall"
                                color={item.sender === 'me' ? '#000' : colors.text}
                            >
                                {item.text}
                            </Text>
                        </View>
                        <Text variant="caption" color={colors.textSecondary} style={styles.messageTime}>
                            {item.time}
                        </Text>
                    </View>
                )}
                contentContainerStyle={styles.messageList}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <TouchableOpacity style={styles.attachBtn}>
                        <Ionicons name="add" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                        placeholder="Type a message..."
                        placeholderTextColor={colors.textSecondary}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                    />

                    <TouchableOpacity
                        style={[styles.sendBtn, { backgroundColor: message ? colors.primary : colors.surface }]}
                        disabled={!message}
                    >
                        <Ionicons name="send" size={20} color={message ? '#000' : colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    headerActions: {
        flexDirection: 'row',
    },
    actionIcon: {
        marginLeft: 20,
    },
    messageList: {
        padding: 16,
    },
    messageWrapper: {
        marginBottom: 20,
        maxWidth: '80%',
    },
    myMessageWrapper: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    theirMessageWrapper: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    bubble: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    messageTime: {
        marginTop: 4,
        fontSize: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    },
    attachBtn: {
        padding: 8,
    },
    input: {
        flex: 1,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        marginHorizontal: 8,
        fontSize: 16,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
