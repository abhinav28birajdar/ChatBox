import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, Animated, Platform } from 'react-native';
import * as Network from 'expo-network';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

export const OfflineOverlay: React.FC = () => {
    const { colors } = useTheme();
    const [isConnected, setIsConnected] = useState(true);
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        const checkNetwork = async () => {
            const state = await Network.getNetworkStateAsync();
            const connected = !!(state.isConnected && state.isInternetReachable);
            setIsConnected(connected);
        };

        checkNetwork();
        const timer = setInterval(checkNetwork, 5000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: isConnected ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isConnected, fadeAnim]);

    return (
        <Animated.View style={[
            styles.overlay,
            {
                backgroundColor: colors.error,
                opacity: fadeAnim,
                transform: [{
                    translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-100, 0]
                    })
                }]
            }
        ]}>
            <Ionicons name="cloud-offline-outline" size={20} color="#FFFFFF" />
            <Text style={[styles.text, { color: '#FFFFFF' }]}>You're offline. Reconnecting...</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 44 : 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        zIndex: 9999,
    },
    text: {
        marginLeft: 10,
        fontSize: 14,
        fontWeight: '600',
    },
});
