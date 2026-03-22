import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { RefreshCw, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import Animated, { 
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Button from '../common/Button';

const CONFETTI_COLORS = ['#f59e0b', '#10b981', '#6366f1', '#f43f5e', '#ec4899', '#8b5cf6'];

const ConfettiPiece = ({ startX, delay, color, size }) => {
  const y = useSharedValue(-20);
  const rot = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(delay, withTiming(280, { duration: 2000 + Math.random() * 1000, easing: Easing.out(Easing.quad) }));
    rot.value = withDelay(delay, withTiming(360 * (2 + Math.random() * 2), { duration: 2500 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: startX,
    top: y.value,
    width: size,
    height: size,
    backgroundColor: color,
    borderRadius: size > 8 ? 2 : 0,
    transform: [{ rotate: `${rot.value}deg` }],
  }));

  return <Animated.View style={style} />;
};

const SpinWheelGame = ({ onClose, segments, onWin, merchant }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const rotation = useSharedValue(0);

  // Generate confetti data (static, no hooks)
  const confettiData = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      x: Math.random() * 224,
      size: 5 + Math.random() * 7,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 800,
    }));
  }, []);

  const prizes = segments || [];
  const radius = 112;
  const center = radius;

  const wheelData = useMemo(() => {
    if (prizes.length === 0) return [];
    let cumulativePercent = 0;
    return prizes.map((prize, index) => {
      const percent = 1 / prizes.length;

      const startAngle = cumulativePercent * 2 * Math.PI;
      const endAngle = (cumulativePercent + percent) * 2 * Math.PI;

      const startX = Math.cos(startAngle);
      const startY = Math.sin(startAngle);
      const endX = Math.cos(endAngle);
      const endY = Math.sin(endAngle);

      const largeArcFlag = percent > 0.5 ? 1 : 0;

      const pathData = [
        `M ${center} ${center}`,
        `L ${center + radius * startX} ${center + radius * startY}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${center + radius * endX} ${center + radius * endY}`,
        'Z',
      ].join(' ');

      const path = Skia.Path.MakeFromSVGString(pathData);

      const midAngle = startAngle + (endAngle - startAngle) / 2;
      const textRadius = radius * 0.65;
      const textX = center + textRadius * Math.cos(midAngle);
      const textY = center + textRadius * Math.sin(midAngle);
      const rotationAngle = (midAngle * 180 / Math.PI) + 90;

      cumulativePercent += percent;

      return {
        path,
        color: prize.color,
        label: prize.label,
        textX,
        textY,
        rotationAngle,
        key: index
      };
    }).filter(w => w.path !== null);
  }, [prizes, center, radius]);

  const handleSpinEnd = (segmentOffset) => {
    // Defer state updates to avoid React reconciler conflict with scheduleOnRN
    setTimeout(() => {
      setSpinning(false);
      const wonPrize = prizes[segmentOffset];
      setResult(wonPrize);
      setShowConfetti(true);
      // Delay onWin slightly so confetti is visible before celebration modal
      setTimeout(() => {
        if (onWin) onWin(wonPrize);
      }, 500);
    }, 0);
  };

  const handleSpin = () => {
    if (spinning || result) return;
    setSpinning(true);
    setShowConfetti(false);

    const segmentAngle = 360 / prizes.length;
    const randomSegment = Math.floor(Math.random() * prizes.length);

    const extraSpins = 360 * 5;
    const targetAngle = extraSpins + (360 - (randomSegment * segmentAngle)) - (segmentAngle / 2);

    rotation.value = withTiming(targetAngle, {
      duration: 3500,
      easing: Easing.bezier(0.25, 0.1, 0.1, 1),
    }, (finished) => {
      if (finished) {
        scheduleOnRN(handleSpinEnd, randomSegment);
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value - 90}deg` }]
    };
  });

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={20} color="#475569" />
        </TouchableOpacity>

        <View style={styles.header}>
          {merchant && (
             <View style={styles.merchantHeader}>
               <Image source={{ uri: merchant.image }} style={styles.merchantBadgeAvatar} />
               <Text style={styles.merchantBadgeName}>{merchant.name}</Text>
             </View>
          )}
          <Text style={styles.title}>Wheel of Fortune</Text>
          <Text style={styles.subtitle}>Spin to win exclusive rewards!</Text>
        </View>

        <View style={styles.wheelContainer}>
          <View style={styles.pointer}>
            <View style={styles.triangle} />
          </View>

          <Animated.View style={[styles.wheel, animatedStyle]}>
            <Canvas style={StyleSheet.absoluteFill}>
              {wheelData.map((w) => (
                <Path key={`path-${w.key}`} path={w.path} color={w.color} style="fill" />
              ))}
              {wheelData.map((w) => (
                <Path key={`stroke-${w.key}`} path={w.path} color="#ffffff" style="stroke" strokeWidth={2} />
              ))}
            </Canvas>

            <View style={StyleSheet.absoluteFill}>
              {wheelData.map((w) => (
                <View
                  key={`text-${w.key}`}
                  style={{
                    position: 'absolute',
                    left: w.textX - 50,
                    top: w.textY - 10,
                    width: 100,
                    height: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    transform: [{ rotate: `${w.rotationAngle}deg` }]
                  }}
                >
                  <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: 'bold' }}>{w.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.centerCircle}>
              <RefreshCw size={20} color="#cbd5e1" />
            </View>
          </Animated.View>

          {/* Confetti Layer */}
          {showConfetti && (
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden', pointerEvents: 'none' }]}>
              {confettiData.map((c, i) => (
                <ConfettiPiece key={i} startX={c.x} delay={c.delay} color={c.color} size={c.size} />
              ))}
            </View>
          )}
        </View>

        {result ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Result</Text>
            <Text style={styles.resultPrize}>{result.label}</Text>
            <Button onPress={onClose} variant="merchant" style={styles.collectButton}>
              Collect & Close
            </Button>
          </View>
        ) : (
          <Button
            onPress={handleSpin}
            disabled={spinning}
            variant="primary"
            style={styles.spinButton}
          >
            {spinning ? 'Spinning...' : 'Spin Now'}
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 60,
  },
  modal: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: 380,
    borderRadius: 32,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    zIndex: 1,
  },
  header: {
    marginBottom: 20,
    marginTop: 8,
    alignItems: 'center',
  },
  merchantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  merchantBadgeAvatar: {
    width: 20,
    height: 20,
    borderRadius: 6,
  },
  merchantBadgeName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  wheelContainer: {
    width: 224,
    height: 224,
    marginBottom: 32,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointer: {
    position: 'absolute',
    top: -12,
    zIndex: 20,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#f43f5e',
  },
  wheel: {
    width: 224,
    height: 224,
    borderRadius: 112,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerCircle: {
    position: 'absolute',
    width: 48,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f1f5f9',
    zIndex: 10,
  },
  resultContainer: {
    alignItems: 'center',
    width: '100%',
  },
  resultLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  resultPrize: {
    fontSize: 30,
    fontWeight: '900',
    color: '#4f46e5',
    marginBottom: 24,
    textAlign: 'center',
  },
  collectButton: {
    width: '100%',
  },
  spinButton: {
    width: '100%',
    paddingVertical: 16,
  },
});

export default SpinWheelGame;