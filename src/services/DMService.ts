import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { db, auth } from '@/config/firebase';
import { Message, SendMessageData } from './MessageService';
import UserService from './UserService';

export interface DirectMessage {
    id: string;
    participants: string[];
    isGroup: boolean;
    name?: string;
    icon?: string;
    createdAt: any;
    lastMessageAt: any;
    lastMessage?: {
        content: string;
        authorId: string;
        createdAt: any;
    };
}

class DMService {
    /**
     * Create direct message conversation
     */
    async createDM(participantIds: string[], isGroup: boolean = false, name?: string): Promise<string> {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('Not authenticated');

            // Add current user to participants if not already included
            if (!participantIds.includes(userId)) {
                participantIds.push(userId);
            }

            // Check if DM already exists (for 1-on-1)
            if (!isGroup && participantIds.length === 2) {
                const existing = await this.findExistingDM(participantIds);
                if (existing) {
                    return existing.id;
                }
            }

            const dmRef = await db.collection('directMessages').add({
                participants: participantIds,
                isGroup,
                name: name || null,
                icon: null,
                createdAt: firestore.FieldValue.serverTimestamp(),
                lastMessageAt: firestore.FieldValue.serverTimestamp(),
            });

            return dmRef.id;
        } catch (error) {
            console.error('Error creating DM:', error);
            throw error;
        }
    }

    /**
     * Get user's DMs
     */
    async getDMs(): Promise<DirectMessage[]> {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('Not authenticated');

            const snapshot = await db.collection('directMessages')
                .where('participants', 'array-contains', userId)
                .orderBy('lastMessageAt', 'desc')
                .get();

            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as DirectMessage[];
        } catch (error) {
            console.error('Error getting DMs:', error);
            throw error;
        }
    }

    /**
     * Subscribe to DMs in real-time
     */
    subscribeToDMs(callback: (dms: DirectMessage[]) => void): () => void {
        const userId = auth.currentUser?.uid;
        if (!userId) return () => {};

        return db.collection('directMessages')
            .where('participants', 'array-contains', userId)
            .orderBy('lastMessageAt', 'desc')
            .onSnapshot((snapshot) => {
                const dms = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as DirectMessage[];

                callback(dms);
            }, (err) => {
                console.error('Error in subscribeToDMs:', err);
            });
    }

    /**
     * Send DM message
     */
    async sendDMMessage(dmId: string, messageData: SendMessageData): Promise<string> {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('Not authenticated');

            // Get user profile for denormalization
            const userProfile = await UserService.getProfile(userId);

            const messageRef = await db.collection('directMessages').doc(dmId).collection('messages').add({
                content: messageData.content,
                authorId: userId,
                authorName: userProfile?.displayName || 'User',
                authorAvatar: userProfile?.avatar || null,
                attachments: messageData.attachments || [],
                embeds: [],
                mentions: [],
                reactions: {},
                edited: false,
                pinned: false,
                replyTo: messageData.replyTo || null,
                createdAt: firestore.FieldValue.serverTimestamp(),
            });

            // Update DM's lastMessage and lastMessageAt
            await db.collection('directMessages').doc(dmId).update({
                lastMessage: {
                    content: messageData.content,
                    authorId: userId,
                    createdAt: firestore.FieldValue.serverTimestamp(),
                },
                lastMessageAt: firestore.FieldValue.serverTimestamp(),
            });

            return messageRef.id;
        } catch (error) {
            console.error('Error sending DM message:', error);
            throw error;
        }
    }

    /**
     * Get DM messages
     */
    async getDMMessages(
        dmId: string,
        limitCount: number = 50,
        lastDoc?: FirebaseFirestoreTypes.DocumentSnapshot
    ): Promise<{ messages: Message[]; lastDoc: FirebaseFirestoreTypes.DocumentSnapshot | null }> {
        try {
            let q = db.collection('directMessages').doc(dmId).collection('messages')
                .orderBy('createdAt', 'desc')
                .limit(limitCount);

            if (lastDoc) {
                q = q.startAfter(lastDoc);
            }

            const snapshot = await q.get();
            const messages = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Message[];

            return {
                messages: messages,
                lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
            };
        } catch (error) {
            console.error('Error getting DM messages:', error);
            throw error;
        }
    }

    /**
     * Subscribe to DM messages in real-time
     */
    subscribeToDMMessages(
        dmId: string,
        limitCount: number = 50,
        callback: (messages: Message[]) => void
    ): () => void {
        return db.collection('directMessages').doc(dmId).collection('messages')
            .orderBy('createdAt', 'desc')
            .limit(limitCount)
            .onSnapshot((snapshot) => {
                const messages = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Message[];

                callback(messages);
            }, (error) => {
                console.error('Error in subscribeToDMMessages:', error);
            });
    }

    /**
     * Leave DM (group only)
     */
    async leaveDM(dmId: string): Promise<void> {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('Not authenticated');

            const dmDoc = await db.collection('directMessages').doc(dmId).get();

            if (!dmDoc.exists) {
                throw new Error('DM not found');
            }

            const dmData = dmDoc.data()!;

            if (!dmData.isGroup) {
                throw new Error('Cannot leave 1-on-1 DM');
            }

            const participants = dmData.participants.filter((id: string) => id !== userId);

            await db.collection('directMessages').doc(dmId).update({
                participants,
            });
        } catch (error) {
            console.error('Error leaving DM:', error);
            throw error;
        }
    }

    /**
     * Delete a DM message
     */
    async deleteMessage(dmId: string, messageId: string): Promise<void> {
        try {
            await db.collection('directMessages').doc(dmId).collection('messages').doc(messageId).delete();
        } catch (error) {
            console.error('Error deleting DM message:', error);
            throw error;
        }
    }

    /**
     * Find existing DM between users
     */
    private async findExistingDM(participantIds: string[]): Promise<DirectMessage | null> {
        try {
            const sortedIds = [...participantIds].sort();

            // This is a workaround since we can't query by sorted array easily without specific structure
            // For now, check most recent DMs or query by one participant and filter
            // Ideally, store a "participantsHash" or similar unique key

            // Alternative: use composite key for 1-on-1: concat(sort(ids))
            // But we use auto-id.

            // Let's rely on client-side check if list isn't huge, or improved query
            // Current implement checks exact match which is flaky if order varies.

            const snapshot = await db.collection('directMessages')
                .where('participants', 'array-contains', participantIds[0])
                .where('isGroup', '==', false)
                .get();

            const existing = snapshot.docs.find(doc => {
                const data = doc.data();
                const p = data.participants as string[];
                return p.length === participantIds.length && p.every(id => participantIds.includes(id));
            });

            if (existing) {
                return { id: existing.id, ...existing.data() } as DirectMessage;
            }

            return null;
        } catch (error) {
            return null;
        }
    }
}

export default new DMService();
