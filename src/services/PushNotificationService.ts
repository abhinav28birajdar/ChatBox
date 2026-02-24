import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { db, auth } from '@/config/firebase';
import { setItem, getItem, StorageKeys } from '@/utils/storage';

/**
 * Push Notification Service
 * Handles FCM token registration and notification channel setup
 */
class PushNotificationService {
    private initialized = false;

    /**
     * Initialize notification handlers and channels
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;

        // Set notification handler for foreground notifications
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });

        // Create notification channel for Android
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Default',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#D4FF00',
                sound: 'default',
            });

            await Notifications.setNotificationChannelAsync('messages', {
                name: 'Messages',
                description: 'New message notifications',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                sound: 'default',
            });

            await Notifications.setNotificationChannelAsync('social', {
                name: 'Social',
                description: 'Friend requests and mentions',
                importance: Notifications.AndroidImportance.DEFAULT,
                sound: 'default',
            });
        }

        this.initialized = true;
    }

    /**
     * Request notification permissions and register token
     */
    async registerForPushNotifications(): Promise<string | null> {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.warn('Push notification permission not granted');
                return null;
            }

            // Get the Expo push token
            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId: undefined, // Uses the project ID from app.config.js
            });

            const token = tokenData.data;

            // Save token locally
            await setItem(StorageKeys.NOTIFICATION_TOKEN, token);

            // Save token to Firestore for the current user
            await this.saveTokenToFirestore(token);

            return token;
        } catch (error) {
            console.error('Error registering for push notifications:', error);
            return null;
        }
    }

    /**
     * Save push token to Firestore user document
     */
    private async saveTokenToFirestore(token: string): Promise<void> {
        try {
            const user = auth.currentUser;
            if (!user) return;

            await db.collection('users').doc(user.uid).update({
                pushTokens: (await import('@react-native-firebase/firestore')).default.FieldValue.arrayUnion(token),
                lastTokenUpdate: (await import('@react-native-firebase/firestore')).default.FieldValue.serverTimestamp(),
            });
        } catch (error) {
            console.error('Error saving push token to Firestore:', error);
        }
    }

    /**
     * Remove push token on logout
     */
    async unregisterPushToken(): Promise<void> {
        try {
            const token = await getItem<string>(StorageKeys.NOTIFICATION_TOKEN);
            if (!token) return;

            const user = auth.currentUser;
            if (user) {
                await db.collection('users').doc(user.uid).update({
                    pushTokens: (await import('@react-native-firebase/firestore')).default.FieldValue.arrayRemove(token),
                });
            }

            await setItem(StorageKeys.NOTIFICATION_TOKEN, null);
        } catch (error) {
            console.error('Error unregistering push token:', error);
        }
    }

    /**
     * Get badge count
     */
    async getBadgeCount(): Promise<number> {
        return await Notifications.getBadgeCountAsync();
    }

    /**
     * Set badge count
     */
    async setBadgeCount(count: number): Promise<void> {
        await Notifications.setBadgeCountAsync(count);
    }

    /**
     * Schedule a local notification
     */
    async scheduleLocalNotification(
        title: string,
        body: string,
        data?: Record<string, any>,
        seconds: number = 1
    ): Promise<string> {
        return await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: 'default',
            },
            trigger: seconds > 0 ? { seconds, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL } : null,
        });
    }

    /**
     * Cancel all scheduled notifications
     */
    async cancelAllScheduled(): Promise<void> {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }
}

export default new PushNotificationService();
