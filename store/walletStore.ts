import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WalletState {
  // Wallet connection state
  isConnected: boolean;
  address: string | null;
  walletType: string | null;
  email: string | null;
  
  // Wallet instance and account data
  walletId: string | null;
  chainId: number | null;
  
  // Transaction state
  isTransactionPending: boolean;
  lastTransactionHash: string | null;
  
  // Actions
  setWalletConnected: (data: {
    address: string;
    walletType: string;
    walletId: string;
    chainId: number;
    email?: string;
  }) => void;
  setWalletDisconnected: () => void;
  setEmail: (email: string | null) => void;
  setTransactionPending: (pending: boolean) => void;
  setLastTransactionHash: (hash: string | null) => void;
  updateChain: (chainId: number) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      address: null,
      walletType: null,
      email: null,
      walletId: null,
      chainId: null,
      isTransactionPending: false,
      lastTransactionHash: null,

      // Actions
      setWalletConnected: (data) => {
        console.log('💾 Storing wallet connection:', data.address.slice(0, 6) + '...');
        set({
          isConnected: true,
          address: data.address,
          walletType: data.walletType,
          walletId: data.walletId,
          chainId: data.chainId,
          email: data.email || null,
        });
      },

      setWalletDisconnected: () => {
        console.log('💾 Clearing wallet connection');
        set({
          isConnected: false,
          address: null,
          walletType: null,
          email: null,
          walletId: null,
          chainId: null,
          isTransactionPending: false,
          lastTransactionHash: null,
        });
      },

      setEmail: (email) => set({ email }),

      setTransactionPending: (pending) => set({ 
        isTransactionPending: pending 
      }),

      setLastTransactionHash: (hash) => set({ 
        lastTransactionHash: hash,
        isTransactionPending: false,
      }),

      updateChain: (chainId) => set({ chainId }),
    }),
    {
      name: 'wallet-store', // AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage), // Use AsyncStorage instead of localStorage
      // Only persist essential data, not temporary states
      partialize: (state) => ({
        isConnected: state.isConnected,
        address: state.address,
        walletType: state.walletType,
        email: state.email,
        walletId: state.walletId,
        chainId: state.chainId,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('💾 Wallet store rehydrated:', state?.address ? 'Connected' : 'Disconnected');
      },
    }
  )
);

// Selector hooks for specific data
export const useWalletAddress = () => useWalletStore((state) => state.address);
export const useIsWalletConnected = () => useWalletStore((state) => state.isConnected);
export const useWalletType = () => useWalletStore((state) => state.walletType);
export const useWalletEmail = () => useWalletStore((state) => state.email);
export const useTransactionState = () => useWalletStore((state) => ({
  isPending: state.isTransactionPending,
  lastHash: state.lastTransactionHash,
}));
