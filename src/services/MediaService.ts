import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { storage } from '@/config/firebase';

export interface PickedImage {
    uri: string;
    width: number;
    height: number;
    type: string;
}

export interface PickedFile {
    uri: string;
    name: string;
    size: number;
    mimeType: string;
}

class MediaService {
    /**
     * Pick image from camera
     */
    async pickImageFromCamera(): Promise<PickedImage | null> {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();

            if (!permission.granted) {
                throw new Error('Camera permission denied');
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                return {
                    uri: result.assets[0].uri,
                    width: result.assets[0].width,
                    height: result.assets[0].height,
                    type: 'image',
                };
            }

            return null;
        } catch (error) {
            console.error('Error picking image from camera:', error);
            throw error;
        }
    }

    /**
     * Pick image from gallery
     */
    async pickImageFromGallery(allowsMultiple: boolean = false): Promise<PickedImage[]> {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                throw new Error('Media library permission denied');
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: allowsMultiple,
                quality: 0.8,
            });

            if (!result.canceled) {
                return result.assets.map((asset) => ({
                    uri: asset.uri,
                    width: asset.width,
                    height: asset.height,
                    type: 'image',
                }));
            }

            return [];
        } catch (error) {
            console.error('Error picking image from gallery:', error);
            throw error;
        }
    }

    /**
     * Pick document/file
     */
    async pickDocument(): Promise<PickedFile | null> {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets[0]) {
                return {
                    uri: result.assets[0].uri,
                    name: result.assets[0].name,
                    size: result.assets[0].size || 0,
                    mimeType: result.assets[0].mimeType || 'application/octet-stream',
                };
            }

            return null;
        } catch (error) {
            console.error('Error picking document:', error);
            throw error;
        }
    }

    /**
     * Compress image
     */
    async compressImage(uri: string, quality: number = 0.7): Promise<string> {
        try {
            const manipResult = await manipulateAsync(
                uri,
                [{ resize: { width: 1024 } }],
                { compress: quality, format: SaveFormat.JPEG }
            );

            return manipResult.uri;
        } catch (error) {
            console.error('Error compressing image:', error);
            return uri; // Return original if compression fails
        }
    }

    /**
     * Upload image to Firebase Storage
     */
    async uploadImage(uri: string, path: string): Promise<string> {
        try {
            // Compress image first
            const compressedUri = await this.compressImage(uri);

            // React Native Firebase putFile accepts the local URI directly
            // On iOS/Android, we need to strip the "file://" prefix in some cases, 
            // but RN Firebase usually handles it.
            const reference = storage.ref(path);
            await reference.putFile(compressedUri);

            // Get download URL
            const downloadURL = await reference.getDownloadURL();

            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    /**
     * Upload file to Firebase Storage
     */
    async uploadFile(uri: string, path: string): Promise<string> {
        try {
            const reference = storage.ref(path);
            await reference.putFile(uri);

            const downloadURL = await reference.getDownloadURL();

            return downloadURL;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    /**
     * Delete file from Firebase Storage
     */
    async deleteFile(path: string): Promise<void> {
        try {
            const reference = storage.ref(path);
            await reference.delete();
        } catch (error: any) {
            console.error('Error deleting file:', error);
            // Don't throw if file doesn't exist (likely already deleted or moved)
            if (error.code !== 'storage/object-not-found') {
                throw error;
            }
        }
    }

    /**
     * Get file size in MB
     */
    getFileSizeMB(bytes: number): number {
        return bytes / (1024 * 1024);
    }

    /**
     * Validate file size
     */
    validateFileSize(bytes: number, maxMB: number = 25): boolean {
        return this.getFileSizeMB(bytes) <= maxMB;
    }

    /**
     * Get file extension
     */
    getFileExtension(filename: string): string {
        return filename.split('.').pop()?.toLowerCase() || '';
    }

    /**
     * Get file icon name based on extension
     */
    getFileIcon(filename: string): string {
        const ext = this.getFileExtension(filename);

        const iconMap: Record<string, string> = {
            // Documents
            pdf: 'document-text',
            doc: 'document-text',
            docx: 'document-text',
            txt: 'document-text',

            // Spreadsheets
            xls: 'grid',
            xlsx: 'grid',
            csv: 'grid',

            // Presentations
            ppt: 'easel',
            pptx: 'easel',

            // Archives
            zip: 'archive',
            rar: 'archive',
            '7z': 'archive',

            // Images
            jpg: 'image',
            jpeg: 'image',
            png: 'image',
            gif: 'image',
            svg: 'image',

            // Videos
            mp4: 'videocam',
            mov: 'videocam',
            avi: 'videocam',

            // Audio
            mp3: 'musical-notes',
            wav: 'musical-notes',
            m4a: 'musical-notes',
        };

        return iconMap[ext] || 'document';
    }
}

export default new MediaService();
