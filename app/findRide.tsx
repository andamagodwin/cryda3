import { View, Text, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { format } from 'date-fns';

// Updated Ride interface to match the new rides table structure
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


export default function FindRide() {
  const { from, to, date } = useLocalSearchParams();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchingRides();
  }, [from, to, date]);

  const fetchMatchingRides = async () => {
    setLoading(true);

    try {
      const rideDate = new Date(date as string);
      const rideDay = rideDate.toISOString().split('T')[0]; // format as YYYY-MM-DD

      const { data, error } = await supabase
        .from('rides')
        .select('*')
        // Search in the text fields directly (no longer JSONB)
        .ilike('start_location_label', `%${from}%`)
        .ilike('end_location_label', `%${to}%`)
        .gte('departure_time', rideDay) // filters rides starting from selected date
        .eq('status', 'active') // only show active rides
        .order('departure_time', { ascending: true });

      if (error) {
        console.error('Error fetching rides:', error);
        Alert.alert('Error', 'Failed to fetch rides');
      } else {
        // Filter out rides from current user (don't show your own rides)
        const { data: { session } } = await supabase.auth.getSession();
        const filteredRides = data?.filter(ride => ride.driver_id !== session?.user?.id) || [];
        setRides(filteredRides);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      Alert.alert('Error', 'Failed to fetch rides');
    }

    setLoading(false);
  };

  const bookRide = (ride: Ride) => {
    // Navigate to booking screen with ride data
    router.push({
      pathname: '/booking',
      params: {
        rideId: ride.id.toString(),
        startLocation: ride.start_location_label,
        endLocation: ride.end_location_label,
        departureTime: ride.departure_time,
        pricePerSeat: ride.price_per_seat.toString(),
        totalSeats: ride.total_seats.toString(),
        paymentMethod: ride.payment_method,
        driverName: ride.driver_name,
        carType: ride.car_type,
        numberPlate: ride.number_plate,
        blockchainTxHash: ride.blockchain_tx_hash || '',
      }
    });
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Available Rides</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#3d90ef" />
      ) : rides.length === 0 ? (
        <Text className="text-center text-gray-500">No rides found.</Text>
      ) : (
        
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => bookRide(item)}
              className="bg-gray-100 p-4 mb-3 rounded-xl shadow-sm border border-gray-200"
            >
              {/* Updated to use the new field names */}
              <Text className="font-bold text-lg">{item.start_location_label} → {item.end_location_label}</Text>
              <Text className="text-gray-700">
                Date: {format(new Date(item.departure_time), 'MMM dd, yyyy • hh:mm a')}
              </Text>
              <Text className="text-gray-600 mt-1">Driver: {item.driver_name}</Text>
              
              {/* Additional ride details */}
              <View className="mt-2 flex-row justify-between items-center">
                <View>
                  <Text className="text-sm text-gray-600">🚗 {item.car_type} • {item.number_plate}</Text>
                  <Text className="text-sm text-gray-600">🪑 {item.total_seats} seats available</Text>
                </View>
                <View className="items-end">
                  <Text className="font-bold text-lg text-green-600">
                    {item.price_per_seat} {item.payment_method}
                  </Text>
                  {item.blockchain_tx_hash && (
                    <Text className="text-xs text-blue-600">⛓️ On Blockchain</Text>
                  )}
                </View>
              </View>
              
              {/* Book button */}
              <View className="mt-3 bg-primary p-2 rounded-lg">
                <Text className="text-center font-semibold text-black">Tap to Book</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}