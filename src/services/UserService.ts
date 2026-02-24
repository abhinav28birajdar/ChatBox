import firestore from '@react-native-firebase/firestore';
import { db, auth } from '@/config/firebase';
import { UserProfile } from '@/types';
import MediaService from './MediaService';

class UserService {
    /**
     * Update user profile data
     */
    async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
        try {
            const userRef = db.collection('users').doc(userId);

            // Filter out fields that shouldn't be updated directly
            const updates: any = { ...data };
            delete updates.email;
            delete updates.uid;
            delete updates.id;
            delete updates.createdAt;

            await userRef.update({
                ...updates,
                updatedAt: firestore.FieldValue.serverTimestamp(),
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    /**
     * Update user settings (merges nested fields using dot notation)
     */
    async updateSettings(userId: string, settings: Partial<UserProfile['settings']>): Promise<void> {
        try {
            const userRef = db.collection('users').doc(userId);
            // Use dot notation to merge nested settings instead of overwriting
            const updates: Record<string, any> = {
                updatedAt: firestore.FieldValue.serverTimestamp(),
            };
            if (settings?.privacy) {
                Object.entries(settings.privacy).forEach(([key, value]) => {
                    updates[`settings.privacy.${key}`] = value;
                });
            }
            if (settings?.notifications) {
                Object.entries(settings.notifications).forEach(([key, value]) => {
                    updates[`settings.notifications.${key}`] = value;
                });
            }
            await userRef.update(updates);
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    }

    /**
     * Update profile avatar
     */
    async updateAvatar(userId: string, uri: string): Promise<string> {
        try {
            const path = `users/${userId}/avatar.jpg`;
            const downloadUrl = await MediaService.uploadImage(uri, path);

            await this.updateProfile(userId, { avatar: downloadUrl } as any);
            return downloadUrl;
        } catch (error) {
            console.error('Error updating avatar:', error);
            throw error;
        }
    }

    /**
     * Update profile banner
     */
    async updateBanner(userId: string, uri: string): Promise<string> {
        try {
            const path = `users/${userId}/banner.jpg`;
            const downloadUrl = await MediaService.uploadImage(uri, path);

            await this.updateProfile(userId, { banner: downloadUrl } as any);
            return downloadUrl;
        } catch (error) {
            console.error('Error updating banner:', error);
            throw error;
        }
    }

    /**
     * Delete user account and data
     */
    async deleteAccount(userId: string): Promise<void> {
        try {
            await db.collection('users').doc(userId).delete();

            const user = auth.currentUser;
            if (user) {
                await user.delete();
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            throw error;
        }
    }

    /**
     * Get user profile by ID
     */
    async getProfile(userId: string): Promise<UserProfile | null> {
        try {
            const doc = await db.collection('users').doc(userId).get();
            if (doc.exists) {
                return doc.data() as UserProfile;
            }
            return null;
        } catch (error) {
            console.error('Error getting profile:', error);
            throw error;
        }
    }

    /**
     * Get user by username
     */
    async getUserByUsername(username: string): Promise<UserProfile | null> {
        try {
            const snapshot = await db.collection('users')
                .where('username', '==', username.toLowerCase())
                .limit(1)
                .get();

            if (!snapshot.empty) {
                return snapshot.docs[0].data() as UserProfile;
            }
            return null;
        } catch (error) {
            console.error('Error getting user by username:', error);
            throw error;
        }
    }

    /**
     * Search users by username or display name
     */
    async searchUsers(query: string): Promise<UserProfile[]> {
        try {
            const q = query.toLowerCase();
            const snapshot = await db.collection('users')
                .where('username', '>=', q)
                .where('username', '<=', q + '\uf8ff')
                .limit(20)
                .get();

            return snapshot.docs.map(doc => doc.data() as UserProfile);
        } catch (error) {
            console.error('Error searching users:', error);
            throw error;
        }
    }
}

export default new UserService();
