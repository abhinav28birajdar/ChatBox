import {
    collection,
    doc,
    query,
    orderBy,
    limitToLast,
    onSnapshot,
    addDoc,
    updateDoc,
    getDoc,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    where,
    FieldValue,
    getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Message, Conversation } from '../types/message';

export const messageService = {
    subscribeToMessages: (conversationId: string, callback: (msgs: Message[]) => void) => {
        const q = query(
            collection(db, 'conversations', conversationId, 'messages'),
            orderBy('createdAt', 'asc'),
            limitToLast(50)
        );
        return onSnapshot(q, (snap) => {
            const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message));
            callback(msgs);
        });
    },

    sendMessage: async (conversationId: string, message: Partial<Message>) => {
        const messageDoc = {
            ...message,
            createdAt: serverTimestamp(),
            reactions: {},
            readBy: [message.senderId],
        };

        await addDoc(collection(db, 'conversations', conversationId, 'messages'), messageDoc);

        // Update conversation last message
        await updateDoc(doc(db, 'conversations', conversationId), {
            lastMessage: {
                text: message.type === 'text' ? message.text : `Sent an ${message.type}`,
                senderId: message.senderId,
                timestamp: serverTimestamp(),
            },
            updatedAt: serverTimestamp(),
        });
    },

    toggleReaction: async (conversationId: string, messageId: string, uid: string, emoji: string) => {
        const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
        const snap = await getDoc(msgRef);
        if (!snap.exists()) return;

        const reactions = snap.data()?.reactions || {};
        const current: string[] = reactions[emoji] || [];
        const updated = current.includes(uid)
            ? current.filter((u) => u !== uid)
            : [...current, uid];

        await updateDoc(msgRef, { [`reactions.${emoji}`]: updated });
    },

    markAsRead: async (conversationId: string, messageId: string, uid: string) => {
        const msgRef = doc(db, 'conversations', conversationId, 'messages', messageId);
        await updateDoc(msgRef, { readBy: arrayUnion(uid) });
    },

    getConversations: (uid: string, callback: (convs: Conversation[]) => void) => {
        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', uid)
        );
        return onSnapshot(q, (snap) => {
            const convs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
            // Sort client-side to avoid needing composite index
            convs.sort((a, b) => {
                const aTime = a.updatedAt?.toMillis() || 0;
                const bTime = b.updatedAt?.toMillis() || 0;
                return bTime - aTime;
            });
            callback(convs);
        }, (error) => {
            console.warn("Conversations fetch error:", error);
            callback([]); // fallback to unblock UI
        });
    },

    getOrCreateConversation: async (uid1: string, uid2: string): Promise<string> => {
        const q = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', uid1)
        );
        const snap = await getDocs(q);
        const existing = snap.docs.find(d => d.data().participants.includes(uid2));
        if (existing) return existing.id;

        const docRef = await addDoc(collection(db, 'conversations'), {
            participants: [uid1, uid2],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastMessage: null
        });
        return docRef.id;
    },
};
