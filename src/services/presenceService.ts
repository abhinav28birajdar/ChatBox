import {
    ref as rtdbRef,
    set,
    remove,
    onValue,
    onDisconnect,
    serverTimestamp as rtdbServerTimestamp
} from 'firebase/database';
import { rtdb } from '../config/firebase';

export const presenceService = {
    setTyping: (conversationId: string, uid: string, isTyping: boolean) => {
        const typingRef = rtdbRef(rtdb, `typing/${conversationId}/${uid}`);
        if (isTyping) {
            set(typingRef, { isTyping: true, timestamp: Date.now() });
        } else {
            remove(typingRef);
        }
    },

    subscribeTyping: (conversationId: string, uid: string, onTyping: (users: string[]) => void) => {
        const typingRef = rtdbRef(rtdb, `typing/${conversationId}`);
        return onValue(typingRef, (snap) => {
            const data = snap.val() || {};
            const typingUsers = Object.keys(data).filter(
                (k) => k !== uid && data[k]?.isTyping && Date.now() - data[k].timestamp < 5000
            );
            onTyping(typingUsers);
        });
    },

    subscribePresence: (uid: string, callback: (presence: { isOnline: boolean, lastSeen?: any }) => void) => {
        const presenceRef = rtdbRef(rtdb, `presence/${uid}`);
        return onValue(presenceRef, (snap) => {
            const val = snap.val() || { online: false };
            callback({ isOnline: val.online, lastSeen: val.lastSeen });
        });
    },

    initPresence: (uid: string): (() => void) => {
        const presenceRef = rtdbRef(rtdb, `presence/${uid}`);
        const connectedRef = rtdbRef(rtdb, '.info/connected');

        // onValue returns an unsubscribe function — must be called to avoid leaks
        const unsubscribe = onValue(connectedRef, (snap) => {
            if (snap.val()) {
                onDisconnect(presenceRef).set({
                    online: false,
                    lastSeen: rtdbServerTimestamp()
                });
                set(presenceRef, { online: true });
            }
        });

        // Return the cleanup function so the caller can unsubscribe
        return () => {
            unsubscribe();
            set(presenceRef, { online: false, lastSeen: rtdbServerTimestamp() }).catch(() => {});
        };
    },
};
