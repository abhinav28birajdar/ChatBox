import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

import HomeScreen from '../screens/home/HomeScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import FriendsScreen from '../screens/profile/FriendsScreen';
import NotificationScreen from '../screens/notifications/NotificationScreen';
import CommunityScreen from '../screens/profile/CommunityScreen';
import { useTheme } from '../hooks/useTheme';
import { ROUTES } from '../constants/routes';
import { useNotificationStore } from '../store/notificationStore';
import { Typography } from '../constants/typography';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

function CustomTabBar({ state, descriptors, navigation, colors, isDark, unreadCount }: any) {
    return (
        <View style={styles.shadowContainer}>
            {/* BlurView provides the glass effect */}
            <BlurView
                intensity={isDark ? 40 : 60}
                tint={isDark ? 'dark' : 'light'}
                style={[
                    styles.tabBarContainer,
                    {
                        backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
                    }
                ]}
            >
                {state.routes.map((route: any, index: number) => {
                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    return (
                        <TabBarButton
                            key={route.key}
                            isFocused={isFocused}
                            routeName={route.name}
                            label={label}
                            colors={colors}
                            unreadCount={unreadCount}
                            onPress={onPress}
                            onLongPress={onLongPress}
                        />
                    );
                })}
            </BlurView>
        </View>
    );
}

const TabBarButton = ({ isFocused, routeName, label, colors, unreadCount, onPress, onLongPress }: any) => {
    // Upgraded to withSpring for a bouncier, premium feel
    const progress = useSharedValue(isFocused ? 1 : 0);

    useEffect(() => {
        progress.value = withSpring(isFocused ? 1 : 0, { 
            damping: 15, 
            stiffness: 120 
        });
    }, [isFocused]);

    const getIconName = () => {
        if (routeName === ROUTES.MAIN.HOME) return 'home';
        if (routeName === ROUTES.MAIN.CHAT) return 'message-circle';
        if (routeName === ROUTES.MAIN.FRIENDS) return 'search';
        if (routeName === ROUTES.MAIN.NOTIFICATIONS) return 'bell';
        if (routeName === ROUTES.MAIN.COMMUNITY) return 'users';
        return 'circle';
    };

    const containerStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: isFocused ? colors.primary : 'transparent',
            paddingHorizontal: isFocused ? 16 : 8,
            paddingVertical: 10,
            borderRadius: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        };
    });

    const labelStyle = useAnimatedStyle(() => {
        return {
            width: progress.value > 0.5 ? 'auto' : 0,
            opacity: progress.value,
            marginLeft: isFocused ? 6 : 0,
            overflow: 'hidden',
        };
    });

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
            style={styles.tabButton}
        >
            <Animated.View style={containerStyle}>
                <View>
                    <Feather
                        name={getIconName() as any}
                        size={20}
                        color={isFocused ? '#110D18' : 'rgba(150, 150, 150, 0.8)'}
                    />
                    {!isFocused && unreadCount > 0 && routeName === ROUTES.MAIN.CHAT && (
                        <View style={[styles.badgeContainer, { backgroundColor: colors.error }]}>
                            <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                        </View>
                    )}
                </View>
                {isFocused && (
                    <Animated.View style={labelStyle}>
                        <Text style={[styles.tabLabel, { color: '#110D18' }]} numberOfLines={1}>
                            {label}
                        </Text>
                    </Animated.View>
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

export default function MainTabNavigator() {
    const { colors, isDark } = useTheme();
    const { unreadCount } = useNotificationStore();

    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} colors={colors} isDark={isDark} unreadCount={unreadCount} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name={ROUTES.MAIN.HOME} component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
            <Tab.Screen name={ROUTES.MAIN.CHAT} component={ChatListScreen} options={{ tabBarLabel: 'Chat' }} />
            <Tab.Screen name={ROUTES.MAIN.FRIENDS} component={FriendsScreen} options={{ tabBarLabel: 'Explore' }} />
            <Tab.Screen name={ROUTES.MAIN.NOTIFICATIONS} component={NotificationScreen} options={{ tabBarLabel: 'Alerts' }} />
            <Tab.Screen name={ROUTES.MAIN.COMMUNITY} component={CommunityScreen} options={{ tabBarLabel: 'Community' }} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    shadowContainer: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 30 : 20,
        left: 20,
        right: 20,
        borderRadius: 32,
        // Shadows must go on the wrapper, not the BlurView itself, to prevent clipping
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    tabBarContainer: {
        height: 64,
        flexDirection: 'row',
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 32,
        borderWidth: 1, // Adds that realistic glass edge
        overflow: 'hidden', // Essential for BlurView to respect border radius
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: 13,
        fontFamily: Typography.fontFamily.bold,
        letterSpacing: 0.3,
    },
    badgeContainer: {
        position: 'absolute',
        top: -6,
        right: -8,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: '#fff', // White ring makes the badge pop over the icon
    },
    badgeText: {
        color: '#fff',
        fontSize: 9,
        fontFamily: Typography.fontFamily.bold,
    },
});