import React from 'react';
import { View, StyleSheet } from 'react-native';

const HomeIndicator = () => (
  <View style={styles.container}>
    <View style={styles.indicator} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
    width: '100%',
    backgroundColor: '#ffffff',
    pointerEvents: 'none',
    flexShrink: 0,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  indicator: {
    width: 128,
    height: 6,
    backgroundColor: '#cbd5e1',
    borderRadius: 999,
    opacity: 0.5,
  },
});

export default HomeIndicator;