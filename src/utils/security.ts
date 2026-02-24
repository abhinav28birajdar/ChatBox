import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const SecurityService = {
    /**
     * Securely store data
     */
    async setSecureItem(key: string, value: string): Promise<void> {
        try {
            await SecureStore.setItemAsync(key, value, {
                keychainAccessibility: SecureStore.WHEN_UNLOCKED,
            });
        } catch (error) {
            console.error('SecurityService: Failed to set secure item', error);
        }
    },

    /**
     * Securely retrieve data
     */
    async getSecureItem(key: string): Promise<string | null> {
        try {
            return await SecureStore.getItemAsync(key);
        } catch (error) {
            console.error('SecurityService: Failed to get secure item', error);
            return null;
        }
    },

    /**
     * Delete secure data
     */
    async deleteSecureItem(key: string): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (error) {
            console.error('SecurityService: Failed to delete secure item', error);
        }
    },

    /**
     * Simple input validation for production
     */
    validateInput(input: string, type: 'email' | 'password' | 'username'): boolean {
        switch (type) {
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
            case 'password':
                return input.length >= 8;
            case 'username':
                return /^[a-zA-Z0-9_]{3,20}$/.test(input);
            default:
                return true;
        }
    },

    /**
     * Sanitize error messages for production (avoid leaking DB details)
     */
    sanitizeError(error: any): string {
        const msg = error.message || String(error);
        if (msg.includes('Firebase') || msg.includes('Firestore')) {
            return 'A database error occurred. Please try again later.';
        }
        if (msg.includes('network')) {
            return 'Network connection lost. Please check your internet.';
        }
        return msg;
    }
};
