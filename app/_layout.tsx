import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../utils/debugFetch';

import { AuthProvider } from '../contexts/AuthContext';
import { ProgramProvider } from '../contexts/ProgramContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { WalletProvider } from '../contexts/WalletContext';
import { ApolloProvider } from '@apollo/client/react';
import { client } from '../api/client';

import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

export const unstable_settings = {
  anchor: '/',
};

function RootLayoutNav() {
  const { isDark } = useTheme();
  const { isAuthenticated, role, loading } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();

  useEffect(() => {
    console.log('[Navigation Path]', pathname);
  }, [pathname]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Force navigation to the absolute root when unauthenticated 
      // This catches edge cases where the nested layout unmounts too fast
      setTimeout(() => {
        router.replace('/');
      }, 0);
    }
  }, [isAuthenticated, loading]);

  if (loading) return null;

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(customer)" options={{ headerShown: false }} />
        <Stack.Screen name="(merchant)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ApolloProvider client={client}>
          <ThemeProvider>
            <AuthProvider>
              <WalletProvider>
                <ProgramProvider>
                  <RootLayoutNav />
                </ProgramProvider>
              </WalletProvider>
            </AuthProvider>
          </ThemeProvider>
        </ApolloProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#4f46e5',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  }
});
