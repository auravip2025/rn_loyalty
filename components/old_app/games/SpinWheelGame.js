import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { RefreshCw, X } from 'lucide-react-native';
import Svg, { Path, G, Text as SvgText, TSpan } from 'react-native-svg';
import Button from '../common/Button';

const SpinWheelGame = ({ onClose, segments, onWin }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const prizes = segments || [];
  const radius = 112; // consistent with wheel style size
  const center = radius;

  const handleSpin = () => {
    if (spinning || result) return;
    setSpinning(true);

    const segmentAngle = 360 / prizes.length;
    const randomSegment = Math.floor(Math.random() * prizes.length);
    // Add extra spins (5 full rotations) + target segment
    // Note: We need to account for the pointer position (top) vs 0 degrees (right)
    // React Native coordinate system: 0 deg is right (3 o'clock). Pointer is at top (12 o'clock, -90deg).
    // So to land on a segment, we rotate the wheel such that the segment is at -90deg.

    const extraSpins = 360 * 5;
    const targetAngle = extraSpins + (360 - (randomSegment * segmentAngle)) - (segmentAngle / 2);

    Animated.timing(rotateAnim, {
      toValue: targetAngle,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      setSpinning(false);
      setResult(prizes[randomSegment]);
      if (onWin) onWin(prizes[randomSegment]);
    });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const getCoordinates = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const renderWheel = () => {
    let cumulativePercent = 0;

    return prizes.map((prize, index) => {
      const percent = 1 / prizes.length;

      const [startX, startY] = getCoordinates(cumulativePercent);
      cumulativePercent += percent;
      const [endX, endY] = getCoordinates(cumulativePercent);

      const largeArcFlag = percent > 0.5 ? 1 : 0;

      const pathData = [
        `M ${center} ${center}`,
        `L ${center + radius * startX} ${center + radius * startY}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${center + radius * endX} ${center + radius * endY}`,
        'Z',
      ].join(' ');

      // Calculate text position (mid-angle)
      const midAngle = (cumulativePercent - (percent / 2)) * 2 * Math.PI;
      const textRadius = radius * 0.65;
      const textX = center + textRadius * Math.cos(midAngle);
      const textY = center + textRadius * Math.sin(midAngle);

      // Rotation for text to face inward
      const rotationAngle = (midAngle * 180 / Math.PI) + 90; // Adjust +90 to align text

      return (
        <G key={index}>
          <Path d={pathData} fill={prize.color} stroke="#ffffff" strokeWidth="2" />
          <G rotation={rotationAngle} origin={`${textX}, ${textY}`}>
            <SvgText
              x={textX}
              y={textY}
              fill="#ffffff"
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              alignmentBaseline="middle"
            >
              {prize.label}
            </SvgText>
          </G>
        </G>
      );
    });
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={20} color="#475569" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Wheel of Fortune</Text>
          <Text style={styles.subtitle}>Spin to win exclusive rewards!</Text>
        </View>

        <View style={styles.wheelContainer}>
          <View style={styles.pointer}>
            <View style={styles.triangle} />
          </View>

          <Animated.View
            style={[
              styles.wheel,
              { transform: [{ rotate: spin }] }
            ]}
          >
            <Svg height="224" width="224" viewBox="0 0 224 224">
              <G rotation="-90" origin={`${center}, ${center}`}>
                {renderWheel()}
              </G>
            </Svg>

            <View style={styles.centerCircle}>
              <RefreshCw size={20} color="#cbd5e1" />
            </View>
          </Animated.View>
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
    marginBottom: 24,
    marginTop: 8,
    alignItems: 'center',
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
    borderBottomWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#f43f5e',
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