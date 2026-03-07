import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ViewToken } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { DIMENSIONS } from '../../constants/dimensions';
import { Typography } from '../../constants/typography';
import { Button } from '../../components/common/Button';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';
import { ROUTES } from '../../constants/routes';

const SLIDES = [
    {
        id: '1',
        title: 'Chat Freely',
        description: 'Connect with friends and family in real-time with secure messaging.',
        image: require('../../assets/images/logo.png'),
    },
    {
        id: '2',
        title: 'Build Communities',
        description: 'Join or create servers to connect with people sharing your interests.',
        image: require('../../assets/images/logo.png'),
    },
    {
        id: '3',
        title: 'Shop & Sell',
        description: 'Discover trending products or start your own business in our bazaar.',
        image: require('../../assets/images/logo.png'),
    },
];

export const OnboardingScreen: React.FC<any> = ({ navigation }) => {
    const { colors } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useSharedValue(0);
    const slidesRef = useRef<FlatList>(null);

    const onScroll = (event: any) => {
        scrollX.value = event.nativeEvent.contentOffset.x;
    };

    const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const scrollToNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            navigation.replace(ROUTES.AUTH.LOGIN);
        }
    };

    const skip = () => {
        navigation.replace(ROUTES.AUTH.LOGIN);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.topRow}>
                <TouchableOpacity onPress={skip}>
                    <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={SLIDES}
                renderItem={({ item }) => (
                    <View style={styles.slide}>
                        <Image source={item.image} style={styles.image} resizeMode="contain" />
                        <View style={styles.textContainer}>
                            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                            <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
                        </View>
                    </View>
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                onScroll={onScroll}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                scrollEventThrottle={32}
                ref={slidesRef}
                keyExtractor={(item) => item.id}
            />

            <View style={styles.footer}>
                <View style={styles.indicatorContainer}>
                    {SLIDES.map((_, i) => {
                        const style = useAnimatedStyle(() => {
                            const width = i === currentIndex ? withTiming(24) : withTiming(8);
                            const opacity = i === currentIndex ? withTiming(1) : withTiming(0.4);
                            return {
                                width,
                                opacity,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: colors.primary,
                                marginHorizontal: 4,
                            };
                        });
                        return <Animated.View key={i} style={style} />;
                    })}
                </View>

                <Button
                    title={currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
                    onPress={scrollToNext}
                    style={styles.button}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topRow: {
        paddingTop: 60,
        paddingHorizontal: 24,
        alignItems: 'flex-end',
    },
    skipText: {
        fontSize: Typography.fontSize.md,
        fontFamily: Typography.fontFamily.medium,
    },
    slide: {
        width: DIMENSIONS.screen.width,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    image: {
        width: DIMENSIONS.screen.width * 0.8,
        height: DIMENSIONS.screen.width * 0.8,
    },
    textContainer: {
        marginTop: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: Typography.fontSize.xxxl,
        fontFamily: Typography.fontFamily.bold,
        textAlign: 'center',
    },
    description: {
        fontSize: Typography.fontSize.md,
        fontFamily: Typography.fontFamily.regular,
        textAlign: 'center',
        marginTop: 16,
        lineHeight: 24,
    },
    footer: {
        paddingHorizontal: 40,
        paddingBottom: 60,
        alignItems: 'center',
    },
    indicatorContainer: {
        flexDirection: 'row',
        marginBottom: 40,
    },
    button: {
        width: '100%',
        height: 56,
    },
});
