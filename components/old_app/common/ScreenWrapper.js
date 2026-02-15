import React, { forwardRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWrapper = forwardRef(({
    children,
    scroll = false,
    style,
    contentContainerStyle,
    backgroundColor = '#ffffff',
    paddingHorizontal = 24,
    useSafeAreaTop = true,
    useSafeAreaBottom = true,
    bottomPadding = 100, // Standard app bottom padding for tab bar
    ...props
}, ref) => {
    const insets = useSafeAreaInsets();

    const containerStyles = [
        styles.container,
        { backgroundColor },
        useSafeAreaTop && { paddingTop: insets.top },
        style
    ];

    if (scroll) {
        return (
            <ScrollView
                ref={ref}
                style={containerStyles}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingHorizontal },
                    useSafeAreaBottom && { paddingBottom: insets.bottom + bottomPadding },
                    contentContainerStyle
                ]}
                showsVerticalScrollIndicator={false}
                {...props}
            >
                {children}
            </ScrollView>
        );
    }

    return (
        <View
            ref={ref}
            style={[containerStyles, useSafeAreaBottom && { paddingBottom: insets.bottom }]}
            {...props}
        >
            <View style={[styles.flex, { paddingHorizontal }]}>
                {children}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    flex: {
        flex: 1,
    }
});

export default ScreenWrapper;
