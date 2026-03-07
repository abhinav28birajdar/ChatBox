import { Timestamp } from 'firebase/firestore';

export interface Community {
    id: string;
    name: string;
    description?: string;
    category: string;
    cover: string; // Emoji
    members: string[]; // array of UIDs
    createdAt: Timestamp;
    createdBy: string;
}
