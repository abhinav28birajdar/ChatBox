import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ViewStyle } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { DIMENSIONS } from '../../constants/dimensions';
import { Typography } from '../../constants/typography';
import { Video, ResizeMode } from 'expo-av';
import { ImageViewer } from '../common/ImageViewer';

interface MediaMessageProps {
    type: 'image' | 'video' | 'file';
    url: string;
    thumb?: string;
    fileName?: string;
    size?: number;
    style?: ViewStyle;
}

export const MediaMessage: React.FC<MediaMessageProps> = ({ type, url, thumb, fileName, size, style }) => {
    const { colors } = useTheme();
    const [viewerVisible, setViewerVisible] = useState(false);
    const [playVideo, setPlayVideo] = useState(false);

    if (type === 'image') {
        return (
            <>
                <TouchableOpacity onPress={() => setViewerVisible(true)} style={[styles.container, style]}>
                    <Image source={{ uri: url }} style={styles.image} resizeMode="cover" />
                </TouchableOpacity>
                <ImageViewer visible={viewerVisible} imageUrl={url} onClose={() => setViewerVisible(false)} />
            </>
        );
    }

    if (type === 'video') {
        return (
            <View style={[styles.container, styles.videoContainer, style]}>
                {playVideo ? (
                    <Video
                        source={{ uri: url }}
                        rate={1.0}
                        volume={1.0}
                        isMuted={false}
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay
                        useNativeControls
                        style={styles.video}
                        onPlaybackStatusUpdate={(status: any) => {
                            if (status.didJustFinish) setPlayVideo(false);
                        }}
                    />
                ) : (
                    <TouchableOpacity onPress={() => setPlayVideo(true)} style={StyleSheet.absoluteFill}>
                        <Image source={{ uri: thumb || url }} style={styles.image} resizeMode="cover" />
                        <View style={styles.playIconContainer}>
                            <Ionicons name="play" size={40} color="#fff" />
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    if (type === 'file') {
        return (
            <View style={[styles.fileContainer, { backgroundColor: colors.surface }, style]}>
                <View style={[styles.fileIcon, { backgroundColor: colors.primary + '20' }]}>
                    <MaterialCommunityIcons name="file-document-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.fileInfo}>
                    <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>{fileName || 'File'}</Text>
                    {size && <Text style={[styles.fileSize, { color: colors.textSecondary }]}>{(size / 1024 / 1024).toFixed(2)} MB</Text>}
                </View>
                <TouchableOpacity style={styles.downloadButton}>
                    <Ionicons name="download-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
            </View>
        );
    }

    return null;
};

const styles = StyleSheet.create({
    container: {
        width: 250,
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    videoContainer: {
        backgroundColor: '#000',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    playIconContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    fileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        width: 250,
    },
    fileIcon: {
        width: 44,
        height: 44,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: Typography.fontSize.sm,
        fontFamily: Typography.fontFamily.medium,
    },
    fileSize: {
        fontSize: Typography.fontSize.xs,
        fontFamily: Typography.fontFamily.regular,
        marginTop: 2,
    },
    downloadButton: {
        padding: 4,
    },
});
