
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useWalletStore } from '../store/walletStore';
import { BlockchainService } from '../services/blockchainService';

export default function Header() {
    const { isConnected, address } = useWalletStore();
    const [crydaBalance, setCrydaBalance] = useState<string>('0');
    const [isLoading, setIsLoading] = useState(false);
    const hasNewNotifications = true;

    // Fetch CRYDA balance when wallet is connected
    useEffect(() => {
        if (isConnected && address) {
            fetchCrydaBalance();
        } else {
            setCrydaBalance('0');
        }
    }, [isConnected, address]);

    const fetchCrydaBalance = async () => {
        if (!address) return;
        
        try {
            setIsLoading(true);
            
            // Check if contract addresses are properly set
            const { CONTRACT_ADDRESSES } = await import('../constants/contracts');
            
            if (!CONTRACT_ADDRESSES.CRYDA_TOKEN || CONTRACT_ADDRESSES.CRYDA_TOKEN === '0x...') {
                console.warn('CRYDA token contract address not set');
                setCrydaBalance('N/A');
                return;
            }
            
            const balance = await BlockchainService.getCrydaBalance(address);
            // Format balance to show only 4 decimal places
            setCrydaBalance(parseFloat(balance).toFixed(4));
        } catch (error: any) {
            console.error('Error fetching CRYDA balance:', error);
            
            // Handle specific error types
            if (error.message?.includes('Cannot decode zero data') || 
                error.message?.includes('0x') ||
                error.message?.includes('no contract code') ||
                error.message?.includes('contract not found')) {
                setCrydaBalance('Contract N/A');
                console.warn('Contract may not be deployed or address is incorrect');
            } else if (error.message?.includes('network')) {
                setCrydaBalance('Network Error');
            } else {
                setCrydaBalance('Error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const refreshBalance = () => {
        if (isConnected && address) {
            fetchCrydaBalance();
        }
    };

    return (
        <View className="w-full flex-row items-center justify-between bg-primary px-6 pt-2 pb-2 h-28">
            <View>
                <TouchableOpacity 
                    onPress={refreshBalance}
                    className="flex-row items-center space-x-2 rounded-full bg-black px-3 py-1.5"
                >
                    <Feather name="database" size={18} color="#FFDE21" />
                    <Text className="font-bold text-primary">
                        {isLoading ? '...' : 
                         !isConnected ? 'No Wallet' :
                         crydaBalance === 'N/A' ? 'Contract N/A' :
                         crydaBalance === 'Network Error' ? 'Network Error' :
                         crydaBalance === 'Error' ? 'Error' :
                         `${crydaBalance} CRYDA`}
                    </Text>
                </TouchableOpacity>
                
                {/* Wallet Address Display (optional) */}
                {isConnected && address && (
                    <Text className="text-xs text-gray-600 mt-1 ml-1">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </Text>
                )}
            </View>

            {/* Right-side icons */}
            <View className="flex-row items-center space-x-4">
                {/* Additional balance info */}
                {isConnected && (
                    <TouchableOpacity 
                        onPress={refreshBalance}
                        className="p-2 bg-black rounded-full"
                    >
                        <Feather name="refresh-cw" size={20} color="#FFDE21" />
                    </TouchableOpacity>
                )}

                {/* Notification Bell */}
                <TouchableOpacity className="relative p-2 bg-black rounded-full">
                    <Feather name="bell" size={24} color="#FFDE21" />
                    {hasNewNotifications && (
                        <View className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-primary" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    )
}