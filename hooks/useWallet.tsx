import { useWalletStore } from '@/store/walletStore';
import { useActiveAccount, useActiveWallet } from 'thirdweb/react';

/**
 * Custom hook that combines Thirdweb's wallet hooks with our Zustand store
 * Provides a unified interface for wallet operations
 */
export const useWallet = () => {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  
  const {
    isConnected,
    address,
    walletType,
    email,
    walletId,
    chainId,
    isTransactionPending,
    lastTransactionHash,
    setTransactionPending,
    setLastTransactionHash,
    updateChain,
  } = useWalletStore();

  return {
    // Connection state
    isConnected: isConnected && !!account && !!wallet,
    account,
    wallet,
    
    // Stored wallet data
    address,
    walletType,
    email,
    walletId,
    chainId,
    
    // Transaction state
    isTransactionPending,
    lastTransactionHash,
    
    // Helper functions
    isInAppWallet: walletType === 'inApp',
    hasEmail: !!email,
    shortAddress: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null,
    
    // Actions
    setTransactionPending,
    setLastTransactionHash,
    updateChain,
  };
};

/**
 * Hook to check if user has a connected wallet
 */
export const useIsWalletConnected = () => {
  const { isConnected } = useWallet();
  return isConnected;
};

/**
 * Hook to get wallet address with loading state
 */
export const useWalletAddress = () => {
  const { address, isConnected } = useWallet();
  return {
    address,
    isLoading: !isConnected,
    shortAddress: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null,
  };
};
