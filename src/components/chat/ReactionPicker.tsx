import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated as RNAnimated } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { DIMENSIONS } from '../../constants/dimensions';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '👏', '🙌', '🎉', '✅', '❌'];

interface ReactionPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
    visible: boolean;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({ onSelect, onClose, visible }) => {
    const { colors, isDark } = useTheme();

    if (!visible) return null;

    const handleSelect = (emoji: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect(emoji);
        onClose();
    };

    return (
        <View style={styles.overlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
            <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.container}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {EMOJIS.map((emoji) => (
                        <TouchableOpacity
                            key={emoji}
                            style={styles.emojiButton}
                            onPress={() => handleSelect(emoji)}
                        >
                            <Text style={styles.emojiText}>{emoji}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        zIndex: 1000,
    },
    container: {
        borderRadius: DIMENSIONS.borderRadius.xl,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.7)',
        padding: 8,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    scrollContent: {
        paddingHorizontal: 8,
    },
    emojiButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emojiText: {
        fontSize: 28,
    },
});
