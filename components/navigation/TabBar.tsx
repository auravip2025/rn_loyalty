import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { Dimensions, LayoutChangeEvent, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function TabBar({ state, descriptors, navigation, activeTintColor = '#4f46e5' }: BottomTabBarProps & { activeTintColor?: string }) {
    const insets = useSafeAreaInsets();

    const activeRoutes = state.routes.filter(route => {
        const { options } = descriptors[route.key];
        // If a route doesn't have a tabBarIcon defined in _layout.tsx, we hide it!
        // This instantly hides offer-details and any automatically injected ghost routes.
        return options.tabBarIcon !== undefined && route.name !== 'offer-details' && route.name !== 'checkout';
    });
    const activeRouteIndex = activeRoutes.findIndex(
        route => route.key === state.routes[state.index].key
    );
    // If we're on a hidden route (like offer-details), we might just keep the indicator where it was or hide it.
    // For simplicity, we fallback to 0 if not found in activeRoutes.
    const safeActiveIndex = activeRouteIndex >= 0 ? activeRouteIndex : 0;

    const containerWidth = useSharedValue(SCREEN_WIDTH - 40);
    const buttonWidth = useDerivedValue(() => containerWidth.value / activeRoutes.length);

    const INDICATOR_SIZE = 40;
    const TABBAR_HEIGHT = 56;
    const JET_OUT_AMOUNT = 0;
    const INDICATOR_TOP = (TABBAR_HEIGHT - INDICATOR_SIZE) / 2;

    const onTabbarLayout = (e: LayoutChangeEvent) => {
        containerWidth.value = e.nativeEvent.layout.width;
    };

    // This is the source of truth for the spring motion
    const tabPositionX = useSharedValue(safeActiveIndex);

    useEffect(() => {
        tabPositionX.value = withSpring(safeActiveIndex, {
            damping: 18,
            stiffness: 120,
            mass: 0.8,
        });
    }, [safeActiveIndex]);

    const animatedIndicatorStyle = useAnimatedStyle(() => {
        const x = tabPositionX.value * buttonWidth.value;
        const centerOffset = (buttonWidth.value - INDICATOR_SIZE) / 2;
        return {
            transform: [{ translateX: x + centerOffset }],
        };
    });

    const currentRoute = state.routes[state.index].name;
    const hiddenRoutes = ['offer-details', 'checkout', 'games', 'nearby', 'rewards'];
    if (hiddenRoutes.includes(currentRoute)) {
        return null;
    }

    return (
        // Outer wrapper is IN the layout flow — React Navigation reserves this height for all screens.
        // Inner pill is visually floating via margin/padding, not absolute positioning.
        <View style={[styles.tabbarWrapper, { paddingBottom: insets.bottom > 0 ? insets.bottom - 16 : 4 }]}>
        <View onLayout={onTabbarLayout} style={styles.tabbar}>
            {/* The sliding background indicator */}
            <Animated.View style={[
                styles.activeIndicator,
                {
                    width: INDICATOR_SIZE,
                    height: INDICATOR_SIZE,
                    borderRadius: INDICATOR_SIZE / 2,
                    top: INDICATOR_TOP,
                    backgroundColor: activeTintColor,
                },
                animatedIndicatorStyle
            ]} />

            {activeRoutes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = safeActiveIndex === index;

                const onPress = () => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <TouchableOpacity
                        key={route.name}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        onPress={onPress}
                        style={styles.tabbarItem}
                        activeOpacity={1}
                    >
                        <TabIcon
                            index={index}
                            tabPositionX={tabPositionX}
                            icon={options.tabBarIcon}
                            indicatorTop={INDICATOR_TOP}
                            indicatorSize={INDICATOR_SIZE}
                            tabbarHeight={TABBAR_HEIGHT}
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
        </View>
    );
}
function TabIcon({ index, tabPositionX, icon, indicatorTop, indicatorSize, tabbarHeight }: any) {
    const targetY = 0;

    const animatedIconStyle = useAnimatedStyle(() => {
        // Calculate "proximity" to the indicator (0 to 1)
        // If tabPositionX is equal to icon index, progress is 1.
        // As it moves away, progress drops to 0.
        const distance = Math.abs(tabPositionX.value - index);
        const progress = interpolate(
            distance,
            [0, 0.5, 1], // Active at 0, starts reacting at 0.5 distance away
            [1, 0, 0],
            Extrapolation.CLAMP
        );

        const scale = interpolate(progress, [0, 1], [1, 1.1]);
        const translateY = 0;
        const translateX = interpolate(progress, [0, 1], [0, 0]);
        const opacity = interpolate(progress, [0, 0.8, 1], [0.5, 0.9, 1]);

        // Dynamic color interpolation isn't easily possible with standard Icon components 
        // without passing the color prop, which we do below.

        return {
            transform: [
                { scale },
                { translateY },
                { translateX }
            ],
            opacity
        };
    });

    return (
        <Animated.View style={animatedIconStyle}>
            <View style={styles.iconContainer}>
                {/* 
                   We derive focused from proximity for the color. 
                   If the bubble is more than halfway over, show white.
                */}
                <AnimatedIconWrapper
                    index={index}
                    tabPositionX={tabPositionX}
                    icon={icon}
                />
            </View>
        </Animated.View>
    );
}


function AnimatedIconWrapper({ index, tabPositionX, icon }: any) {
    // We use a state-less approach by deriving the focused prop in real-time
    // But since the icon component usually expects a boolean, we use a simple distance check.

    // To make it truly feel like a collision, the icon color should flip 
    // exactly when the bubble "swallows" it.

    return (
        <View>
            {/* We'll use the background-color logic to make it look seamless */}
            {icon?.({
                focused: true, // We'll handle visual "focus" via the parent's motion
                color: '#ffffff', // Always render white, but we'll mask it maybe?
                size: 676
            })}
            <Animated.View style={[
                StyleSheet.absoluteFill,
                useAnimatedStyle(() => {
                    const distance = Math.abs(tabPositionX.value - index);
                    return {
                        opacity: interpolate(distance, [0, 0.4, 0.5], [0, 0, 1], Extrapolation.CLAMP),
                        backgroundColor: '#ffffff', // This masks the white icon with white to reveal gray
                    };
                })
            ]}>
                {icon?.({
                    focused: false,
                    color: '#94a3b8',
                    size: 26
                })}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Outer wrapper sits in the layout flow — React Navigation reserves its height.
    // paddingBottom is set dynamically via insets to clear the home indicator.
    tabbarWrapper: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    // Inner pill is the visual floating bar.
    tabbar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        height: 56,
    },
    tabbarItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 64,
        zIndex: 10,
    },
    activeIndicator: {
        position: 'absolute',
        left: 0,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 44,
        height: 44,
        zIndex: 20,
    }
});
