import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  
  // Typography
  heading1: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 14,
    color: '#0f172a',
  },
  caption: {
    fontSize: 12,
    color: '#64748b',
  },
  overline: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  // Spacing
  paddingHorizontal: {
    paddingHorizontal: 24,
  },
  paddingVertical: {
    paddingVertical: 24,
  },
  marginBottom: {
    marginBottom: 24,
  },
  
  // Cards
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  // Flex
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  between: {
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Dark mode overrides
  darkBackground: {
    backgroundColor: '#0f172a',
  },
  darkSurface: {
    backgroundColor: '#1e293b',
  },
  darkText: {
    color: '#ffffff',
  },
  darkBorder: {
    borderColor: '#334155',
  },
});

export const darkStyles = {
  background: '#0f172a',
  surface: '#1e293b',
  text: '#ffffff',
  textSecondary: '#94a3b8',
  border: '#334155',
  primary: '#818cf8',
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
};