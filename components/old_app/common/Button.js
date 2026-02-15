// In src/components/common/Button.js - add loading prop support
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const Button = ({
  children,
  onPress,
  variant = "primary",
  style,
  disabled = false,
  loading = false
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      case 'ghost':
        return styles.ghost;
      case 'merchant':
        return styles.merchant;
      default:
        return styles.primary;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.base, getVariantStyles(), (disabled || loading) && styles.disabled, style]}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'merchant' ? '#ffffff' : '#0f172a'} />
      ) : (
        React.Children.map(children, (child) => {
          if (typeof child === 'string' || typeof child === 'number') {
            return (
              <Text style={[
                styles.text,
                variant === 'ghost' && styles.ghostText,
                variant === 'outline' && styles.outlineText,
                variant === 'secondary' && styles.secondaryText
              ]}>
                {child}
              </Text>
            );
          }
          return child;
        })
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primary: {
    backgroundColor: '#4f46e5',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    backgroundColor: '#f1f5f9',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  merchant: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  ghostText: {
    color: '#475569',
  },
  outlineText: {
    color: '#475569',
  },
  secondaryText: {
    color: '#0f172a',
  },
});

export default Button;