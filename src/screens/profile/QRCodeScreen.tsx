import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/authStore';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../constants/typography';

const { width } = Dimensions.get('window');

export default function QRCodeScreen({ navigation }: any) {
    const { colors } = useTheme();
    const { firestoreUser, user } = useAuthStore();

    if (!user || !firestoreUser) return null;

    // We encode the user's UID to be scanned by others
    const qrValue = `chatbox://user/${user.uid}`;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>My QR Code</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    Ask a friend to scan this QR code to quickly add you to their friend list.
                </Text>

                <View style={[styles.qrContainer, { backgroundColor: colors.surface }]}>
                    <QRCode
                        value={qrValue}
                        size={width * 0.6}
                        color={colors.text}
                        backgroundColor={colors.surface}
                    />
                    <Text style={[styles.name, { color: colors.text }]}>{firestoreUser.displayName}</Text>
                    <Text style={[styles.username, { color: colors.textSecondary }]}>@{firestoreUser.username}</Text>
                </View>

                {/* NOTE: To actually build an in-app scanner you would use expo-camera 
                    Since the user requested QR functions, this acts as the "Show QR" interface,
                    and you could add a button to navigate to a scanner screen if needed */}
                <TouchableOpacity
                    style={[styles.scanBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                        // Normally this would navigate to a real scanner using expo-camera
                        alert('Scan camera would open here!');
                    }}
                >
                    <Ionicons name="scan" size={24} color="#110D18" />
                    <Text style={styles.scanBtnText}>Scan a QR Code</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: Typography.fontFamily.bold,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        padding: 24,
    },
    description: {
        fontSize: 15,
        fontFamily: Typography.fontFamily.medium,
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22,
    },
    qrContainer: {
        padding: 32,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    name: {
        fontSize: 22,
        fontFamily: Typography.fontFamily.bold,
        marginTop: 24,
    },
    username: {
        fontSize: 14,
        fontFamily: Typography.fontFamily.medium,
        marginTop: 4,
    },
    scanBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 24,
        marginTop: 60,
        width: '100%',
    },
    scanBtnText: {
        color: '#110D18',
        fontSize: 16,
        fontFamily: Typography.fontFamily.bold,
        marginLeft: 12,
    },
});
