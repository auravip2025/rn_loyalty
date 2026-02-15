import {
  Canvas,
  Group,
  Path,
  Rect,
  Skia
} from "@shopify/react-native-skia";
import { Trophy, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedReaction, useSharedValue, withTiming } from 'react-native-reanimated';
import Button from '../common/Button';

const CARD_WIDTH = 300;
const CARD_HEIGHT = 150;

const ScratchCardGame = ({ onClose, outcomes, onWin }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [prize, setPrize] = useState(null);

  // Logic state for checking completion
  const scrapedLength = useSharedValue(0);
  const isRevealedSV = useSharedValue(false); // UI thread tracker

  // Skia Values
  const path = useSharedValue(Skia.Path.Make());
  const opacity = useSharedValue(1);

  useEffect(() => {
    const random = Math.floor(Math.random() * outcomes.length);
    setPrize(outcomes[random]);
  }, [outcomes]);

  const handleFullReveal = () => {
    // Fallback for manual button press (still needs to work from JS)
    if (isRevealed) return;
    setIsRevealed(true);
    opacity.value = withTiming(0, { duration: 500 }, (finished) => {
      if (finished && onWin && prize) {
        onWin(prize); // Called from JS thread, safe
      }
    });
  };

  // React to the shared value change on the UI thread
  useAnimatedReaction(
    () => isRevealedSV.value,
    (revealed, prev) => {
      if (revealed && !prev) {
        // 1. Run animation on UI thread
        opacity.value = withTiming(0, { duration: 500 }, (finished) => {
          if (finished) {
            // 2. Call callback on JS thread
            runOnJS(onWin)(prize);
          }
        });

        // 3. Update React state
        runOnJS(setIsRevealed)(true);
      }
    },
    [prize, onWin] // Dependencies to ensure capture
  );

  const panGesture = Gesture.Pan()
    .onStart((g) => {
      if (isRevealedSV.value) return;

      // Create a copy to trigger reactivity
      const p = path.value.copy();
      p.moveTo(g.x, g.y);
      p.lineTo(g.x, g.y);
      path.value = p;
    })
    .onUpdate((g) => {
      if (isRevealedSV.value) return;

      const p = path.value.copy();
      p.lineTo(g.x, g.y);
      path.value = p;

      scrapedLength.value += 5;

      // Check on UI thread
      if (scrapedLength.value > 800) {
        isRevealedSV.value = true;
      }
    });

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={20} color="#475569" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Scratch & Win</Text>
          <Text style={styles.subtitle}>Use your finger to scratch and win!</Text>
        </View>

        <View style={styles.cardWrapper}>
          {/* Prize Layer (Bottom) */}
          <View style={styles.prizeLayer}>
            {prize && (
              <>
                <Trophy
                  size={32}
                  color={prize.type === 'none' ? '#94a3b8' : '#f59e0b'}
                  style={styles.trophyIcon}
                />
                <Text style={styles.prizeText}>{prize.label}</Text>
              </>
            )}
          </View>

          {/* Scratch Layer (Top - Skia Canvas) */}
          <View style={styles.scratchLayer}>
            <GestureDetector gesture={panGesture}>
              <Canvas
                style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
              >
                <Group opacity={opacity}>
                  {/* The gray cover */}
                  <Rect x={0} y={0} width={CARD_WIDTH} height={CARD_HEIGHT} color="#94a3b8" />

                  {/* The Scratch Path (Eraser) */}
                  <Path
                    path={path}
                    color="transparent"
                    style="stroke"
                    strokeWidth={40}
                    strokeCap="round"
                    strokeJoin="round"
                    blendMode="clear" // This punches through the Rect to show transparency
                  />
                </Group>
              </Canvas>
            </GestureDetector>

            {/* Instruction Overlay */}
            {!isRevealed && scrapedLength.value < 50 && (
              <View style={styles.instructionOverlay} pointerEvents="none">
                <Text style={styles.instructionText}>Scratch Here</Text>
              </View>
            )}
          </View>
        </View>

        {isRevealed ? (
          <Button onPress={onClose} variant="merchant" style={styles.collectButton}>
            Collect Prize
          </Button>
        ) : (
          <Button
            onPress={handleFullReveal}
            variant="secondary"
            style={styles.revealButton}
          >
            Reveal All
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
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginBottom: 24,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    backgroundColor: '#f8fafc',
  },
  prizeLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  scratchLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  instructionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  instructionText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  trophyIcon: {
    marginBottom: 8,
  },
  prizeText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#4f46e5',
  },
  collectButton: {
    width: '100%',
  },
  revealButton: {
    width: '100%',
  },
});

export default ScratchCardGame;