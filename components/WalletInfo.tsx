import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useWallet } from '@/hooks/useWallet';

/**
 * Simple component showing wallet connection status
 */
export const WalletInfo = () => {
  const {
    isConnected,
    address,
    walletType,
    email,
    shortAddress,
    hasEmail,
  } = useWallet();

  if (!isConnected) {
    return (
      <View style={{ padding: 6, backgroundColor: '#f3f4f6', borderRadius: 8, margin: 16 }}>
        <ThemedText style={{ textAlign: 'center', color: '#6b7280' }}>
          No wallet connected
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={{ 
      padding: 16, 
      backgroundColor: 'white', 
      borderRadius: 8, 
      margin: 16, 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 1 }, 
      shadowOpacity: 0.1, 
      shadowRadius: 2,
      elevation: 2 
    }}>
      <ThemedText style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
        Wallet Connected ✅
      </ThemedText>
      
      <View style={{ gap: 8 }}>
        <View>
          <ThemedText style={{ fontSize: 12, color: '#6b7280' }}>Address:</ThemedText>
          <ThemedText style={{ fontFamily: 'monospace' }}>{shortAddress}</ThemedText>
        </View>

        <View>
          <ThemedText style={{ fontSize: 12, color: '#6b7280' }}>Wallet Type:</ThemedText>
          <ThemedText style={{ textTransform: 'capitalize' }}>{walletType}</ThemedText>
        </View>

        {hasEmail && (
          <View>
            <ThemedText style={{ fontSize: 12, color: '#6b7280' }}>Email:</ThemedText>
            <ThemedText>{email}</ThemedText>
          </View>
        )}
      </View>
    </View>
  );
};
