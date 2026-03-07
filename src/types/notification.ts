export interface NotificationItem {
    id: string;
    type: 'message' | 'reaction' | 'friend_request' | 'community_invite' | 'order_update' | 'system' | 'order_status';
    title: string;
    body: string;
    data: {
        targetId?: string;
        targetType?: string;
        conversationId?: string;
        userId?: string;
        orderId?: string;
    };
    isRead: boolean;
    read?: boolean; // Support both for easy transition
    createdAt: any;
}
