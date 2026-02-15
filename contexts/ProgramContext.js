import React, { createContext, useState, useContext } from 'react';
import { RefreshCw, Ticket, Star, QrCode, Percent, Crown, Users } from 'lucide-react-native';

const ProgramContext = createContext({});

export const usePrograms = () => useContext(ProgramContext);

export const ProgramProvider = ({ children }) => {
  const [programs, setPrograms] = useState([
    { 
      id: 1, 
      name: 'Wheel of Fortune', 
      desc: 'Daily spin for bonus points', 
      active: true, 
      color: 'amber', 
      icon: RefreshCw,
      segments: [
        { label: '50 Pts', color: '#6366f1', type: 'points', value: 50 },
        { label: 'No Luck', color: '#94a3b8', type: 'none', value: 0 },
        { label: '10% Off', color: '#10b981', type: 'discount', value: 10 },
        { label: 'Free Tea', color: '#f59e0b', type: 'item', value: 'Tea' },
        { label: '2x Pts', color: '#ec4899', type: 'multiplier', value: 2 },
        { label: 'Try Again', color: '#94a3b8', type: 'none', value: 0 },
      ]
    },
    { 
      id: 2, 
      name: 'Scratch & Win', 
      desc: 'Gamified chance to win discounts', 
      active: true, 
      color: 'rose', 
      icon: Ticket,
      segments: [
        { label: '100 Pts', color: '#6366f1', type: 'points', value: 100 },
        { label: '5% Off', color: '#10b981', type: 'discount', value: 5 },
        { label: 'Free Coffee', color: '#f59e0b', type: 'item', value: 'Coffee' },
        { label: 'Better Luck Next Time', color: '#94a3b8', type: 'none', value: 0 },
      ]
    },
    { 
      id: 3, 
      name: 'Loyalty Points', 
      desc: '1 pt per $1 spend', 
      active: true, 
      color: 'indigo', 
      icon: Star 
    },
    { 
      id: 4, 
      name: 'Digital Stamps', 
      desc: 'Buy 9, Get 1 Free', 
      active: true, 
      color: 'emerald', 
      icon: QrCode 
    },
    { 
      id: 5, 
      name: 'Member Discount', 
      desc: 'Flat 10% off for members', 
      active: false, 
      color: 'blue', 
      icon: Percent 
    },
    { 
      id: 6, 
      name: 'Tiered Loyalty', 
      desc: 'Bronze, Silver, Gold benefits', 
      active: true, 
      color: 'purple', 
      icon: Crown 
    },
    { 
      id: 7, 
      name: 'Referral Engine', 
      desc: 'Give $5, Get $5', 
      active: true, 
      color: 'indigo', 
      icon: Users 
    },
  ]);

  const updateProgram = (updatedProgram) => {
    setPrograms(prev => 
      prev.map(p => p.id === updatedProgram.id ? updatedProgram : p)
    );
  };

  const addProgram = (newProgram) => {
    setPrograms(prev => [...prev, { ...newProgram, id: Date.now() }]);
  };

  return (
    <ProgramContext.Provider value={{
      programs,
      updateProgram,
      addProgram,
    }}>
      {children}
    </ProgramContext.Provider>
  );
};