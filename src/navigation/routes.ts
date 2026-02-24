export const ROUTES = {
    AUTH: {
        LOGIN: '/(auth)/login' as const,
        REGISTER: '/(auth)/register' as const,
        FORGOT_PASSWORD: '/(auth)/forgot-password' as const,
        RESET_PASSWORD: '/(auth)/reset-password' as const,
        PHONE_AUTH: '/(auth)/phone-auth' as const,
        EMAIL_VERIFICATION: '/(auth)/email-verification' as const,
    },
    MAIN: {
        HOME: '/(tabs)/home' as const,
        CHAT: '/(tabs)/chat' as const,
        EXPLORE: '/(tabs)/explore' as const,
        NOTIFICATIONS: '/(tabs)/notifications' as const,
        PROFILE: '/(tabs)/profile' as const,
    },
    ONBOARDING: {
        WELCOME: '/onboarding/welcome' as const,
        FEATURES: '/onboarding/features' as const,
        PERMISSIONS: '/onboarding/permissions' as const,
    },
    CHAT: {
        ROOM: '/chat/chat-room' as const,
        CREATE: '/chat/create-chat' as const,
    },
    SERVER: {
        INDEX: '/server' as const,
        SETTINGS: '/server/settings' as const,
        MEMBERS: '/server/members' as const,
    },
    SETTINGS: {
        INDEX: '/settings' as const,
        EDIT_PROFILE: '/settings/edit-profile' as const,
        SECURITY: '/settings/security' as const,
        NOTIFICATIONS: '/settings/notifications' as const,
        THEME: '/settings/theme' as const,
        PRIVACY: '/settings/privacy' as const,
        HELP: '/settings/help' as const,
    },
    FRIENDS: '/friends' as const,
    SEARCH: '/search' as const,
    LEGAL: {
        ABOUT: '/legal/about' as const,
        PRIVACY_POLICY: '/legal/privacy-policy' as const,
        TERMS: '/legal/terms' as const,
    },
    MODALS: {
        CREATE: '/(modals)/create' as const,
        IMAGE_PREVIEW: '/modal/image-preview' as const,
        USER_ACTIONS: '/modal/user-actions' as const,
    },
} as const;
