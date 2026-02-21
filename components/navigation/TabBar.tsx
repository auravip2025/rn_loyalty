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

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    const containerWidth = useSharedValue(SCREEN_WIDTH - 40);
    const buttonWidth = useDerivedValue(() => containerWidth.value / state.routes.length);

    const INDICATOR_SIZE = 64;
    const TABBAR_HEIGHT = 64;
    const JET_OUT_AMOUNT = 24;
    const INDICATOR_TOP = -JET_OUT_AMOUNT;

    const onTabbarLayout = (e: LayoutChangeEvent) => {
        containerWidth.value = e.nativeEvent.layout.width;
    };

    // This is the source of truth for the spring motion
    const tabPositionX = useSharedValue(state.index);

    useEffect(() => {
        tabPositionX.value = withSpring(state.index, {
            damping: 18,
            stiffness: 120,
            mass: 0.8,
        });
    }, [state.index]);

    const animatedIndicatorStyle = useAnimatedStyle(() => {
        const x = tabPositionX.value * buttonWidth.value;
        const centerOffset = (buttonWidth.value - INDICATOR_SIZE) / 2;
        return {
            transform: [{ translateX: x + centerOffset }],
        };
    });

    return (
        <View onLayout={onTabbarLayout} style={[styles.tabbar, { bottom: insets.bottom + 10 }]}>
            {/* The sliding background indicator */}
            <Animated.View style={[
                styles.activeIndicator,
                {
                    width: INDICATOR_SIZE,
                    height: INDICATOR_SIZE,
                    borderRadius: INDICATOR_SIZE / 2,
                    top: INDICATOR_TOP,
                },
                animatedIndicatorStyle
            ]} />

            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

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
    );
}

function TabIcon({ index, tabPositionX, icon, indicatorTop, indicatorSize, tabbarHeight }: any) {
    // const targetY = indicatorTop + (indicatorSize / 2) - (tabbarHeight / 2);
    const targetY = indicatorTop + Math.abs(24 / 4);
    console.log("indicatorTop", indicatorTop, "targetY", targetY, "indicatorSize", indicatorSize, "tabbarHeight", tabbarHeight);

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

        const scale = interpolate(progress, [0, 1], [1, 1.25]);
        const translateY = interpolate(progress, [0, 1], [0, targetY]);
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
    tabbar: {
        position: 'absolute',
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        height: 64,
        borderRadius: 32,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowRadius: 20,
                shadowOpacity: 0.1,
            },
            android: {
                elevation: 10,
            },
        }),
        borderWidth: 1,
        borderColor: 'rgba(241, 245, 249, 0.8)',
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
        backgroundColor: '#4f46e5',
        left: 0,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 12,
        shadowOpacity: 0.4,
        elevation: 8,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 44,
        height: 44,
        zIndex: 20,
    }
});
