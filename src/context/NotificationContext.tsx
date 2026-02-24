import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { AppNotification, NotificationType } from '@/types';
import { useAuth } from './AuthContext';
import NotificationService, { Notification } from '@/services/NotificationService';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const lastNotificationId = React.useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      lastNotificationId.current = null;
      return;
    }

    setLoading(true);

    const unsubscribe = NotificationService.subscribeToNotifications((data) => {
      if (data.length > 0) {
        const latest = data[0];

        // Only show toast if it's a new notification and not from the initial fetch
        if (lastNotificationId.current && latest.id !== lastNotificationId.current && !latest.read) {
          Toast.show({
            type: 'info',
            text1: latest.title,
            text2: latest.body,
            onPress: () => {
              // Navigate to notifications screen or relevant item
              router.push('/(tabs)/notifications');
              Toast.hide();
            }
          });
        }
        lastNotificationId.current = latest.id;
      }

      const mapped = data.map(n => ({
        id: n.id,
        userId: n.userId,
        type: n.type as any,
        title: n.title,
        body: n.body,
        isRead: n.read,
        data: n.data,
        createdAt: n.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      }));
      setNotifications(mapped);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.isRead).length,
    [notifications]
  );

  const markAsRead = useCallback(async (id: string) => {
    await NotificationService.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(async () => {
    await NotificationService.markAllAsRead();
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    await NotificationService.deleteNotification(id);
  }, []);

  const clearAll = useCallback(async () => {
    if (!user) return;
    try {
      const { db } = await import('@/config/firebase');
      const snapshot = await db.collection('notifications')
        .where('userId', '==', user.uid)
        .get();
      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    } catch (err) {
      console.error('Error clearing all notifications:', err);
    }
  }, [user]);

  const value = useMemo(() => ({
    notifications, unreadCount,
    markAsRead, markAllAsRead, deleteNotification, clearAll, loading,
  }), [notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll, loading]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}
