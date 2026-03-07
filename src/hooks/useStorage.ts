import { useState } from 'react';
import {
    ref as storageRef,
    uploadBytesResumable,
    getDownloadURL,
    uploadBytes,
    deleteObject
} from 'firebase/storage';
import { storage } from '../config/firebase';

export function useStorage() {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    const uploadFile = async (path: string, uri: string): Promise<string> => {
        setUploading(true);
        const fileName = uri.split('/').pop();
        const fullPath = `${path}/${fileName}`;
        const sRef = storageRef(storage, fullPath);

        const response = await fetch(uri);
        const blob = await response.blob();

        const uploadTask = uploadBytesResumable(sRef, blob);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    setUploading(false);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setUploading(false);
                    resolve(downloadURL);
                }
            );
        });
    };

    const deleteFile = async (path: string) => {
        const sRef = storageRef(storage, path);
        await deleteObject(sRef);
    };

    return { uploadFile, deleteFile, uploadProgress, uploading };
}
