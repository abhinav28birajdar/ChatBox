import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Platform, Image, View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';

export default function TabLayout() {
    const { colors } = useTheme();
    const { userProfile } = useAuth();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.tabBar,
                    borderTopWidth: 0,
                    elevation: 0,
                    height: Platform.OS === 'ios' ? 88 : 64,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                }
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    title: 'Chat',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="chatbubble" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="search" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: 'Alerts',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="notifications" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size, focused }) => (
                        userProfile?.avatar ? (
                            <View style={{
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                                overflow: 'hidden',
                                borderWidth: focused ? 2 : 0,
                                borderColor: color
                            }}>
                                <Image
                                    source={{ uri: userProfile.avatar }}
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </View>
                        ) : (
                            <Ionicons name="person-circle" size={size} color={color} />
                        )
                    ),
                }}
            />
        </Tabs>
    );
}
