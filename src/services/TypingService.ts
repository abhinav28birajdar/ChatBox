import { realtimeDb, auth } from '@/config/firebase';

export interface TypingUser {
    displayName: string;
    timestamp: number;
}

class TypingService {
    private typingTimeouts: Map<string, any> = new Map();

    /**
     * Send typing indicator
     */
    async sendTyping(channelId: string, displayName: string): Promise<void> {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            const typingRef = realtimeDb.ref(`typing/${channelId}/${userId}`);

            await typingRef.set({
                displayName,
                timestamp: Date.now(),
            });

            // Clear existing timeout
            const existingTimeout = this.typingTimeouts.get(channelId);
            if (existingTimeout) {
                clearTimeout(existingTimeout);
            }

            // Auto-remove after 3 seconds
            const timeout = setTimeout(() => {
                typingRef.remove();
                this.typingTimeouts.delete(channelId);
            }, 3000);

            this.typingTimeouts.set(channelId, timeout);
        } catch (error) {
            console.error('Error sending typing indicator:', error);
        }
    }

    /**
     * Subscribe to typing indicators
     */
    subscribeToTyping(channelId: string, callback: (typingUsers: string[]) => void): () => void {
        const typingRef = realtimeDb.ref(`typing/${channelId}`);
        const userId = auth.currentUser?.uid;

        const onValueChange = typingRef.on('value', (snapshot) => {
            const typingUsers: string[] = [];
            const now = Date.now();

            snapshot.forEach((child) => {
                if (child.key !== userId) {
                    const data = child.val() as TypingUser;
                    // Only include if timestamp is within last 3 seconds
                    if (now - data.timestamp < 3000) {
                        typingUsers.push(data.displayName);
                    }
                }
                return undefined;
            });

            callback(typingUsers);
        });

        // Return unsubscribe function
        return () => {
            typingRef.off('value', onValueChange);
        };
    }

    /**
     * Clear typing indicator
     */
    async clearTyping(channelId: string): Promise<void> {
        try {
            const userId = auth.currentUser?.uid;
            if (!userId) return;

            const typingRef = realtimeDb.ref(`typing/${channelId}/${userId}`);
            await typingRef.remove();

            const timeout = this.typingTimeouts.get(channelId);
            if (timeout) {
                clearTimeout(timeout);
                this.typingTimeouts.delete(channelId);
            }
        } catch (error) {
            console.error('Error clearing typing indicator:', error);
        }
    }
}

export default new TypingService();
