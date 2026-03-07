import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

/**
 * Fallback screen shown when navigation reaches an unregistered route.
 * Register it as the fallback in NavigationContainer if needed.
 */
export default function NotFoundScreen() {
    const navigation = useNavigation<any>();

    return (
        <View style={styles.container}>
            <Ionicons name="compass-outline" size={80} color="#6C63FF" />
            <Text style={styles.code}>404</Text>
            <Text style={styles.title}>Page Not Found</Text>
            <Text style={styles.subtitle}>
                This screen doesn&apos;t exist or may have been moved.
            </Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.reset({ index: 0, routes: [{ name: 'MAIN' }] })}
            >
                <Ionicons name="arrow-back-outline" size={18} color="#fff" style={styles.btnIcon} />
                <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0A0A0A',
        paddingHorizontal: 32,
    },
    code: {
        fontSize: 72,
        fontWeight: '900',
        color: '#6C63FF',
        marginTop: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 32,
        lineHeight: 22,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6C63FF',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    btnIcon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
