/**
 * Notifications Service
 * Handles push notifications with Expo Notifications
 */

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationsService {
  private expoPushToken: string | null = null;

  /**
   * Request notification permissions and get push token
   */
  async initialize(): Promise<string | null> {
    if (!Device.isDevice) {
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return null;
      }

      // Get the token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });

      this.expoPushToken = token.data;

      // Configure Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#007AFF',
        });

        await Notifications.setNotificationChannelAsync('messages', {
          name: 'Messages',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#007AFF',
          sound: 'default',
        });
      }

      return this.expoPushToken;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get current push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: trigger ?? null,
    });
  }

  /**
   * Show immediate notification
   */
  async showNotification(
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> {
    await this.scheduleLocalNotification(title, body, data, null);
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Clear badge count
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Add notification received listener
   */
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Add notification response listener (when user taps notification)
   */
  addNotificationResponseListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Remove listener
   */
  removeNotificationSubscription(subscription: Notifications.Subscription): void {
    Notifications.removeNotificationSubscription(subscription);
  }

  // Helper methods for common notification types
  async notifyNewMessage(senderName: string, message: string, chatId: string): Promise<void> {
    await this.showNotification(senderName, message, {
      type: 'message',
      chatId,
    });
  }

  async notifyMention(mentionedBy: string, chatName: string, chatId: string): Promise<void> {
    await this.showNotification(
      'Mentioned',
      `${mentionedBy} mentioned you in ${chatName}`,
      {
        type: 'mention',
        chatId,
      }
    );
  }

  async notifyChatInvite(inviterName: string, chatName: string, chatId: string): Promise<void> {
    await this.showNotification(
      'Chat Invitation',
      `${inviterName} invited you to ${chatName}`,
      {
        type: 'chat_invite',
        chatId,
      }
    );
  }
}

export const notificationsService = new NotificationsService();
