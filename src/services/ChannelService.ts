import firestore from '@react-native-firebase/firestore';
import { db } from '@/config/firebase';

export interface Channel {
    id: string;
    name: string;
    type: 'text' | 'voice' | 'announcement' | 'stage';
    categoryId?: string;
    position: number;
    topic: string;
    nsfw: boolean;
    slowMode: number;
    userLimit: number;
    bitrate: number;
    serverId?: string;
    isPrivate?: boolean;
    permissions: Record<string, { allow: number; deny: number }>;
    createdAt: any;
    lastMessageAt?: any;
}

export interface CreateChannelData {
    name: string;
    type: 'text' | 'voice' | 'announcement' | 'stage';
    categoryId?: string;
    topic?: string;
    nsfw?: boolean;
    slowMode?: number;
    userLimit?: number;
    bitrate?: number;
}

class ChannelService {
    /**
     * Create a new channel
     */
    async createChannel(serverId: string, channelData: CreateChannelData): Promise<string> {
        try {
            const position = await this.getNextPosition(serverId);

            const channelRef = await db.collection('servers').doc(serverId).collection('channels').add({
                name: channelData.name,
                type: channelData.type,
                categoryId: channelData.categoryId || null,
                position,
                topic: channelData.topic || '',
                nsfw: channelData.nsfw || false,
                slowMode: channelData.slowMode || 0,
                userLimit: channelData.userLimit || 0,
                bitrate: channelData.bitrate || 64000,
                permissions: {},
                createdAt: firestore.FieldValue.serverTimestamp(),
            });

            return channelRef.id;
        } catch (error) {
            console.error('Error creating channel:', error);
            throw error;
        }
    }

    /**
     * Get channels for a server
     */
    async getChannels(serverId: string): Promise<Channel[]> {
        try {
            const snapshot = await db.collection('servers').doc(serverId).collection('channels')
                .orderBy('position')
                .get();

            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Channel[];
        } catch (error) {
            console.error('Error getting channels:', error);
            throw error;
        }
    }

    /**
     * Subscribe to channels in real-time
     */
    subscribeToChannels(serverId: string, callback: (channels: Channel[]) => void): () => void {
        return db.collection('servers').doc(serverId).collection('channels')
            .orderBy('position')
            .onSnapshot((snapshot) => {
                const channels = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Channel[];

                callback(channels);
            });
    }

    /**
     * Update channel
     */
    async updateChannel(
        serverId: string,
        channelId: string,
        updates: Partial<Channel>
    ): Promise<void> {
        try {
            await db.collection('servers').doc(serverId).collection('channels').doc(channelId).update(updates);
        } catch (error) {
            console.error('Error updating channel:', error);
            throw error;
        }
    }

    /**
     * Delete channel
     */
    async deleteChannel(serverId: string, channelId: string): Promise<void> {
        try {
            const channelRef = db.collection('servers').doc(serverId).collection('channels').doc(channelId);

            // Delete all messages in channel (chunked to respect Firestore 500-op batch limit)
            const messagesSnapshot = await channelRef.collection('messages').get();
            const docs = messagesSnapshot.docs;
            const BATCH_LIMIT = 499; // reserve 1 for channel doc in last batch

            for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
                const chunk = docs.slice(i, i + BATCH_LIMIT);
                const batch = db.batch();
                chunk.forEach((doc) => batch.delete(doc.ref));

                // Include channel deletion in the last batch
                if (i + BATCH_LIMIT >= docs.length) {
                    batch.delete(channelRef);
                }

                await batch.commit();
            }

            // If there were no messages, still delete the channel
            if (docs.length === 0) {
                await channelRef.delete();
            }
        } catch (error) {
            console.error('Error deleting channel:', error);
            throw error;
        }
    }

    /**
     * Clone channel
     */
    async cloneChannel(serverId: string, channelId: string): Promise<string> {
        try {
            const channelDoc = await db.collection('servers').doc(serverId).collection('channels').doc(channelId).get();

            if (!channelDoc.exists) {
                throw new Error('Channel not found');
            }

            const channelData = channelDoc.data()!;
            const position = await this.getNextPosition(serverId);

            const newChannelRef = await db.collection('servers').doc(serverId).collection('channels').add({
                ...channelData,
                name: `${channelData.name}-copy`,
                position,
                createdAt: firestore.FieldValue.serverTimestamp(),
            });

            return newChannelRef.id;
        } catch (error) {
            console.error('Error cloning channel:', error);
            throw error;
        }
    }

    /**
     * Reorder channel
     */
    async reorderChannel(serverId: string, channelId: string, newPosition: number): Promise<void> {
        try {
            await db.collection('servers').doc(serverId).collection('channels').doc(channelId).update({
                position: newPosition,
            });
        } catch (error) {
            console.error('Error reordering channel:', error);
            throw error;
        }
    }

    /**
     * Get next position for new channel
     */
    private async getNextPosition(serverId: string): Promise<number> {
        try {
            const channels = await this.getChannels(serverId);
            return channels.length > 0 ? Math.max(...channels.map((c) => c.position)) + 1 : 0;
        } catch (error) {
            return 0;
        }
    }
}

export default new ChannelService();
