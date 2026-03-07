import {
    collection,
    doc,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Community } from '../types/community';

export const communityService = {
    subscribeToCommunities: (callback: (communities: Community[]) => void) => {
        const q = query(
            collection(db, 'communities'),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, (snap) => {
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Community));
            callback(list);
        });
    },

    createCommunity: async (communityData: Partial<Community>, userId: string) => {
        const newDoc = {
            ...communityData,
            members: [userId],
            createdBy: userId,
            createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, 'communities'), newDoc);
    },

    joinCommunity: async (communityId: string, userId: string) => {
        const ref = doc(db, 'communities', communityId);
        await updateDoc(ref, { members: arrayUnion(userId) });
    },

    leaveCommunity: async (communityId: string, userId: string) => {
        const ref = doc(db, 'communities', communityId);
        await updateDoc(ref, { members: arrayRemove(userId) });
    }
};
