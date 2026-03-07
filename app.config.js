// app.config.js — Dynamic Expo config (replaces app.json)
// Secrets are injected via EAS Secret Manager (process.env.*)
// Never commit real keys here; configure them with: `eas secret:create`

export default ({ config }) => ({
    ...config,
    name: 'ChatBox',
    slug: 'chatbox-super-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './src/assets/icon.png',
    scheme: 'chatbox',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    runtimeVersion: {
        policy: 'appVersion',
    },
    splash: {
        image: './src/assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#000000',
    },
    ios: {
        supportsTablet: true,
        bundleIdentifier: 'com.abhinav.chatbox',
    },
    android: {
        package: 'com.abhinav.chatbox',
        googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
        adaptiveIcon: {
            foregroundImage: './src/assets/adaptive-icon.png',
            backgroundColor: '#000000',
        },
        permissions: [
            'INTERNET',
            'ACCESS_NETWORK_STATE',
            'CAMERA',
            'READ_EXTERNAL_STORAGE',
            'WRITE_EXTERNAL_STORAGE',
            'RECORD_AUDIO',
            'NOTIFICATIONS',
        ],
    },
    web: {
        bundler: 'metro',
        output: 'single',
        favicon: './src/assets/favicon.png',
    },
    plugins: [
        'expo-notifications',
        'expo-image-picker',
        'expo-camera',
        'expo-av',
        [
            'expo-build-properties',
            {
                android: {
                    minSdkVersion: 24,
                    compileSdkVersion: 35,
                    targetSdkVersion: 35,
                    allowBackup: false,
                },
                ios: {
                    useFrameworks: 'static',
                },
            },
        ],
    ],
    extra: {
        // Firebase config — injected via EAS secrets (EXPO_PUBLIC_* vars)
        // In local dev, populate a .env file at the project root:
        //   EXPO_PUBLIC_FIREBASE_API_KEY=your_key
        //   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...  etc.
        eas: {
            projectId: '4ec8df12-7940-49c5-80e5-18e0a0c5b89c',
        },
    },
    owner: 'iabhinavv28',
});
