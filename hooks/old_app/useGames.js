import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useGames = () => {
  const [dailySpinUsed, setDailySpinUsed] = useState(false);
  const [dailyScratchUsed, setDailyScratchUsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadGameState = useCallback(async () => {
    try {
      const spinUsed = await AsyncStorage.getItem('@dandan_spin_used');
      const scratchUsed = await AsyncStorage.getItem('@dandan_scratch_used');
      
      setDailySpinUsed(spinUsed === 'true');
      setDailyScratchUsed(scratchUsed === 'true');
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
  }, []);

  const useSpin = useCallback(async () => {
    setDailySpinUsed(true);
    await AsyncStorage.setItem('@dandan_spin_used', 'true');
  }, []);

  const useScratch = useCallback(async () => {
    setDailyScratchUsed(true);
    await AsyncStorage.setItem('@dandan_scratch_used', 'true');
  }, []);

  const resetDailyGames = useCallback(async () => {
    setDailySpinUsed(false);
    setDailyScratchUsed(false);
    await AsyncStorage.setItem('@dandan_spin_used', 'false');
    await AsyncStorage.setItem('@dandan_scratch_used', 'false');
  }, []);

  return {
    dailySpinUsed,
    dailyScratchUsed,
    loading,
    loadGameState,
    useSpin,
    useScratch,
    resetDailyGames,
  };
};