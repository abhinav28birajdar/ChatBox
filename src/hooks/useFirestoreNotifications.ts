import { useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { useNotificationStore } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';

/**
 * Subscribes to the authenticated user's notification subcollection and
 * keeps the Zustand notification store in sync in real-time.
 *
 * Mount this hook once near the top of the authenticated tree (e.g. inside
 * AuthProvider or AppContent), so the badge counter is always current.
 */
export function useFirestoreNotifications(): void {
    const { user } = useAuthStore();
    const { setNotifications } = useNotificationStore();

    useEffect(() => {
        if (!user?.uid) return;

        const unsubscribe = notificationService.subscribeToNotifications(
            user.uid,
            (notifications) => {
                setNotifications(notifications);
            }
        );

        return () => unsubscribe();
    }, [user?.uid, setNotifications]);
}
