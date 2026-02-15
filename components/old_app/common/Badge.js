import React from 'react';
import { Text, StyleSheet } from 'react-native';

const Badge = ({ children, color = "indigo" }) => {
  const getColorStyles = () => {
    const colors = {
      indigo: { bg: '#eef2ff', text: '#4f46e5', border: '#e0e7ff' },
      emerald: { bg: '#ecfdf5', text: '#059669', border: '#d1fae5' },
      amber: { bg: '#fffbeb', text: '#d97706', border: '#fef3c7' },
      rose: { bg: '#fff1f2', text: '#e11d48', border: '#ffe4e6' },
      purple: { bg: '#faf5ff', text: '#9333ea', border: '#f3e8ff' },
      blue: { bg: '#eff6ff', text: '#2563eb', border: '#dbeafe' },
    };
    return colors[color] || colors.indigo;
  };

  const colorStyle = getColorStyles();

  return (
    <Text style={[styles.badge, { 
      backgroundColor: colorStyle.bg,
      color: colorStyle.text,
      borderColor: colorStyle.border 
    }]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    borderWidth: 1,
    overflow: 'hidden',
  },
});

export default Badge;