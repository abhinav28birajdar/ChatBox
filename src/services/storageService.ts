import {
    ref as storageRef,
    uploadBytes,
    getDownloadURL
} from 'firebase/storage';
import { storage } from '../config/firebase';

export const storageService = {
    uploadFile: async (uri: string, uid: string, fileType: string): Promise<string> => {
        try {
            // Use XMLHttpRequest for more robust blob creation in React Native
            const blob: Blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = () => resolve(xhr.response);
                xhr.onerror = (e) => reject(new TypeError('Network request failed'));
                xhr.responseType = 'blob';
                xhr.open('GET', uri, true);
                xhr.send(null);
            });

            if (!blob || blob.size === 0) {
                throw new Error('Created blob is empty or invalid.');
            }

            // Determine content type from uri if possible, default to image/jpeg
            const metadata = {
                contentType: 'image/jpeg', // Default for profile photos
            };

            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
            const fileRef = storageRef(storage, `users/${uid}/${fileType}/${fileName}`);

            console.log(`Starting upload to: ${fileRef.fullPath}`);
            await uploadBytes(fileRef, blob, metadata);

            if ((blob as any).close) (blob as any).close();

            const downloadURL = await getDownloadURL(fileRef);
            return downloadURL;
        } catch (error: any) {
            console.error('Full upload error details:', JSON.stringify(error, null, 2));
            throw error;
        }
    },

    uploadProfilePhoto: async (path: string, uid: string): Promise<string> => {
        return storageService.uploadFile(path, uid, 'profile');
    },

    uploadMessageMedia: async (path: string, uid: string): Promise<string> => {
        return storageService.uploadFile(path, uid, 'messages');
    },
};
