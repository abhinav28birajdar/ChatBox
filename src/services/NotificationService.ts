import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import {
    doc,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    limit,
    where,
    onSnapshot,
    getDocs,
    writeBatch,
    serverTimestamp,
    arrayUnion,
    Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Platform } from 'react-native';
import { NotificationItem } from '../types/notification';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});


export const notificationService = {
    // ─── Push Token Registration ────────────────────────────────
    registerForPushNotifications: async (uid: string): Promise<string | null> => {
        try {
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#6C63FF',
                });
            }

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                return null;
            }

            const token = (await Notifications.getExpoPushTokenAsync({
                projectId: Constants.expoConfig?.extra?.eas?.projectId,
            })).data;

            // Persist token to Firestore
            await updateDoc(doc(db, 'users', uid), {
                pushToken: token,
                fcmTokens: arrayUnion(token),
            });

            return token;
        } catch (error) {
            console.error('Error registering for push notifications:', error);
            return null;
        }
    },

    // ─── Firestore Notification CRUD ────────────────────────────

    /** Real-time listener for a user's notifications (subcollection). */
    subscribeToNotifications: (
        uid: string,
        callback: (notifications: NotificationItem[]) => void
    ): Unsubscribe => {
        const q = query(
            collection(db, 'users', uid, 'notifications'),
            orderBy('createdAt', 'desc'),
            limit(50)
        );
        return onSnapshot(q, (snap) => {
            const notifications = snap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            } as NotificationItem));
            callback(notifications);
        });
    },

    /** Create a notification document for a user. */
    createNotification: async (
        uid: string,
        notification: Omit<NotificationItem, 'id' | 'createdAt'>
    ): Promise<void> => {
        await addDoc(collection(db, 'users', uid, 'notifications'), {
            ...notification,
            createdAt: serverTimestamp(),
        });
    },

    /** Mark a single notification as read. */
    markAsRead: async (uid: string, notificationId: string): Promise<void> => {
        await updateDoc(
            doc(db, 'users', uid, 'notifications', notificationId),
            { isRead: true }
        );
    },

    /** Batch-mark all unread notifications as read. */
    markAllAsRead: async (uid: string): Promise<void> => {
        const q = query(
            collection(db, 'users', uid, 'notifications'),
            where('isRead', '==', false)
        );
        const snap = await getDocs(q);
        if (snap.empty) return;
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.update(d.ref, { isRead: true }));
        await batch.commit();
    },

    /** Delete a single notification. */
    deleteNotification: async (uid: string, notificationId: string): Promise<void> => {
        await deleteDoc(doc(db, 'users', uid, 'notifications', notificationId));
    },

    // ─── Expo Push API ──────────────────────────────────────────
    sendPushNotification: async (
        expoPushToken: string,
        title: string,
        body: string,
        data: Record<string, unknown> = {}
    ): Promise<void> => {
        const message = {
            to: expoPushToken,
            sound: 'default',
            title,
            body,
            data,
        };

        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
    },
};
