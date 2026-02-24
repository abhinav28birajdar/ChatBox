/**
 * Expo app configuration with EAS secrets support.
 *
 * For CI/CD builds, google-services.json is written by the GitHub Actions
 * workflow from the GOOGLE_SERVICES_JSON secret. Locally, the file lives
 * at the project root and is git-ignored.
 *
 * Environment variables used:
 *   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID – Google Sign-In web client ID
 */
module.exports = ({ config }) => {
  return {
    ...config,
    name: "Aakar",
    slug: "chatbox",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/icon.png",
    scheme: "aakar",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./src/assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#120C17",
    },
    updates: {
      url: "https://u.expo.dev/4ec8df12-7940-49c5-80e5-18e0a0c5b89c",
      fallbackToCacheTimeout: 0,
      checkAutomatically: "ON_LOAD"
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.abhinav.aakar",
    },
    android: {
      package: "com.abhinav.aakar",
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON_PATH || "./google-services.json",
      adaptiveIcon: {
        foregroundImage: "./src/assets/adaptive-icon.png",
        backgroundColor: "#120C17",
      },
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
      ],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./src/assets/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-asset",
      "@react-native-google-signin/google-signin",
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      [
        "expo-build-properties",
        {
          android: {
            minSdkVersion: 24,
            compileSdkVersion: 35,
            targetSdkVersion: 35,
          },
          ios: {
            useFrameworks: "static",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "4ec8df12-7940-49c5-80e5-18e0a0c5b89c",
      },
    },
    owner: "abhinav28birajdar",
  };
};
