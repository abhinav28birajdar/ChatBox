import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { db, auth } from '@/config/firebase';
import MediaService from './MediaService';
import { ServerCategory } from '@/types';

export interface Server {
    id: string;
    name: string;
    description: string;
    icon: string;
    banner?: string;
    ownerId: string;
    type: 'public' | 'private';
    category: ServerCategory;
    createdAt: any;
    memberCount: number;
    channelCount?: number;
    roleCount?: number;
    settings: {
        verificationLevel: 'none' | 'low' | 'medium' | 'high';
        explicitContentFilter: 'disabled' | 'members_without_roles' | 'all_members';
        defaultNotifications: 'all_messages' | 'only_mentions';
        systemChannelId?: string;
    };
    features: string[];
    onlineCount?: number;
    inviteCode?: string;
}

export interface ServerMember {
    userId: string;
    roles: string[];
    joinedAt: any;
    nickname?: string;
    muted: boolean;
    deafened: boolean;
}

export interface CreateServerData {
    name: string;
    description: string;
    iconUri?: string;
    type: 'public' | 'private';
    category: string;
    template: string;
}

const CHANNEL_TEMPLATES = {
    gaming: [
        { name: 'welcome', type: 'text', category: 'General', topic: 'Welcome to the server!' },
        { name: 'rules', type: 'text', category: 'General', topic: 'Server rules and guidelines' },
        { name: 'general-chat', type: 'text', category: 'General', topic: 'General discussion' },
        { name: 'game-discussion', type: 'text', category: 'Games', topic: 'Talk about games' },
        { name: 'General', type: 'voice', category: 'Voice', topic: '' },
        { name: 'Gaming', type: 'voice', category: 'Voice', topic: '' },
    ],
    education: [
        { name: 'announcements', type: 'announcement', category: 'Info', topic: 'Important announcements' },
        { name: 'resources', type: 'text', category: 'Info', topic: 'Learning resources' },
        { name: 'homework-help', type: 'text', category: 'Subjects', topic: 'Get help with homework' },
        { name: 'study-groups', type: 'text', category: 'Subjects', topic: 'Form study groups' },
        { name: 'Study Room', type: 'voice', category: 'Study', topic: '' },
    ],
    community: [
        { name: 'welcome', type: 'text', category: 'General', topic: 'Welcome!' },
        { name: 'general', type: 'text', category: 'General', topic: 'General chat' },
        { name: 'off-topic', type: 'text', category: 'General', topic: 'Random discussions' },
        { name: 'Lounge', type: 'voice', category: 'Voice', topic: '' },
    ],
};

class ServerService {
    /**
     * Create a new server
     */
    async createServer(serverData: CreateServerData): Promise<string> {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('Not authenticated');

            // Upload icon if provided (after server doc is created so we have the ID)
            let iconUrl = '';
            if (!serverData.iconUri) {
                iconUrl = this.generateDefaultIcon(serverData.name);
            }

            // Create server document
            const serverDocRef = await db.collection('servers').add({
                name: serverData.name,
                description: serverData.description,
                icon: iconUrl,
                ownerId: userId,
                type: serverData.type,
                category: serverData.category,
                createdAt: firestore.FieldValue.serverTimestamp(),
                memberCount: 1,
                settings: {
                    verificationLevel: 'none',
                    explicitContentFilter: 'members_without_roles',
                    defaultNotifications: 'all_messages',
                },
                features: [],
            });

            const serverId = serverDocRef.id;

            // Upload icon with the real server ID path (single upload, no temp file)
            if (serverData.iconUri) {
                const finalIconUrl = await MediaService.uploadImage(serverData.iconUri, `servers/${serverId}/icon.jpg`);
                await serverDocRef.update({ icon: finalIconUrl });
            }

            // Add owner as member
            await this.addMember(serverId, userId, ['owner']);

            // Create default channels from template
            await this.createDefaultChannels(serverId, serverData.template);

            // Create default roles
            await this.createDefaultRoles(serverId);

            return serverId;
        } catch (error) {
            console.error('Error creating server:', error);
            throw error;
        }
    }

    /**
     * Get public servers
     */
    async getPublicServers(
        category?: string,
        limitCount: number = 20,
        lastDoc?: FirebaseFirestoreTypes.DocumentSnapshot
    ): Promise<{ servers: Server[]; lastDoc: FirebaseFirestoreTypes.DocumentSnapshot | null }> {
        try {
            let q = db.collection('servers')
                .where('type', '==', 'public')
                .orderBy('memberCount', 'desc')
                .limit(limitCount);

            if (category && category !== 'all') {
                q = q.where('category', '==', category);
            }

            if (lastDoc) {
                q = q.startAfter(lastDoc);
            }

            const snapshot = await q.get();
            const servers = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Server[];

            return {
                servers,
                lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
            };
        } catch (error) {
            console.error('Error getting public servers:', error);
            throw error;
        }
    }

    /**
     * Search servers
     */
    async searchServers(searchTerm: string): Promise<Server[]> {
        try {
            const q = db.collection('servers')
                .where('type', '==', 'public')
                .where('name', '>=', searchTerm)
                .where('name', '<=', searchTerm + '\uf8ff')
                .limit(20);

            const snapshot = await q.get();
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Server[];
        } catch (error) {
            console.error('Error searching servers:', error);
            throw error;
        }
    }

    /**
     * Get server by ID
     */
    async getServer(serverId: string): Promise<Server | null> {
        try {
            const serverDoc = await db.collection('servers').doc(serverId).get();

            if (serverDoc.exists) {
                return {
                    id: serverDoc.id,
                    ...serverDoc.data(),
                } as Server;
            }

            return null;
        } catch (error) {
            console.error('Error getting server:', error);
            throw error;
        }
    }

    /**
     * Join a server
     */
    async joinServer(serverId: string): Promise<void> {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('Not authenticated');

            // Check if already a member
            const memberDoc = await db.collection('servers').doc(serverId).collection('members').doc(userId).get();
            if (memberDoc.exists) {
                throw new Error('Already a member of this server');
            }

            // Add user to members
            await this.addMember(serverId, userId, ['member']);

            // Increment member count
            await db.collection('servers').doc(serverId).update({
                memberCount: firestore.FieldValue.increment(1),
            });
        } catch (error) {
            console.error('Error joining server:', error);
            throw error;
        }
    }

    /**
     * Get server members
     */
    async getServerMembers(serverId: string): Promise<any[]> {
        try {
            const snapshot = await db.collection('servers').doc(serverId).collection('members').get();
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        } catch (error) {
            console.error('Error getting server members:', error);
            throw error;
        }
    }

    /**
     * Leave a server
     */
    async leaveServer(serverId: string): Promise<void> {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('Not authenticated');

            // Prevent the owner from leaving (must transfer or delete)
            const serverDoc = await db.collection('servers').doc(serverId).get();
            if (serverDoc.exists && serverDoc.data()?.ownerId === userId) {
                throw new Error('Server owner cannot leave. Transfer ownership or delete the server.');
            }

            // Remove user from members
            await db.collection('servers').doc(serverId).collection('members').doc(userId).delete();

            // Decrement member count
            await db.collection('servers').doc(serverId).update({
                memberCount: firestore.FieldValue.increment(-1),
            });
        } catch (error) {
            console.error('Error leaving server:', error);
            throw error;
        }
    }

    /**
     * Update server
     */
    async updateServer(serverId: string, updates: Partial<Server>): Promise<void> {
        try {
            await db.collection('servers').doc(serverId).update(updates);
        } catch (error) {
            console.error('Error updating server:', error);
            throw error;
        }
    }

    /**
     * Delete server
     */
    async deleteServer(serverId: string): Promise<void> {
        try {
            // 1. Delete all channels and their messages
            const channelsSnapshot = await db.collection('servers').doc(serverId).collection('channels').get();

            for (const channelDoc of channelsSnapshot.docs) {
                // Delete messages in channel in chunks to avoid batch limit (500)
                const messagesSnapshot = await channelDoc.ref.collection('messages').get();

                // Delete messages in chunks of 400
                const messageDocs = messagesSnapshot.docs;
                for (let i = 0; i < messageDocs.length; i += 400) {
                    const batch = db.batch();
                    const chunk = messageDocs.slice(i, i + 400);
                    chunk.forEach((msgDoc) => batch.delete(msgDoc.ref));
                    await batch.commit();
                }

                // Delete the channel itself
                await channelDoc.ref.delete();
            }

            // 2. Delete members
            const membersSnapshot = await db.collection('servers').doc(serverId).collection('members').get();
            const memberDocs = membersSnapshot.docs;
            for (let i = 0; i < memberDocs.length; i += 400) {
                const batch = db.batch();
                const chunk = memberDocs.slice(i, i + 400);
                chunk.forEach((memberDoc) => batch.delete(memberDoc.ref));
                await batch.commit();
            }

            // 3. Delete roles
            const rolesSnapshot = await db.collection('servers').doc(serverId).collection('roles').get();
            const roleDocs = rolesSnapshot.docs;
            for (let i = 0; i < roleDocs.length; i += 400) {
                const batch = db.batch();
                const chunk = roleDocs.slice(i, i + 400);
                chunk.forEach((roleDoc) => batch.delete(roleDoc.ref));
                await batch.commit();
            }

            // 4. Delete server document
            await db.collection('servers').doc(serverId).delete();

        } catch (error) {
            console.error('Error deleting server:', error);
            throw error;
        }
    }

    /**
     * Add member to server
     */
    private async addMember(serverId: string, userId: string, roles: string[]): Promise<void> {
        await db.collection('servers').doc(serverId).collection('members').doc(userId).set({
            userId,
            roles,
            joinedAt: firestore.FieldValue.serverTimestamp(),
            nickname: null,
            muted: false,
            deafened: false,
        });
    }

    /**
     * Subscribe to servers a user has joined
     */
    subscribeToUserServers(userId: string, callback: (servers: Server[]) => void): () => void {
        const mq = db.collectionGroup('members').where('userId', '==', userId);

        return mq.onSnapshot(async (snapshot) => {
            const serverIds = snapshot.docs.map(doc => doc.ref.parent.parent!.id);
            if (serverIds.length === 0) {
                callback([]);
                return;
            }

            // Fetch server details
            const serverDocs = await Promise.all(serverIds.map(id => db.collection('servers').doc(id).get()));
            const serverList = serverDocs
                .filter(d => d.exists)
                .map(d => ({ id: d.id, ...d.data() } as Server));

            callback(serverList);
        }, (err) => {
            console.error('Error in subscribeToUserServers:', err);
        });
    }

    /**
     * Create default channels from template
     */
    private async createDefaultChannels(serverId: string, template: string): Promise<void> {
        const channels = CHANNEL_TEMPLATES[template as keyof typeof CHANNEL_TEMPLATES] || CHANNEL_TEMPLATES.community;

        const batch = db.batch();

        channels.forEach((channel, index) => {
            const channelRef = db.collection('servers').doc(serverId).collection('channels').doc();
            batch.set(channelRef, {
                name: channel.name,
                type: channel.type,
                categoryId: channel.category,
                position: index,
                topic: channel.topic,
                nsfw: false,
                slowMode: 0,
                userLimit: 0,
                bitrate: 64000,
                permissions: {},
                createdAt: firestore.FieldValue.serverTimestamp(),
            });
        });

        await batch.commit();
    }

    /**
     * Create default roles
     */
    private async createDefaultRoles(serverId: string): Promise<void> {
        const roles = [
            { name: 'Owner', color: '#FF0000', position: 3, permissions: 0xFFFFFFFF },
            { name: 'Admin', color: '#FFA500', position: 2, permissions: 0x00000008 },
            { name: 'Moderator', color: '#00FF00', position: 1, permissions: 0x00000004 },
            { name: 'Member', color: '#808080', position: 0, permissions: 0x00000001 },
        ];

        const batch = db.batch();

        roles.forEach((role) => {
            const roleRef = db.collection('servers').doc(serverId).collection('roles').doc();
            batch.set(roleRef, {
                ...role,
                mentionable: true,
                hoist: false,
                createdAt: firestore.FieldValue.serverTimestamp(),
            });
        });

        await batch.commit();
    }

    /**
     * Generate default server icon
     */
    private generateDefaultIcon(serverName: string): string {
        const seed = encodeURIComponent(serverName);
        return `https://api.dicebear.com/7.x/initials/png?seed=${seed}&backgroundColor=FFE031`;
    }
}

export default new ServerService();
