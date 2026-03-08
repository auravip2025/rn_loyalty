import React, { createContext, useContext } from 'react';
import { DEDUCT_POINTS, EARN_POINTS, GET_WALLET, useMutation, useQuery } from '../api/client';

const WalletContext = createContext({});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const { data, loading, refetch } = useQuery(GET_WALLET);
  const [deductMutation] = useMutation(DEDUCT_POINTS);
  const [earnMutation] = useMutation(EARN_POINTS);

  const balance = data?.wallet?.balance || 0;
  const transactions = data?.wallet?.transactions || [];

  const deductPoints = async (amount, merchant) => {
    // Optimistic UI could be done here, but let's emulate network resolving
    await deductMutation({ variables: { amount, merchant } });
    await refetch();
    // In our mock, the transaction is just created under the hood
    // so returning a mock transaction to fulfill legacy promises
    return {
      id: Date.now(),
      merchant,
      amount,
      type: 'spend',
      date: 'Just now',
    };
  };

  const earnPoints = async (amount, merchant) => {
    await earnMutation({ variables: { amount, merchant } });
    await refetch();
    return {
      id: Date.now(),
      merchant,
      amount,
      type: 'earn',
      date: 'Just now',
    };
  };

  return (
    <WalletContext.Provider value={{
      balance,
      transactions,
      deductPoints,
      earnPoints,
      loading
    }}>
      {children}
    </WalletContext.Provider>
  );
};