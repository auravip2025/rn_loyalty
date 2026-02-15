import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { X, Coffee } from 'lucide-react-native';
import Button from '../common/Button';
import Badge from '../common/Badge';

const StampCardModal = ({ onClose, program }) => {
  const totalStamps = 10;
  const currentStamps = 6;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={20} color="#475569" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>{program.name}</Text>
          <Text style={styles.subtitle}>Collect stamps to redeem rewards!</Text>
        </View>

        <View style={styles.grid}>
          {Array.from({ length: totalStamps }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.stamp,
                i < currentStamps ? styles.stampCollected : styles.stampEmpty
              ]}
            >
              {i < currentStamps ? (
                <Coffee size={20} color="#059669" fill="#10b981" />
              ) : (
                <Text style={styles.stampNumber}>{i + 1}</Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Badge color="indigo">{currentStamps}/{totalStamps}</Badge>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(currentStamps / totalStamps) * 100}%` }
              ]}
            />
          </View>

          <Text style={styles.progressText}>
            Buy {totalStamps - currentStamps} more coffees to get a{' '}
            <Text style={styles.progressHighlight}>Free Pastry</Text>!
          </Text>
        </View>

        <Button onPress={onClose} variant="primary" style={styles.button}>
          Got it
        </Button>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
    width: '100%',
  },
  stamp: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  stampCollected: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  stampEmpty: {
    borderColor: '#e2e8f0',
  },
  stampNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#cbd5e1',
  },
  progressCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
  },
  progressHighlight: {
    fontWeight: 'bold',
    color: '#0f172a',
  },
  button: {
    width: '100%',
  },
});

export default StampCardModal;