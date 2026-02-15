import { useState, useCallback } from 'react';

export const useTransactions = (initialTransactions = []) => {
  const [transactions, setTransactions] = useState(initialTransactions);

  const addTransaction = useCallback((transaction) => {
    setTransactions(prev => [{
      id: Date.now(),
      ...transaction,
      date: transaction.date || new Date().toISOString(),
    }, ...prev]);
  }, []);

  const getTransactionsByType = useCallback((type) => {
    return transactions.filter(t => t.type === type);
  }, [transactions]);

  const getTransactionsByMerchant = useCallback((merchant) => {
    return transactions.filter(t => 
      t.merchant.toLowerCase().includes(merchant.toLowerCase())
    );
  }, [transactions]);

  const getTransactionsByDateRange = useCallback((startDate, endDate) => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date >= startDate && date <= endDate;
    });
  }, [transactions]);

  const getTotalEarned = useCallback(() => {
    return transactions
      .filter(t => t.type === 'earn')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getTotalSpent = useCallback(() => {
    return transactions
      .filter(t => t.type === 'spend')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  return {
    transactions,
    setTransactions,
    addTransaction,
    getTransactionsByType,
    getTransactionsByMerchant,
    getTransactionsByDateRange,
    getTotalEarned,
    getTotalSpent,
  };
};