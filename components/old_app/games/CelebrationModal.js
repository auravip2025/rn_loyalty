import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withTiming, 
    withSpring, 
    withRepeat, 
    withSequence,
    withDelay,
    Easing,
    FadeIn,
    ZoomIn
} from 'react-native-reanimated';
import { Trophy, PartyPopper, Star, X } from 'lucide-react-native';
import Button from '../common/Button';

const { width, height } = Dimensions.get('window');

const ConfettiPiece = ({ index }) => {
    const x = useSharedValue(Math.random() * width);
    const y = useSharedValue(-20);
    const rotation = useSharedValue(0);
    const colors = ['#f59e0b', '#10b981', '#6366f1', '#f43f5e', '#8b5cf6'];
    const color = colors[index % colors.length];

    useEffect(() => {
        const duration = 2000 + Math.random() * 2000;
        y.value = withDelay(index * 50, withTiming(height, { duration }));
        rotation.value = withRepeat(withTiming(360, { duration: 1000 }), -1);
    }, []);

    const style = useAnimatedStyle(() => ({
        position: 'absolute',
        top: y.value,
        left: x.value,
        width: 10,
        height: 10,
        backgroundColor: color,
        borderRadius: 2,
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return <Animated.View style={style} />;
};

const CelebrationModal = ({ visible, prize, merchant, onClose }) => {
    if (!visible || !prize) return null;

    return (
        <View style={StyleSheet.absoluteFill}>
            {/* Dark Overlay */}
            <Animated.View 
                entering={FadeIn.duration(300)}
                style={styles.overlay} 
            >
                {/* Confetti Background */}
                {Array.from({ length: 50 }).map((_, i) => (
                    <ConfettiPiece key={i} index={i} />
                ))}

                {/* Main Popup */}
                <Animated.View 
                    entering={ZoomIn.duration(600).springify()}
                    style={styles.modal}
                >
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={20} color="#94a3b8" />
                    </TouchableOpacity>

                    <View style={styles.iconContainer}>
                        <Animated.View style={styles.trophyWrapper}>
                             <Trophy size={64} color="#f59e0b" />
                        </Animated.View>
                        <Animated.View style={styles.popperLeft}>
                            <PartyPopper size={32} color="#10b981" />
                        </Animated.View>
                        <Animated.View style={styles.popperRight}>
                            <PartyPopper size={32} color="#f43f5e" />
                        </Animated.View>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.merchantTitle}>{merchant?.name}</Text>
                        <Text style={styles.title}>CONGRATULATIONS!</Text>
                        <View style={styles.prizeBox}>
                            <Text style={styles.prizeLabel}>You've won</Text>
                            <Text style={styles.prizeValue}>{prize.label}</Text>
                        </View>
                        <Text style={styles.footerText}>
                            The reward has been added to your wallet!
                        </Text>
                    </View>

                    <Button 
                        variant="primary" 
                        onPress={onClose} 
                        style={styles.collectButton}
                    >
                        Awesome!
                    </Button>
                </Animated.View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        zIndex: 100,
    },
    modal: {
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: 360,
        borderRadius: 32,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.5,
        shadowRadius: 40,
        elevation: 20,
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 999,
    },
    iconContainer: {
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    trophyWrapper: {
        backgroundColor: '#fffbeb',
        padding: 24,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#fef3c7',
    },
    popperLeft: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    popperRight: {
        position: 'absolute',
        top: 0,
        right: 0,
    },
    content: {
        alignItems: 'center',
        marginBottom: 32,
    },
    merchantTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6366f1',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0f172a',
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: -0.5,
    },
    prizeBox: {
        backgroundColor: '#f8fafc',
        paddingHorizontal: 32,
        paddingVertical: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        width: '100%',
        alignItems: 'center',
    },
    prizeLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    prizeValue: {
        fontSize: 32,
        fontWeight: '900',
        color: '#10b981',
        textAlign: 'center',
    },
    footerText: {
        fontSize: 13,
        color: '#94a3b8',
        marginTop: 16,
        textAlign: 'center',
        lineHeight: 20,
    },
    collectButton: {
        width: '100%',
        borderRadius: 16,
        paddingVertical: 18,
    },
});

export default CelebrationModal;
