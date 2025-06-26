import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useWalletStore } from '../store/walletStore';
import { useActiveAccount } from 'thirdweb/react';
import { sendTransaction } from 'thirdweb';
import { BlockchainService, SupabaseIntegration } from '../services/blockchainService';

export default function BookingScreen() {
  const params = useLocalSearchParams();
  const { isConnected: isWalletConnected } = useWalletStore();
  const account = useActiveAccount();
  
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  
  // Extract ride data from params
  const rideData = {
    rideId: parseInt(params.rideId as string),
    startLocation: params.startLocation as string,
    endLocation: params.endLocation as string,
    departureTime: params.departureTime as string,
    pricePerSeat: parseFloat(params.pricePerSeat as string),
    totalSeats: parseInt(params.totalSeats as string),
    paymentMethod: params.paymentMethod as 'ETH' | 'CRYDA_TOKEN',
    driverName: params.driverName as string,
    carType: params.carType as string,
    numberPlate: params.numberPlate as string,
    blockchainTxHash: params.blockchainTxHash as string,
  };

  const totalAmount = (seatsToBook * rideData.pricePerSeat).toFixed(6);

  const incrementSeats = () => {
    if (seatsToBook < rideData.totalSeats) {
      setSeatsToBook(prev => prev + 1);
    }
  };

  const decrementSeats = () => {
    if (seatsToBook > 1) {
      setSeatsToBook(prev => prev - 1);
    }
  };

  const handleBooking = async () => {
    if (!isWalletConnected || !account) {
      Alert.alert('Wallet Required', 'Please connect your wallet to book a ride.');
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Book ${seatsToBook} seat(s) for ${totalAmount} ${rideData.paymentMethod}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => processBooking()
        }
      ]
    );
  };

  const processBooking = async () => {
    if (!account) {
      Alert.alert('Error', 'No wallet account found');
      return;
    }

    setIsBooking(true);

    try {
      console.log('Starting booking process...');
      
      // 1. Create booking record in Supabase first
      console.log('Creating Supabase booking record...');
      const supabaseBookingId = await SupabaseIntegration.createBookingRecord(
        rideData.rideId,
        seatsToBook,
        totalAmount,
        rideData.paymentMethod
      );
      console.log('Supabase booking created with ID:', supabaseBookingId);

      // 2. Prepare blockchain booking transaction
      console.log('Preparing blockchain transaction...');
      const bookingTransaction = await BlockchainService.bookRide({
        rideId: rideData.rideId,
        seatsToBook,
        totalAmount,
        paymentMethod: rideData.paymentMethod,
      });

      let receipt;

      // 3. Handle different payment methods
      if (rideData.paymentMethod === 'ETH') {
        console.log('Processing ETH payment...');
        // For ETH payments, send single transaction
        receipt = await sendTransaction({
          transaction: bookingTransaction as any,
          account,
        });
      } else {
        console.log('Processing CRYDA token payment...');
        // For CRYDA token payments, need approval first
        const { approveTransaction, bookTransaction } = bookingTransaction as any;
        
        // First approve tokens
        Alert.alert('Approval Required', 'Please approve CRYDA tokens first...');
        const approvalReceipt = await sendTransaction({
          transaction: approveTransaction,
          account,
        });
        console.log('Token approval successful:', approvalReceipt.transactionHash);

        Alert.alert('Approval Successful', 'Now booking the ride...');
        
        // Then book the ride
        receipt = await sendTransaction({
          transaction: bookTransaction,
          account,
        });
      }

      console.log('Blockchain transaction successful:', receipt.transactionHash);

      // 4. Update Supabase with blockchain data
      // Extract blockchain booking ID from transaction receipt or use a proper method
      let blockchainBookingId;
      
      try {
        // In a real implementation, you would extract the booking ID from contract events
        // For now, we'll use the transaction hash as a unique identifier
        blockchainBookingId = parseInt(receipt.transactionHash.slice(-8), 16); // Convert last 8 chars of hash to number
      } catch {
        blockchainBookingId = Date.now(); // Fallback to timestamp
      }

      console.log('Updating Supabase with blockchain data...');
      await SupabaseIntegration.updateBookingWithBlockchainData(
        supabaseBookingId,
        blockchainBookingId,
        receipt.transactionHash
      );

      console.log('Booking completed successfully:', {
        supabaseId: supabaseBookingId,
        blockchainId: blockchainBookingId,
        txHash: receipt.transactionHash
      });

      Alert.alert(
        'Booking Successful! 🎉',
        `Your ride has been booked on the blockchain!\n\nTransaction: ${receipt.transactionHash.slice(0, 10)}...`,
        [
          {
            text: 'View My Bookings',
            onPress: () => router.push('/rides')
          },
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );

    } catch (error: any) {
      console.error('Booking error:', error);
      Alert.alert(
        'Booking Failed',
        error.message || 'Failed to book ride. Please try again.'
      );
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-primary p-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mb-4"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-black">Book Ride</Text>
        <Text className="text-gray-600 mt-1">Complete your blockchain booking</Text>
      </View>

      <View className="p-4">
        {/* Ride Details Card */}
        <View className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
          <Text className="text-lg font-bold mb-3">Ride Details</Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center">
              <MaterialIcons name="location-on" size={20} color="#3d90ef" />
              <Text className="ml-2 text-gray-700">From: {rideData.startLocation}</Text>
            </View>
            
            <View className="flex-row items-center">
              <MaterialIcons name="location-pin" size={20} color="#ff6b6b" />
              <Text className="ml-2 text-gray-700">To: {rideData.endLocation}</Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="calendar" size={20} color="#4cd964" />
              <Text className="ml-2 text-gray-700">
                Date: {format(new Date(rideData.departureTime), 'MMM dd, yyyy • hh:mm a')}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="person" size={20} color="#ffce54" />
              <Text className="ml-2 text-gray-700">Driver: {rideData.driverName}</Text>
            </View>
            
            <View className="flex-row items-center">
              <Ionicons name="car" size={20} color="#a0a0a0" />
              <Text className="ml-2 text-gray-700">Car: {rideData.carType} • {rideData.numberPlate}</Text>
            </View>

            {rideData.blockchainTxHash && (
              <View className="flex-row items-center">
                <Text className="ml-2 text-blue-600 text-xs">⛓️ Verified on blockchain</Text>
              </View>
            )}
          </View>
        </View>

        {/* Seat Selection */}
        <View className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
          <Text className="text-lg font-bold mb-3">Select Seats</Text>
          
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-700">Number of seats:</Text>
            
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={decrementSeats}
                disabled={seatsToBook <= 1}
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  seatsToBook <= 1 ? 'bg-gray-300' : 'bg-primary'
                }`}
              >
                <Text className="text-xl font-bold text-black">-</Text>
              </TouchableOpacity>
              
              <Text className="mx-6 text-2xl font-bold">{seatsToBook}</Text>
              
              <TouchableOpacity
                onPress={incrementSeats}
                disabled={seatsToBook >= rideData.totalSeats}
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  seatsToBook >= rideData.totalSeats ? 'bg-gray-300' : 'bg-primary'
                }`}
              >
                <Text className="text-xl font-bold text-black">+</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <Text className="text-sm text-gray-500 mt-2">
            Available seats: {rideData.totalSeats}
          </Text>
        </View>

        {/* Payment Summary */}
        <View className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
          <Text className="text-lg font-bold mb-3">Payment Summary</Text>
          
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-700">Price per seat:</Text>
              <Text className="font-semibold">{rideData.pricePerSeat} {rideData.paymentMethod}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-700">Seats:</Text>
              <Text className="font-semibold">{seatsToBook}</Text>
            </View>
            
            <View className="border-t border-gray-300 pt-2 mt-2">
              <View className="flex-row justify-between">
                <Text className="text-lg font-bold">Total:</Text>
                <Text className="text-lg font-bold text-green-600">
                  {totalAmount} {rideData.paymentMethod}
                </Text>
              </View>
            </View>
          </View>
          
          <View className="mt-3 p-2 bg-blue-50 rounded-lg">
            <Text className="text-xs text-blue-600 text-center">
              💡 Payment will be processed on Base Sepolia blockchain
            </Text>
          </View>
        </View>

        {/* Wallet Status */}
        {!isWalletConnected && (
          <View className="bg-yellow-100 p-3 rounded-lg mb-4">
            <Text className="text-yellow-800 text-center">
              Please connect your wallet to complete booking
            </Text>
          </View>
        )}

        {/* Book Button */}
        <TouchableOpacity
          onPress={handleBooking}
          disabled={!isWalletConnected || isBooking}
          className={`p-4 rounded-lg items-center ${
            !isWalletConnected || isBooking ? 'bg-gray-400' : 'bg-green-500'
          }`}
        >
          {isBooking ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" size="small" />
              <Text className="text-white font-bold text-lg ml-2">Processing...</Text>
            </View>
          ) : (
            <Text className="text-white font-bold text-lg">
              Book Ride for {totalAmount} {rideData.paymentMethod}
            </Text>
          )}
        </TouchableOpacity>

        <Text className="text-xs text-gray-500 text-center mt-3">
          By booking, you agree to the payment terms and blockchain transaction fees
        </Text>
      </View>
    </ScrollView>
  );
}
