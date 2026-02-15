import React, { createContext, useState, useContext } from 'react';

const WalletContext = createContext({});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const [balance, setBalance] = useState(12450);
  const [transactions, setTransactions] = useState([
    { 
      id: 1, 
      merchant: 'The Coffee House', 
      amount: 50, 
      type: 'earn', 
      date: 'Today, 10:23 AM' 
    },
    { 
      id: 2, 
      merchant: 'Urban Outfitters', 
      amount: 1200, 
      type: 'spend', 
      date: 'Yesterday' 
    },
    { 
      id: 3, 
      merchant: 'Green Grocer', 
      amount: 350, 
      type: 'earn', 
      date: 'Oct 24' 
    },
  ]);

  const deductPoints = (amount, merchant) => {
    setBalance(prev => prev - amount);
    
    const transaction = {
      id: Date.now(),
      merchant,
      amount,
      type: 'spend',
      date: 'Just now',
    };
    
    setTransactions(prev => [transaction, ...prev]);
    return transaction;
  };

  const earnPoints = (amount, merchant) => {
    setBalance(prev => prev + amount);
    
    const transaction = {
      id: Date.now(),
      merchant,
      amount,
      type: 'earn',
      date: 'Just now',
    };
    
    setTransactions(prev => [transaction, ...prev]);
    return transaction;
  };

  return (
    <WalletContext.Provider value={{
      balance,
      transactions,
      deductPoints,
      earnPoints,
    }}>
      {children}
    </WalletContext.Provider>
  );
};