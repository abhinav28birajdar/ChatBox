import firestore from '@react-native-firebase/firestore';
import { db, auth } from '@/config/firebase';

export interface Notification {
    id: string;
    userId: string;
    type: 'message' | 'friend_request' | 'server_invite' | 'mention' | 'reaction';
    title: string;
    body: string;
    data: any;
    read: boolean;
    createdAt: any;
}

class NotificationService {
    private collectionName = 'notifications';

    /**
     * Subscribe to user's notifications (excludes deleted)
     */
    subscribeToNotifications(callback: (notifications: Notification[]) => void): () => void {
        const user = auth.currentUser;
        if (!user) return () => { };

        return db.collection(this.collectionName)
            .where('userId', '==', user.uid)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .onSnapshot((snapshot) => {
                const notifications = snapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    .filter((n: any) => !n.deleted) as Notification[];
                callback(notifications);
            }, (err) => {
                console.error('Error in subscribeToNotifications:', err);
            });
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: string): Promise<void> {
        try {
            await db.collection(this.collectionName).doc(notificationId).update({ read: true });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<void> {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const snapshot = await db.collection(this.collectionName)
                .where('userId', '==', user.uid)
                .where('read', '==', false)
                .get();

            const batch = db.batch();
            snapshot.docs.forEach((doc) => {
                batch.update(doc.ref, { read: true });
            });

            await batch.commit();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    /**
     * Delete a notification
     */
    async deleteNotification(notificationId: string): Promise<void> {
        try {
            await db.collection(this.collectionName).doc(notificationId).delete();
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    /**
     * Send a notification to a user
     * In a real app, this would be handled by a Cloud Function
     */
    async sendNotification(receiverId: string, data: Omit<Notification, 'id' | 'createdAt' | 'read' | 'userId'>): Promise<void> {
        try {
            await db.collection(this.collectionName).add({
                ...data,
                userId: receiverId,
                read: false,
                createdAt: firestore.FieldValue.serverTimestamp(),
            });
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }
}

export default new NotificationService();
