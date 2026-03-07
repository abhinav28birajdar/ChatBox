export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file';

export interface Reaction {
    [emoji: string]: string[]; // Array of UIDs
}

export interface ReplyPreview {
    messageId: string;
    text: string;
    senderId: string;
}

export interface Message {
    id: string;
    senderId: string;
    text: string;
    type: MessageType;
    mediaUrl?: string;
    mediaThumb?: string;
    fileName?: string;
    duration?: number;
    reactions: Reaction;
    readBy: string[];
    replyTo?: ReplyPreview;
    createdAt: any; // Firebase Timestamp
    deletedAt?: any; // Firebase Timestamp
}

export interface Conversation {
    id: string;
    participants: string[];
    lastMessage?: {
        text: string;
        senderId: string;
        timestamp: any;
    };
    unreadCount: {
        [uid: string]: number;
    };
    createdAt: any;
    updatedAt: any;
}
