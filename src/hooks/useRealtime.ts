import { useState, useEffect } from 'react';
import {
    ref as rtdbRef,
    onValue,
    onDisconnect,
    set,
    remove,
    serverTimestamp as rtdbServerTimestamp
} from 'firebase/database';
import { rtdb } from '../config/firebase';

export function usePresence(uid: string) {
    useEffect(() => {
        if (!uid) return;
        const presenceRef = rtdbRef(rtdb, `presence/${uid}`);
        const connectedRef = rtdbRef(rtdb, '.info/connected');

        // onValue returns an unsubscribe function — must be called on cleanup
        const unsubscribeConnected = onValue(connectedRef, (snap) => {
            if (snap.val()) {
                onDisconnect(presenceRef).set({
                    online: false,
                    lastSeen: rtdbServerTimestamp()
                });
                set(presenceRef, { online: true });
            }
        });

        return () => {
            unsubscribeConnected();
            // Mark user offline immediately on unmount
            set(presenceRef, { online: false, lastSeen: rtdbServerTimestamp() }).catch(() => {});
        };
    }, [uid]);
}

export function useTypingIndicator(conversationId: string, uid: string) {
    const [typingUsers, setTypingUsers] = useState<string[]>([]);

    useEffect(() => {
        if (!conversationId || !uid) return;
        const typingRef = rtdbRef(rtdb, `typing/${conversationId}`);

        const unsubscribe = onValue(typingRef, (snap) => {
            const data = snap.val() || {};
            const activeTypers = Object.keys(data).filter(
                (k) => k !== uid && data[k]?.isTyping && Date.now() - data[k].timestamp < 5000
            );
            setTypingUsers(activeTypers);
        });

        return () => unsubscribe();
    }, [conversationId, uid]);

    return typingUsers;
}
