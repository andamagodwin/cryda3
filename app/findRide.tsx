import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

// Define the structure of the location object stored in your database
interface LocationObject {
  label: string;
  latitude: number;
  longitude: number;
}

// Update the Ride interface to expect location objects
interface Ride {
  id: number;
  start_location: LocationObject;
  end_location: LocationObject;
  depature_time: string;
  time: string;
  driver_name?: string;
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

    const rideDate = new Date(date as string);
    const rideDay = rideDate.toISOString().split('T')[0]; // format as YYYY-MM-DD

    const { data, error } = await supabase
      .from('drives')
      .select('*')
      // Use the ->> operator to search the 'label' field inside the JSONB column
      .ilike('start_location->>label', `%${from}%`)
      .ilike('end_location->>label', `%${to}%`)
      .gte('departure_time', rideDay) // filters drives starting from selected date
      .order('departure_time', { ascending: true });

    if (error) {
      console.error('Error fetching rides:', error);
    } else {
      setRides(data || []);
    }

    setLoading(false);
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
            <View className="bg-gray-100 p-4 mb-3 rounded-xl shadow-sm">
              {/* Access the .label property of the location objects */}
              <Text className="font-bold text-lg">{item.start_location.label} → {item.end_location.label}</Text>
              <Text className="text-gray-700">Date: {item.depature_time}</Text>
              <Text className="text-gray-600 mt-1">Driver: {item.driver_name || 'N/A'}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}