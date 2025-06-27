import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, ScrollView, Alert } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDriveStore } from '../../store/driveStore';
import { useWalletStore } from '../../store/walletStore';
import { useActiveAccount } from 'thirdweb/react';
import { sendTransaction } from 'thirdweb';
import { BlockchainService, SupabaseIntegration } from '../../services/blockchainService';

export default function CreateDriveForm() {
  const { startLocation, endLocation } = useDriveStore();
  const { isConnected: isWalletConnected, address: walletAddress } = useWalletStore();
  const account = useActiveAccount();
  
  const [price, setPrice] = useState('');
  const [driverName, setDriverName] = useState('');
  const [carType, setCarType] = useState('');
  const [numberPlate, setNumberPlate] = useState('');
  const [seats, setSeats] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'ETH' | 'CRYDA_TOKEN'>('ETH');
  const [isCreating, setIsCreating] = useState(false);
  const [date, setDate] = useState(new Date());
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChangeDate = (_: any, selectedDate?: Date) => {
    if (selectedDate) {
      const newDate = new Date(date);
      if (pickerMode === 'date') {
        newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      } else {
        newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      }
      setDate(newDate);
    }
    setShowDatePicker(false);
  };

  const showPicker = (mode: 'date' | 'time') => {
    setPickerMode(mode);
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: date,
        onChange: handleChangeDate,
        mode,
        is24Hour: false,
      });
    } else {
      setShowDatePicker(true);
    }
  };

  const handleSubmit = async () => {
    if (!driverName || !carType || !numberPlate || !seats || !startLocation || !endLocation || !price) {
      Alert.alert('Missing Fields', 'Please fill all the required fields.');
      return;
    }

    if (!isWalletConnected || !account) {
      Alert.alert('Wallet Required', 'Please connect your wallet to create a ride.');
      return;
    }

    setIsCreating(true);

    try {
      // 1. Create ride record in Supabase first
      const supabaseRideId = await SupabaseIntegration.createRideRecord({
        startLocation: typeof startLocation === 'string' ? startLocation : startLocation?.label || 'Unknown',
        endLocation: typeof endLocation === 'string' ? endLocation : endLocation?.label || 'Unknown',
        departureTime: date,
        pricePerSeat: price,
        totalSeats: parseInt(seats),
        paymentMethod,
        driverName,
        carType,
        numberPlate,
      });

      // 2. Create ride on blockchain
      const transaction = await BlockchainService.createRide({
        startLocation: typeof startLocation === 'string' ? startLocation : startLocation?.label || 'Unknown',
        endLocation: typeof endLocation === 'string' ? endLocation : endLocation?.label || 'Unknown',
        departureTime: date,
        pricePerSeat: price,
        totalSeats: parseInt(seats),
        paymentMethod,
      });

      // 3. Send transaction with proper error handling
      let receipt;
      try {
        receipt = await sendTransaction({
          transaction,
          account,
        });
      } catch (transactionError: any) {
        console.error('Transaction error:', transactionError);
        
        // Handle paymaster errors specifically
        if (transactionError.message?.includes('paymaster') || 
            transactionError.message?.includes('AA31') ||
            transactionError.message?.includes('deposit too low')) {
          
          Alert.alert(
            'Gas Payment Required', 
            'Unable to sponsor gas fees. You need Base Sepolia ETH to pay for gas fees. Make sure you have at least 0.001 ETH for gas.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Retry', onPress: () => {
                // Retry the transaction - just show message for now
                Alert.alert('Retry', 'Please ensure you have Base Sepolia ETH and try again.');
              }}
            ]
          );
          return;
        }
        
        throw transactionError;
      }

      // 4. Update Supabase with blockchain data (simplified - use timestamp as ID for now)
      const blockchainRideId = Date.now(); // In production, extract from contract events
      await SupabaseIntegration.updateRideWithBlockchainData(
        supabaseRideId,
        blockchainRideId,
        receipt.transactionHash
      );

      Alert.alert('Success', 'Ride created successfully on blockchain!');
      
      // Reset form
      setDriverName('');
      setCarType('');
      setNumberPlate('');
      setSeats('');
      setPrice('');
      setDate(new Date());
      
      router.push('/rides');
    } catch (error: any) {
      console.error('Error creating ride:', error);
      Alert.alert('Error', error.message || 'Failed to create ride');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 ,width: '100%'}} className="bg-white w-11/12">
      <View className=''>
        <Text className="text-2xl font-bold mb-4">Create a Ride</Text>

      <Text className="mb-1 text-gray-600">Drivers Name</Text>
      <TextInput
        value={driverName}
        onChangeText={setDriverName}
        placeholder="e.g. John Doe"
        className="border border-black rounded-lg p-3 mb-4"
      />

      <Text className="mb-1 text-gray-600">Car Type</Text>
      <TextInput
        value={carType}
        onChangeText={setCarType}
        placeholder="e.g. Toyota Wish"
        className="border border-black rounded-lg p-3 mb-4"
      />

      <Text className="mb-1 text-gray-600">Number Plate</Text>
      <TextInput
        value={numberPlate}
        onChangeText={setNumberPlate}
        placeholder="e.g. UBA 123C"
        className="border border-black rounded-lg p-3 mb-4"
      />

      <Text className="mb-1 text-gray-600">Number of Seats</Text>
      <TextInput
        value={seats}
        onChangeText={setSeats}
        placeholder="e.g. 4"
        keyboardType="numeric"
        className="border border-black rounded-lg p-3 mb-4"
      />

      <Text className="mb-1 text-gray-600">Price per Seat (ETH)</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="e.g. 0.01"
        keyboardType="numeric"
        className="border border-black rounded-lg p-3 mb-4"
      />

      {/* Payment Method Selector */}
      <Text className="mb-1 text-gray-600">Payment Method</Text>
      <View className="flex-row mb-4">
        <TouchableOpacity
          onPress={() => setPaymentMethod('ETH')}
          className={`flex-1 p-3 rounded-lg mr-2 ${
            paymentMethod === 'ETH' ? 'bg-primary' : 'bg-gray-200'
          }`}
        >
          <Text className={`text-center font-semibold ${
            paymentMethod === 'ETH' ? 'text-black' : 'text-gray-600'
          }`}>ETH</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setPaymentMethod('CRYDA_TOKEN')}
          className={`flex-1 p-3 rounded-lg ml-2 ${
            paymentMethod === 'CRYDA_TOKEN' ? 'bg-primary' : 'bg-gray-200'
          }`}
        >
          <Text className={`text-center font-semibold ${
            paymentMethod === 'CRYDA_TOKEN' ? 'text-black' : 'text-gray-600'
          }`}>CRYDA</Text>
        </TouchableOpacity>
      </View>

      {/* Wallet Connection Status */}
      {!isWalletConnected && (
        <View className="bg-yellow-100 p-3 rounded-lg mb-4">
          <Text className="text-yellow-800 text-center">
            Please connect your wallet to create rides on blockchain
          </Text>
        </View>
      )}

      {/* Start Location */}
      <TouchableOpacity
        className="flex-row items-center py-3 border-b border-gray-200 mb-2"
        onPress={() => router.push('/pickupLocation?type=start')}
      >
        <MaterialIcons name="location-on" size={24} color="#3d90ef" className="mr-3" />
        <Text className="text-base text-[#333]">
          {startLocation?.label || 'Select Start Location'}
        </Text>
      </TouchableOpacity>

      {/* End Location */}
      <TouchableOpacity
        className="flex-row items-center py-3 border-b border-gray-200 mb-2"
        onPress={() => router.push('/destination?type=end')}
      >
        <MaterialIcons name="location-pin" size={24} color="#ff6b6b" className="mr-3" />
        <Text className="text-base text-[#333]">
          {endLocation?.label || 'Select Destination'}
        </Text>
      </TouchableOpacity>

      {/* Pick Date */}
      <TouchableOpacity
        className="flex-row items-center py-3 border-b border-gray-200 mb-2"
        onPress={() => showPicker('date')}
      >
        <Ionicons name="calendar" size={24} color="#4cd964" className="mr-3" />
        <Text className="text-base text-[#333]">
          {date.toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      {/* Pick Time */}
      <TouchableOpacity
        className="flex-row items-center py-3 border-b border-gray-200 mb-4"
        onPress={() => showPicker('time')}
      >
        <Ionicons name="time" size={24} color="#ffce54" className="mr-3" />
        <Text className="text-base text-[#333]">
          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>

      {/* DateTimePicker for iOS */}
      {Platform.OS === 'ios' && showDatePicker && (
        <DateTimePicker
          value={date}
          mode={pickerMode}
          display="default"
          onChange={handleChangeDate}
        />
      )}

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isCreating}
        className={`p-4 rounded-lg items-center ${
          isCreating ? 'bg-gray-400' : 'bg-primary'
        }`}
      >
        <Text className="text-black font-bold text-lg">
          {isCreating ? 'Creating Ride...' : 'Create Ride on Blockchain'}
        </Text>
      </TouchableOpacity>

      </View>
      
    </ScrollView>
  );
}
