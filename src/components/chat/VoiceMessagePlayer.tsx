import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

interface VoiceMessagePlayerProps {
    uri: string;
    duration?: number;
}

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({ uri, duration }) => {
    const { colors, isDark } = useTheme();
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const loadAndPlay = async () => {
        if (isPlaying) {
            await sound?.pauseAsync();
            setIsPlaying(false);
            return;
        }

        if (sound) {
            await sound.playAsync();
            setIsPlaying(true);
            return;
        }

        setIsLoading(true);
        try {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: true },
                onPlaybackStatusUpdate
            );
            setSound(newSound);
            setIsPlaying(true);
        } catch (error) {
            console.error('Error playing voice message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            if (status.durationMillis) {
                setProgress(status.positionMillis / status.durationMillis);
            }
            if (status.didJustFinish) {
                setIsPlaying(false);
                setProgress(0);
                sound?.setPositionAsync(0);
            }
        }
    };

    const formatTime = (millis: number) => {
        const totalSeconds = millis / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.surface : colors.primaryLight }]}>
            <TouchableOpacity onPress={loadAndPlay} disabled={isLoading} style={[styles.playButton, { backgroundColor: colors.primary }]}>
                {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                    <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color="#FFFFFF" />
                )}
            </TouchableOpacity>

            <View style={styles.waveformContainer}>
                <View style={[styles.waveformBackground, { backgroundColor: colors.textMuted, opacity: 0.3 }]} />
                <View style={[styles.waveformProgress, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
            </View>

            <Text style={[styles.duration, { color: colors.textSecondary }]}>
                {duration ? formatTime(duration) : '0:00'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 20,
        minWidth: 200,
    },
    playButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    waveformContainer: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        marginRight: 10,
    },
    waveformBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    waveformProgress: {
        height: '100%',
    },
    duration: {
        fontSize: 12,
        fontVariant: ['tabular-nums'],
    },
});
