import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { db, auth } from '@/config/firebase';
import MediaService from './MediaService';
import { UserProfile } from '@/types';

export interface Message {
    id: string;
    content: string;
    authorId: string;
    authorName?: string;
    authorAvatar?: string;
    attachments: Attachment[];
    embeds: Embed[];
    mentions: string[];
    reactions: Record<string, string[]>;
    edited: boolean;
    editedAt?: any;
    pinned: boolean;
    replyTo?: string;
    threadId?: string;
    createdAt: any;
}

export interface Attachment {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'video' | 'file';
    size: number;
    width?: number;
    height?: number;
}

export interface Embed {
    type: 'link' | 'rich';
    url: string;
    title?: string;
    description?: string;
    image?: string;
    color?: string;
}

export interface SendMessageData {
    content: string;
    attachments?: Attachment[];
    replyTo?: string;
}

class MessageService {
    /**
     * Send message to channel
     */
    async sendMessage(
        serverId: string,
        channelId: string,
        messageData: SendMessageData
    ): Promise<string> {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('Not authenticated');

            // Extract mentions from content
            const mentions = this.extractMentions(messageData.content);

            // Generate embeds from URLs
            const embeds = await this.generateEmbeds(messageData.content);

            // Get user profile for denormalization
            const userDoc = await db.collection('users').doc(userId).get();
            const userProfile = userDoc.data() as UserProfile;

            const messagesRef = db.collection('servers').doc(serverId)
                .collection('channels').doc(channelId)
                .collection('messages');

            const messageRef = await messagesRef.add({
                content: messageData.content,
                authorId: userId,
                authorName: userProfile?.displayName || 'User',
                authorAvatar: userProfile?.avatar || null,
                attachments: messageData.attachments || [],
                embeds,
                mentions,
                reactions: {},
                edited: false,
                pinned: false,
                replyTo: messageData.replyTo || null,
                createdAt: firestore.FieldValue.serverTimestamp(),
            });

            // Update channel's lastMessageAt
            await db.collection('servers').doc(serverId)
                .collection('channels').doc(channelId)
                .update({
                    lastMessageAt: firestore.FieldValue.serverTimestamp(),
                });

            return messageRef.id;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    /**
     * Get messages from channel
     */
    async getMessages(
        serverId: string,
        channelId: string,
        limitCount: number = 50,
        lastDoc?: FirebaseFirestoreTypes.DocumentSnapshot
    ): Promise<{ messages: Message[]; lastDoc: FirebaseFirestoreTypes.DocumentSnapshot | null }> {
        try {
            let q = db.collection('servers').doc(serverId)
                .collection('channels').doc(channelId)
                .collection('messages')
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
            console.error('Error getting messages:', error);
            throw error;
        }
    }

    /**
     * Subscribe to messages in real-time
     */
    subscribeToMessages(
        serverId: string,
        channelId: string,
        limitCount: number = 50,
        callback: (messages: Message[]) => void
    ): () => void {
        const q = db.collection('servers').doc(serverId)
            .collection('channels').doc(channelId)
            .collection('messages')
            .orderBy('createdAt', 'desc')
            .limit(limitCount);

        return q.onSnapshot((snapshot) => {
            const messages = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Message[];

            callback(messages);
        });
    }

    /**
     * Edit message
     */
    async editMessage(
        serverId: string,
        channelId: string,
        messageId: string,
        newContent: string
    ): Promise<void> {
        try {
            const mentions = this.extractMentions(newContent);
            const embeds = await this.generateEmbeds(newContent);

            await db.collection('servers').doc(serverId)
                .collection('channels').doc(channelId)
                .collection('messages').doc(messageId)
                .update({
                    content: newContent,
                    mentions,
                    embeds,
                    edited: true,
                    editedAt: firestore.FieldValue.serverTimestamp(),
                });
        } catch (error) {
            console.error('Error editing message:', error);
            throw error;
        }
    }

    /**
     * Delete message
     */
    async deleteMessage(serverId: string, channelId: string, messageId: string): Promise<void> {
        try {
            await db.collection('servers').doc(serverId)
                .collection('channels').doc(channelId)
                .collection('messages').doc(messageId)
                .delete();
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }

    /**
     * Add reaction to message
     */
    async addReaction(
        serverId: string,
        channelId: string,
        messageId: string,
        emoji: string
    ): Promise<void> {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('Not authenticated');

            const messageRef = db.collection('servers').doc(serverId)
                .collection('channels').doc(channelId)
                .collection('messages').doc(messageId);

            await db.runTransaction(async (transaction) => {
                const messageDoc = await transaction.get(messageRef);
                if (!messageDoc.exists) return;

                const reactions = (messageDoc.data()?.reactions || {}) as Record<string, string[]>;

                if (!reactions[emoji]) {
                    reactions[emoji] = [];
                }

                if (!reactions[emoji].includes(userId)) {
                    reactions[emoji].push(userId);
                    transaction.update(messageRef, { reactions });
                }
            });
        } catch (error) {
            console.error('Error adding reaction:', error);
            throw error;
        }
    }

    /**
     * Remove reaction from message
     */
    async removeReaction(
        serverId: string,
        channelId: string,
        messageId: string,
        emoji: string
    ): Promise<void> {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('Not authenticated');

            const messageRef = db.collection('servers').doc(serverId)
                .collection('channels').doc(channelId)
                .collection('messages').doc(messageId);

            await db.runTransaction(async (transaction) => {
                const messageDoc = await transaction.get(messageRef);
                if (!messageDoc.exists) return;

                const reactions = (messageDoc.data()?.reactions || {}) as Record<string, string[]>;

                if (reactions[emoji]) {
                    reactions[emoji] = reactions[emoji].filter((id: string) => id !== userId);

                    if (reactions[emoji].length === 0) {
                        delete reactions[emoji];
                    }

                    transaction.update(messageRef, { reactions });
                }
            });
        } catch (error) {
            console.error('Error removing reaction:', error);
            throw error;
        }
    }

    /**
     * Pin message
     */
    async pinMessage(serverId: string, channelId: string, messageId: string): Promise<void> {
        try {
            await db.collection('servers').doc(serverId)
                .collection('channels').doc(channelId)
                .collection('messages').doc(messageId)
                .update({ pinned: true });
        } catch (error) {
            console.error('Error pinning message:', error);
            throw error;
        }
    }

    /**
     * Unpin message
     */
    async unpinMessage(serverId: string, channelId: string, messageId: string): Promise<void> {
        try {
            await db.collection('servers').doc(serverId)
                .collection('channels').doc(channelId)
                .collection('messages').doc(messageId)
                .update({ pinned: false });
        } catch (error) {
            console.error('Error unpinning message:', error);
            throw error;
        }
    }

    /**
     * Upload attachment
     */
    async uploadAttachment(
        file: { uri: string; name: string; type: string; size: number },
        serverId: string,
        channelId: string
    ): Promise<Attachment> {
        try {
            const timestamp = Date.now();
            const path = `servers/${serverId}/channels/${channelId}/attachments/${timestamp}_${file.name}`;

            const url = await MediaService.uploadFile(file.uri, path);

            return {
                id: timestamp.toString(),
                name: file.name,
                url,
                type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file',
                size: file.size,
            };
        } catch (error) {
            console.error('Error uploading attachment:', error);
            throw error;
        }
    }

    /**
     * Extract mentions from message content
     */
    private extractMentions(content: string): string[] {
        const mentionRegex = /@(\w+)/g;
        const mentions: string[] = [];
        let match;

        while ((match = mentionRegex.exec(content)) !== null) {
            mentions.push(match[1]);
        }

        return mentions;
    }

    /**
     * Generate embeds from URLs in content
     */
    private async generateEmbeds(content: string): Promise<Embed[]> {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = content.match(urlRegex) || [];
        const embeds: Embed[] = [];

        for (const url of urls.slice(0, 3)) { // Limit to 3 embeds
            try {
                const embed = await this.fetchLinkEmbed(url);
                if (embed) {
                    embeds.push(embed);
                }
            } catch (error) {
                console.error('Error generating embed:', error);
            }
        }

        return embeds;
    }

    /**
     * Fetch link embed data
     */
    private async fetchLinkEmbed(url: string): Promise<Embed | null> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch(url, {
                method: 'GET',
                signal: controller.signal as any,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; ChatBoxBot/1.0)',
                },
            });
            clearTimeout(timeoutId);

            if (!response.ok) return null;

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('text/html')) {
                return null;
            }

            const html = await response.text();

            const getMetaTag = (htmlText: string, property: string) => {
                const regex1 = new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["'](.*?)["']`, 'i');
                const match1 = htmlText.match(regex1);
                if (match1) return match1[1];

                const regex2 = new RegExp(`<meta[^>]*content=["'](.*?)["'][^>]*property=["']${property}["']`, 'i');
                const match2 = htmlText.match(regex2);
                if (match2) return match2[1];

                const regex3 = new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["'](.*?)["']`, 'i');
                const match3 = htmlText.match(regex3);
                if (match3) return match3[1];

                return null;
            };

            const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
            const rawTitle = titleMatch ? titleMatch[1] : url;

            const title = getMetaTag(html, 'og:title') || getMetaTag(html, 'twitter:title') || rawTitle;
            const description = getMetaTag(html, 'og:description') || getMetaTag(html, 'twitter:description') || getMetaTag(html, 'description');
            const image = getMetaTag(html, 'og:image') || getMetaTag(html, 'twitter:image');
            const color = getMetaTag(html, 'theme-color');

            return {
                type: 'rich',
                url,
                title: title ? title.slice(0, 100) : url,
                description: description ? description.slice(0, 200) : undefined,
                image: image || undefined,
                color: color || undefined,
            };
        } catch (error) {
            console.error('Error fetching embed:', error);
            return {
                type: 'link',
                url,
                title: url,
            };
        }
    }
}

export default new MessageService();
