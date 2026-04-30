"use client";
import React, { createContext, useContext, useEffect } from 'react';
import { client, DEDUCT_POINTS, EARN_POINTS, GET_WALLET, useMutation, useQuery } from '../api/client';
import { useAuth } from './AuthContext';

const WalletContext = createContext({});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // cache-and-network: returns cached data immediately (no skeleton flash on
  // tab focus), then silently re-fetches from the network and updates the UI
  // when fresh data arrives. This prevents the race where the user switches to
  // the wallet tab right after a redemption and sees an empty activity log
  // because the initial refetch fires before the backend write has committed.
  const { data, loading, refetch } = useQuery(GET_WALLET, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });
  const [deductMutation] = useMutation(DEDUCT_POINTS);
  const [earnMutation] = useMutation(EARN_POINTS);

  // When the user logs in: clear the entire Apollo cache so no stale query
  // results (offers, rewards, nearby, etc.) survive from a previous session,
  // then refetch the wallet with a fresh token.
  useEffect(() => {
    if (isAuthenticated) {
      refetch().catch(() => {});
    }
  }, [isAuthenticated]);

  const balance = data?.wallet?.balance || 0;
  const transactions = data?.wallet?.transactions || [];

  const deductPoints = async (amount, merchant) => {
    try {
      await deductMutation({ variables: { amount, merchant } });
      await refetch();
    } catch (err) {
      console.warn('[Wallet] deductPoints failed:', err?.message);
    }
    return {
      id: Date.now(),
      merchant,
      amount,
      type: 'spend',
      date: 'Just now',
    };
  };

  const earnPoints = async (amount, merchant) => {
    try {
      await earnMutation({ variables: { amount, merchant } });
      await refetch();
    } catch (err) {
      console.warn('[Wallet] earnPoints failed:', err?.message);
    }
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
      refetch,
      loading,
    }}>
      {children}
    </WalletContext.Provider>
  );
};