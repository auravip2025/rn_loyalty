import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { X, Trophy, Eraser } from 'lucide-react-native';
import Button from '../common/Button';

const ScratchCardGame = ({ onClose, outcomes, onWin }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [prize, setPrize] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const random = Math.floor(Math.random() * outcomes.length);
    setPrize(outcomes[random]);
  }, [outcomes]);

  const handleReveal = () => {
    if (isRevealed) return;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 700,
      useNativeDriver: true,
    }).start(() => {
      setIsRevealed(true);
      if (onWin && prize) onWin(prize);
    });
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={20} color="#475569" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Scratch & Win</Text>
          <Text style={styles.subtitle}>Tap the card to see what you won!</Text>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.prizeContainer}>
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

          <TouchableOpacity activeOpacity={1} onPress={handleReveal} style={styles.scratchLayerContainer}>
            <Animated.View
              style={[
                styles.scratchLayer,
                { opacity: fadeAnim }
              ]}
            >
              <Text style={styles.scratchText}>Tap to Scratch</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {isRevealed ? (
          <Button onPress={onClose} variant="merchant" style={styles.collectButton}>
            Collect
          </Button>
        ) : (
          <Button
            onPress={handleReveal}
            variant="primary"
            style={styles.revealButton}
          >
            Reveal Prize
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
    backdropFilter: 'blur(8px)',
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
  cardContainer: {
    width: 300,
    height: 150,
    marginBottom: 24,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    backgroundColor: '#f8fafc',
  },
  prizeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  trophyIcon: {
    marginBottom: 8,
  },
  prizeText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#4f46e5',
  },
  scratchLayerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  scratchLayer: {
    flex: 1,
    backgroundColor: '#94a3b8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scratchText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  collectButton: {
    width: '100%',
  },
  revealButton: {
    width: '100%',
  },
});

export default ScratchCardGame;