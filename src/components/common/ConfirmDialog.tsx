import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { DIMENSIONS } from '../../constants/dimensions';
import { Typography } from '../../constants/typography';
import { BlurView } from 'expo-blur';

interface ConfirmDialogProps {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmColor?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    confirmColor
}) => {
    const { colors, isDark } = useTheme();

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onCancel} activeOpacity={1} />
                <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
                    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                    <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
                    <View style={styles.actions}>
                        <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onCancel}>
                            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>{cancelLabel}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.confirm,
                                { backgroundColor: confirmColor || colors.primary }
                            ]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmText}>{confirmLabel}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    container: {
        width: '100%',
        borderRadius: DIMENSIONS.borderRadius.lg,
        padding: 24,
        overflow: 'hidden',
    },
    title: {
        fontSize: Typography.fontSize.xl,
        fontFamily: Typography.fontFamily.bold,
        marginBottom: 12,
    },
    message: {
        fontSize: Typography.fontSize.md,
        fontFamily: Typography.fontFamily.regular,
        marginBottom: 24,
        lineHeight: 22,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginLeft: 12,
        minWidth: 80,
        alignItems: 'center',
    },
    cancel: {
        backgroundColor: 'transparent',
    },
    confirm: {
        backgroundColor: '#6C63FF',
    },
    cancelText: {
        fontWeight: '600',
    },
    confirmText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
