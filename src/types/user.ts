export type UserRole = 'customer' | 'seller' | 'admin';

export interface UserSettings {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    pushNotifications?: boolean;
    locationSharing?: boolean;
    darkMode?: boolean;
}

export interface FirestoreUser {
    uid: string;
    email: string;
    displayName: string;
    username?: string;
    photoURL: string;
    phoneNumber: string;
    role: UserRole;
    bio: string;
    about?: string;
    interests: string[];
    joinedAt: any; // Firebase Timestamp
    lastSeen: any; // Firebase Timestamp
    isOnline: boolean;
    isVerified: boolean;
    isSellerApproved: boolean;
    fcmTokens: string[];
    pushToken: string | null;
    friends: string[];
    friendRequests: string[];
    sentRequests: string[];
    blockedUsers: string[];
    settings: UserSettings;
    onboardingComplete: boolean;
}
