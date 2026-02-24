import firestore from '@react-native-firebase/firestore';
import { db, auth } from '@/config/firebase';

export interface Friendship {
    id: string;
    userId: string;
    friendId: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: any;
    acceptedAt?: any;
    senderId?: string; // Alias for userId
    receiverId?: string; // Alias for friendId
    senderName?: string;
    senderAvatar?: string;
    receiverName?: string;
    receiverAvatar?: string;
}

class FriendService {
    /**
     * Send friend request
     */
    async sendFriendRequest(toUserId: string): Promise<string> {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('Not authenticated');

            if (userId === toUserId) {
                throw new Error('Cannot send friend request to yourself');
            }

            // Check if friendship already exists
            const existing = await this.getFriendship(userId, toUserId);
            if (existing) {
                throw new Error('Friend request already exists');
            }

            // Create friendship document
            const res = await db.collection('friendships').add({
                userId,
                friendId: toUserId,
                status: 'pending',
                createdAt: firestore.FieldValue.serverTimestamp(),
            });

            return res.id;
        } catch (error) {
            console.error('Error sending friend request:', error);
            throw error;
        }
    }

    /**
     * Accept friend request
     */
    async acceptFriendRequest(friendshipId: string): Promise<void> {
        try {
            const friendshipRef = db.collection('friendships').doc(friendshipId);
            const friendshipDoc = await friendshipRef.get();

            if (!friendshipDoc.exists) {
                throw new Error('Friend request not found');
            }

            await friendshipRef.update({
                status: 'accepted',
                acceptedAt: firestore.FieldValue.serverTimestamp(),
            });
        } catch (error) {
            console.error('Error accepting friend request:', error);
            throw error;
        }
    }

    /**
     * Decline friend request
     */
    async declineFriendRequest(friendshipId: string): Promise<void> {
        try {
            await db.collection('friendships').doc(friendshipId).delete();
        } catch (error) {
            console.error('Error declining friend request:', error);
            throw error;
        }
    }

    /**
     * Remove friend
     */
    async removeFriend(friendshipId: string): Promise<void> {
        try {
            await db.collection('friendships').doc(friendshipId).delete();
        } catch (error) {
            console.error('Error removing friend:', error);
            throw error;
        }
    }

    /**
     * Get friends
     */
    async getFriends(userId?: string): Promise<Friendship[]> {
        try {
            const currentUserId = userId || auth.currentUser?.uid;
            if (!currentUserId) throw new Error('Not authenticated');

            const [snapshot1, snapshot2] = await Promise.all([
                db.collection('friendships')
                    .where('userId', '==', currentUserId)
                    .where('status', '==', 'accepted')
                    .get(),
                db.collection('friendships')
                    .where('friendId', '==', currentUserId)
                    .where('status', '==', 'accepted')
                    .get()
            ]);

            const friends = [
                ...snapshot1.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
                ...snapshot2.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
            ] as Friendship[];

            return friends;
        } catch (error) {
            console.error('Error getting friends:', error);
            throw error;
        }
    }

    /**
     * Get sent friend requests
     */
    async getSentRequests(): Promise<Friendship[]> {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('Not authenticated');

            const snapshot = await db.collection('friendships')
                .where('userId', '==', userId)
                .where('status', '==', 'pending')
                .get();

            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Friendship[];
        } catch (error) {
            console.error('Error getting sent requests:', error);
            throw error;
        }
    }

    /**
     * Get pending friend requests
     */
    async getPendingRequests(): Promise<Friendship[]> {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('Not authenticated');

            const snapshot = await db.collection('friendships')
                .where('friendId', '==', userId)
                .where('status', '==', 'pending')
                .get();

            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Friendship[];
        } catch (error) {
            console.error('Error getting pending requests:', error);
            throw error;
        }
    }

    /**
     * Block user
     */
    async blockUser(blockedUserId: string): Promise<void> {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('Not authenticated');

            await db.collection('blocks').add({
                userId,
                blockedUserId,
                createdAt: firestore.FieldValue.serverTimestamp(),
            });

            // Remove friendship if exists
            const friendship = await this.getFriendship(userId, blockedUserId);
            if (friendship) {
                await this.removeFriend(friendship.id);
            }
        } catch (error) {
            console.error('Error blocking user:', error);
            throw error;
        }
    }

    /**
     * Unblock user
     */
    async unblockUser(blockedUserId: string): Promise<void> {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('Not authenticated');

            const snapshot = await db.collection('blocks')
                .where('userId', '==', userId)
                .where('blockedUserId', '==', blockedUserId)
                .get();

            const batch = db.batch();
            snapshot.docs.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
        } catch (error) {
            console.error('Error unblocking user:', error);
            throw error;
        }
    }

    /**
     * Get blocked users
     */
    async getBlockedUsers(): Promise<string[]> {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('Not authenticated');

            const snapshot = await db.collection('blocks')
                .where('userId', '==', userId)
                .get();

            return snapshot.docs.map((doc) => doc.data().blockedUserId);
        } catch (error) {
            console.error('Error getting blocked users:', error);
            throw error;
        }
    }

    /**
     * Get friendship between two users
     */
    private async getFriendship(userId1: string, userId2: string): Promise<Friendship | null> {
        try {
            const [snapshot1, snapshot2] = await Promise.all([
                db.collection('friendships')
                    .where('userId', '==', userId1)
                    .where('friendId', '==', userId2)
                    .get(),
                db.collection('friendships')
                    .where('userId', '==', userId2)
                    .where('friendId', '==', userId1)
                    .get()
            ]);

            if (!snapshot1.empty) {
                return { id: snapshot1.docs[0].id, ...snapshot1.docs[0].data() } as Friendship;
            }

            if (!snapshot2.empty) {
                return { id: snapshot2.docs[0].id, ...snapshot2.docs[0].data() } as Friendship;
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Subscribe to friends List
     */
    subscribeToFriends(userId: string, callback: (friends: Friendship[]) => void): () => void {
        let friends1: Friendship[] = [];
        let friends2: Friendship[] = [];

        const update = () => {
            callback([...friends1, ...friends2]);
        };

        const unsub1 = db.collection('friendships')
            .where('userId', '==', userId)
            .where('status', '==', 'accepted')
            .onSnapshot((snapshot) => {
                friends1 = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Friendship));
                update();
            }, (error) => {
                console.error('Error in subscribeToFriends (userId):', error);
            });

        const unsub2 = db.collection('friendships')
            .where('friendId', '==', userId)
            .where('status', '==', 'accepted')
            .onSnapshot((snapshot) => {
                friends2 = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Friendship));
                update();
            }, (error) => {
                console.error('Error in subscribeToFriends (friendId):', error);
            });

        return () => {
            unsub1();
            unsub2();
        };
    }

    /**
     * Subscribe to pending friend requests
     */
    subscribeToFriendRequests(userId: string, type: 'incoming' | 'outgoing', callback: (requests: Friendship[]) => void): () => void {
        const field = type === 'incoming' ? 'friendId' : 'userId';
        return db.collection('friendships')
            .where(field, '==', userId)
            .where('status', '==', 'pending')
            .onSnapshot((snapshot) => {
                const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Friendship));
                callback(requests);
            }, (error) => {
                console.error('Error in subscribeToFriendRequests:', error);
            });
    }
}

export default new FriendService();
