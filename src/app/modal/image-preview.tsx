import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions, Alert, Share, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Spacing } from '@/constants/Spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ImagePreviewModal() {
    const { colors } = useTheme();
    const router = useRouter();
    const { uri, senderName, timestamp } = useLocalSearchParams<{
        uri: string; senderName?: string; timestamp?: string;
    }>();

    const [loading, setLoading] = useState(true);

    const handleShare = async () => {
        try {
            await Share.share({ url: uri, message: 'Shared from ChatBox' });
        } catch {
            Alert.alert('Error', 'Could not share image');
        }
    };

    const handleDownload = () => {
        Alert.alert('Saved', 'Image saved to your gallery.');
    };

    return (
        <View style={styles.container}>
            <BlurView intensity={95} style={StyleSheet.absoluteFill} tint="dark" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="close" size={26} color="#FFF" />
                </TouchableOpacity>

                <View style={{ flex: 1, marginHorizontal: Spacing.md }}>
                    {senderName && (
                        <Text variant="subtitle2" color="#fff" align="center">{senderName}</Text>
                    )}
                    {timestamp && (
                        <Text variant="caption" color="rgba(255,255,255,0.6)" align="center">{timestamp}</Text>
                    )}
                </View>

                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={styles.headerBtn} onPress={handleDownload}>
                        <Ionicons name="download-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.headerBtn, { marginLeft: Spacing.sm }]} onPress={handleShare}>
                        <Ionicons name="share-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.imageContainer}>
                {loading && (
                    <ActivityIndicator size="large" color={colors.primary} style={StyleSheet.absoluteFill} />
                )}
                <Image
                    source={{ uri: uri || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97' }}
                    style={styles.image}
                    resizeMode="contain"
                    onLoadEnd={() => setLoading(false)}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 56,
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
        zIndex: 10,
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.7,
    },
});
