import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Signal, Wifi, Battery } from 'lucide-react-native';

const StatusBar = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{time}</Text>
      <View style={styles.icons}>
        <Signal size={14} color="#0f172a" />
        <Wifi size={14} color="#0f172a" />
        <Battery size={18} color="#0f172a" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
    width: '100%',
    backgroundColor: '#ffffff',
    zIndex: 50,
    flexShrink: 0,
  },
  time: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

export default StatusBar;