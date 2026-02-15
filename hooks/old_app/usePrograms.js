import { useContext } from 'react';
import { ProgramContext } from '../context/ProgramContext';

export const usePrograms = () => {
  const context = useContext(ProgramContext);
  if (!context) {
    throw new Error('usePrograms must be used within a ProgramProvider');
  }
  return context;
};