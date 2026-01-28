export interface User {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline' | 'busy' | 'away';
}

export interface Chat {
    id: string;
    name: string;
    lastMessage: string;
    time: string;
    unread: number;
}
