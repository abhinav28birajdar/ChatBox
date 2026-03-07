import { doc, getDoc, updateDoc, query, collection, where, getDocs, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FirestoreUser } from '../types/user';
import { useAuthStore } from '../store/authStore';

export const userService = {
    getUser: async (uid: string): Promise<FirestoreUser | null> => {
        const docSnap = await getDoc(doc(db, 'users', uid));
        if (docSnap.exists()) {
            return docSnap.data() as FirestoreUser;
        }
        return null;
    },

    updateUser: async (uid: string, data: Partial<FirestoreUser>) => {
        await updateDoc(doc(db, 'users', uid), data);
    },

    updateProfile: async (data: Partial<FirestoreUser>) => {
        const { user } = useAuthStore.getState();
        if (!user) throw new Error('Not authenticated');
        await updateDoc(doc(db, 'users', user.uid), data);
    },

    updatePresence: async (uid: string, isOnline: boolean) => {
        await updateDoc(doc(db, 'users', uid), {
            isOnline,
            lastSeen: serverTimestamp(),
        });
    },

    searchUsers: async (searchTerm: string): Promise<FirestoreUser[]> => {
        if (!searchTerm) return [];
        const lowerSearch = searchTerm.toLowerCase();

        // Query by displayName
        const qDisplayName = query(
            collection(db, 'users'),
            where('displayName', '>=', searchTerm),
            where('displayName', '<=', searchTerm + '\uf8ff')
        );

        // Query by username
        const qUsername = query(
            collection(db, 'users'),
            where('username', '>=', lowerSearch),
            where('username', '<=', lowerSearch + '\uf8ff')
        );

        // Query by email
        const qEmail = query(
            collection(db, 'users'),
            where('email', '>=', lowerSearch),
            where('email', '<=', lowerSearch + '\uf8ff')
        );

        const [snap1, snap2, snap3] = await Promise.all([
            getDocs(qDisplayName),
            getDocs(qUsername),
            getDocs(qEmail)
        ]);

        const results = new Map<string, FirestoreUser>();
        [...snap1.docs, ...snap2.docs, ...snap3.docs].forEach(doc => {
            results.set(doc.id, doc.data() as FirestoreUser);
        });

        return Array.from(results.values());
    },

    sendFriendRequest: async (fromUid: string, toUid: string) => {
        await updateDoc(doc(db, 'users', toUid), {
            friendRequests: arrayUnion(fromUid)
        });
        await updateDoc(doc(db, 'users', fromUid), {
            sentRequests: arrayUnion(toUid)
        });
    },

    acceptFriendRequest: async (uid: string, friendUid: string) => {
        await updateDoc(doc(db, 'users', uid), {
            friendRequests: arrayRemove(friendUid),
            friends: arrayUnion(friendUid)
        });
        await updateDoc(doc(db, 'users', friendUid), {
            sentRequests: arrayRemove(uid),
            friends: arrayUnion(uid)
        });
    },

    declineFriendRequest: async (uid: string, friendUid: string) => {
        await updateDoc(doc(db, 'users', uid), {
            friendRequests: arrayRemove(friendUid)
        });
        await updateDoc(doc(db, 'users', friendUid), {
            sentRequests: arrayRemove(uid)
        });
    },

    blockUser: async (uid: string, blockUid: string) => {
        await updateDoc(doc(db, 'users', uid), {
            blockedUsers: arrayUnion(blockUid),
            friends: arrayRemove(blockUid)
        });
        await updateDoc(doc(db, 'users', blockUid), {
            friends: arrayRemove(uid)
        });
    },

    unblockUser: async (uid: string, unblockUid: string) => {
        await updateDoc(doc(db, 'users', uid), {
            blockedUsers: arrayRemove(unblockUid)
        });
    },

    getFriends: async (uid: string): Promise<FirestoreUser[]> => {
        const user = await userService.getUser(uid);
        if (!user || !user.friends || user.friends.length === 0) return [];
        const q = query(collection(db, 'users'), where('uid', 'in', user.friends));
        const snap = await getDocs(q);
        return snap.docs.map(doc => doc.data() as FirestoreUser);
    },

    getPendingRequests: async (uid: string): Promise<FirestoreUser[]> => {
        const user = await userService.getUser(uid);
        if (!user || !user.friendRequests || user.friendRequests.length === 0) return [];
        const q = query(collection(db, 'users'), where('uid', 'in', user.friendRequests));
        const snap = await getDocs(q);
        return snap.docs.map(doc => doc.data() as FirestoreUser);
    }
};
