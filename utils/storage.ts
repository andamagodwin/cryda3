import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Simple storage utility to test AsyncStorage functionality
 */
export class StorageManager {
  static async testStorage() {
    try {
      const testKey = 'test-storage';
      const testValue = 'test-value';
      
      // Test write
      await AsyncStorage.setItem(testKey, testValue);
      
      // Test read
      const value = await AsyncStorage.getItem(testKey);
      
      // Test delete
      await AsyncStorage.removeItem(testKey);
      
      console.log('✅ AsyncStorage is working correctly');
      return value === testValue;
    } catch (error) {
      console.error('❌ AsyncStorage test failed:', error);
      return false;
    }
  }

  static async clearWalletData() {
    try {
      await AsyncStorage.removeItem('wallet-store');
      console.log('🗑️ Wallet data cleared from storage');
    } catch (error) {
      console.error('Error clearing wallet data:', error);
    }
  }

  static async getWalletData() {
    try {
      const data = await AsyncStorage.getItem('wallet-store');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting wallet data:', error);
      return null;
    }
  }
}

// Test storage on app start
StorageManager.testStorage();
