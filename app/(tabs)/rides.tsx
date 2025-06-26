// app/rides.tsx or app/(tabs)/rides.tsx
import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert, Linking } from 'react-native';
import { supabase } from '../../utils/supabase';
import { useDriveStore } from '../../store/driveStore';
import { format } from 'date-fns';

interface Ride {
  id: number;
  driver_id: string;
  driver_name: string;
  car_type: string;
  number_plate: string;
  start_location_label: string;
  end_location_label: string;
  departure_time: string;
  price_per_seat: number;
  total_seats: number;
  payment_method: 'ETH' | 'CRYDA_TOKEN';
  status: string;
  blockchain_id?: number;
  blockchain_tx_hash?: string;
  created_at: string;
}

export default function Rides() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRides = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('No authenticated user');
        return;
      }

      // Fetch rides from Supabase
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('driver_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rides:', error);
        Alert.alert('Error', 'Failed to fetch rides');
        return;
      }

      setRides(data || []);
    } catch (err) {
      console.error('Failed to fetch rides', err);
      Alert.alert('Error', 'Failed to fetch rides');
    } finally {
      setLoading(false);
    }
  }, []);

  const openTransactionInExplorer = (txHash: string) => {
    const explorerUrl = `https://base-sepolia.blockscout.com/tx/${txHash}`;
    Linking.openURL(explorerUrl).catch(() => {
      Alert.alert('Cannot open link', 'Unable to open blockchain explorer');
    });
  };

  const deleteRide = async (rideId: number) => {
    Alert.alert(
      'Delete Ride',
      'Are you sure you want to delete this ride?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('rides')
                .delete()
                .eq('id', rideId);

              if (error) {
                Alert.alert('Error', 'Failed to delete ride');
                return;
              }

              // Refresh the list
              loadRides();
              Alert.alert('Success', 'Ride deleted successfully');
            } catch (err) {
              console.error('Delete error:', err);
              Alert.alert('Error', 'Failed to delete ride');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    loadRides();
  }, []);

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-200 bg-primary">
        <Text className="text-2xl font-bold text-gray-800">My Rides</Text>
        <Text className="text-gray-500 mt-1">List of all your drives</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadRides} />
        }
      >
        {!rides || rides.length === 0 ? (
          <Text className="text-center text-gray-400 mt-10">No rides found.</Text>
        ) : (
          rides.map((ride) => (
            <View
              key={ride.id}
              className="bg-white rounded-2xl p-4 mb-4 border border-primary flex-row justify-between items-start"
            >
              {/* Left side content */}
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800">
                  {ride.start_location_label} → {ride.end_location_label}
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  {format(new Date(ride.departure_time), 'MMM dd, yyyy • hh:mm a')}
                </Text>

                {/* Info Rows */}
                <View className="mt-3 space-y-1">
                  <View className="flex-row items-center">
                    <Text className="mr-2">👤</Text>
                    <Text className="text-sm text-gray-700">Driver: {ride.driver_name}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="mr-2">🚗</Text>
                    <Text className="text-sm text-gray-700">
                      Car: {ride.car_type} • Plate: {ride.number_plate}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="mr-2">🪑</Text>
                    <Text className="text-sm text-gray-700">
                      Seats: {ride.total_seats} • {ride.price_per_seat} {ride.payment_method}
                    </Text>
                  </View>
                  
                  {/* Blockchain Status */}
                  <View className="flex-row items-center">
                    <Text className="mr-2">⛓️</Text>
                    <Text className="text-sm text-gray-700">
                      Status: <Text className={ride.blockchain_tx_hash ? "text-green-600" : "text-orange-600"}>
                        {ride.blockchain_tx_hash ? "On Blockchain" : "Pending"}
                      </Text>
                    </Text>
                  </View>

                  {/* Transaction Hash - clickable */}
                  {ride.blockchain_tx_hash && (
                    <TouchableOpacity 
                      onPress={() => openTransactionInExplorer(ride.blockchain_tx_hash!)}
                      className="flex-row items-center mt-1"
                    >
                      <Text className="mr-2">🔗</Text>
                      <Text className="text-sm text-blue-600 underline" numberOfLines={1}>
                        Tx: {ride.blockchain_tx_hash.slice(0, 10)}...{ride.blockchain_tx_hash.slice(-8)}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Delete Button */}
              <View className="ml-2">
                <TouchableOpacity 
                  onPress={() => deleteRide(ride.id)}
                  className="bg-red-500 px-3 py-2 rounded-md flex-row items-center"
                >
                  <Text className="text-white font-semibold text-sm mr-1">🗑️</Text>
                  <Text className="text-white font-semibold text-sm">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>

          ))
        )}
      </ScrollView>
    </View>
  );
}
