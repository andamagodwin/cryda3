import { useWalletStore } from '@/store/walletStore';
import { useActiveAccount } from 'thirdweb/react';
import { prepareTransaction, sendTransaction } from 'thirdweb';
import { client, chain } from '@/constants/thirdweb';

/**
 * Custom hook for handling transactions with automatic state management
 */
export const useTransactions = () => {
  const account = useActiveAccount();
  const { 
    setTransactionPending, 
    setLastTransactionHash, 
    isTransactionPending,
    lastTransactionHash 
  } = useWalletStore();

  const sendTransactionWithStore = async (transaction: any) => {
    if (!account) {
      throw new Error('No active account found');
    }

    try {
      setTransactionPending(true);
      
      const result = await sendTransaction({
        transaction,
        account,
      });

      setLastTransactionHash(result.transactionHash);
      return result;
    } catch (error) {
      setTransactionPending(false);
      throw error;
    }
  };

  const clearLastTransaction = () => {
    setLastTransactionHash(null);
  };

  return {
    sendTransaction: sendTransactionWithStore,
    isTransactionPending,
    lastTransactionHash,
    clearLastTransaction,
  };
};

/**
 * Helper function to prepare and send a transaction
 */
export const createAndSendTransaction = async (
  to: string,
  value: bigint,
  data?: `0x${string}`
) => {
  const transaction = prepareTransaction({
    to,
    value,
    data,
    client,
    chain,
  });

  return transaction;
};
