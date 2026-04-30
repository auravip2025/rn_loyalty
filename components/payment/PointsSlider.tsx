import React, { useCallback, useRef } from 'react';
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
  LayoutChangeEvent,
} from 'react-native';

interface PointsSliderProps {
  value: number;         // current points to use
  min: number;           // usually 0
  max: number;           // min(balance, rewardPointsCost)
  step?: number;         // snap increment, default 50
  cashRequired: number;  // computed SGD amount for display
  /** SGD value of one token. Derived from reward price/points ratio.
   *  Defaults to 1/500 (platform standard: 500 tokens = $1). */
  tokenRate?: number;
  onChange: (value: number) => void;
}

const PointsSlider: React.FC<PointsSliderProps> = ({
  value,
  min,
  max,
  step = 50,
  cashRequired,
  tokenRate = 1 / 500,
  onChange,
}) => {
  const trackWidth = useRef(0);

  const pct = max === 0 ? 0 : Math.max(0, Math.min(1, (value - min) / (max - min)));

  const clampAndSnap = useCallback((raw: number) => {
    const clamped = Math.max(min, Math.min(max, raw));
    const snapped = Math.round(clamped / step) * step;
    return Math.max(min, Math.min(max, snapped));
  }, [min, max, step]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const x = e.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, x / trackWidth.current));
        onChange(clampAndSnap(min + ratio * (max - min)));
      },
      onPanResponderMove: (e) => {
        const x = e.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, x / trackWidth.current));
        onChange(clampAndSnap(min + ratio * (max - min)));
      },
    })
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
  };

  const type = value >= max && max > 0
    ? 'pure_points'
    : value > 0
      ? 'hybrid'
      : 'cash_only';

  const pointsValue = parseFloat((value * tokenRate).toFixed(2));

  return (
    <View style={styles.container}>
      {/* Track */}
      <View style={styles.trackWrapper} onLayout={onLayout} {...panResponder.panHandlers}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct * 100}%` }]} />
        </View>
        {/* Thumb */}
        <View style={[styles.thumb, { left: `${pct * 100}%` }]} />
      </View>

      {/* Labels */}
      <View style={styles.labels}>
        <Text style={styles.labelText}>0 pts</Text>
        <Text style={styles.labelText}>{max.toLocaleString()} pts</Text>
      </View>

      {/* Live breakdown */}
      <View style={styles.breakdown}>
        <View style={styles.breakdownRow}>
          <View style={[styles.dot, { backgroundColor: '#f59e0b' }]} />
          <Text style={styles.breakdownKey}>Points</Text>
          <Text style={styles.breakdownVal}>
            {value.toLocaleString()} dandan
            <Text style={styles.breakdownSub}> (≈ SGD {pointsValue.toFixed(2)})</Text>
          </Text>
        </View>
        {cashRequired > 0 && (
          <View style={styles.breakdownRow}>
            <View style={[styles.dot, { backgroundColor: '#4f46e5' }]} />
            <Text style={styles.breakdownKey}>Cash top-up</Text>
            <Text style={[styles.breakdownVal, { color: '#4f46e5' }]}>
              SGD {cashRequired.toFixed(2)}
            </Text>
          </View>
        )}
        {type !== 'pure_points' && cashRequired > 0 && (
          <Text style={styles.hint}>
            Remainder paid via PayNow / PayLah / Card
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  trackWrapper: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#f59e0b',
    marginLeft: -11,
    top: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  labelText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  breakdown: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginTop: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownKey: {
    flex: 1,
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  breakdownVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#f59e0b',
  },
  breakdownSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94a3b8',
  },
  hint: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 2,
  },
});

export default PointsSlider;
