import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const Input = ({ 
  label, 
  icon: Icon, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  autoFocus 
}) => (
  <View style={styles.container}>
    {label && <Text style={styles.label}>{label}</Text>}
    <View style={styles.inputContainer}>
      {Icon && (
        <View style={styles.iconContainer}>
          <Icon size={18} color="#94a3b8" />
        </View>
      )}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChange}
        autoFocus={autoFocus}
        secureTextEntry={type === "password"}
        keyboardType={type === "number" ? "numeric" : "default"}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginLeft: 8,
    marginBottom: 4,
    letterSpacing: 1,
  },
  inputContainer: {
    position: 'relative',
  },
  iconContainer: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
  },
  input: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 16,
    paddingVertical: 14,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 14,
    color: '#0f172a',
  },
});

export default Input;