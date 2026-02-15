import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext({});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDarkMode(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
    isDark: isDarkMode,
    colors: {
      background: isDarkMode ? '#0f172a' : '#ffffff',
      surface: isDarkMode ? '#1e293b' : '#ffffff',
      text: isDarkMode ? '#ffffff' : '#0f172a',
      textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
      border: isDarkMode ? '#334155' : '#f1f5f9',
      primary: isDarkMode ? '#818cf8' : '#4f46e5',
      success: isDarkMode ? '#34d399' : '#10b981',
      warning: isDarkMode ? '#fbbf24' : '#f59e0b',
      error: isDarkMode ? '#f87171' : '#ef4444',
    },
  };

  return (
    <ThemeContext.Provider value={{
      ...theme,
      toggleTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};