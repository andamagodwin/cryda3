// app/rides.tsx or app/(tabs)/rides.tsx
import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { fetchDrives } from '../../lib/api';
import { useDriveStore } from '../../store/driveStore';
import { format } from 'date-fns';

export default function Rides() {
  const { drives, setDrives } = useDriveStore();
  const [loading, setLoading] = useState(false);

  const loadRides = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchDrives();
      setDrives(data);
    } catch (err) {
      console.error('Failed to fetch drives', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!drives) loadRides();
  }, []);

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-200 bg-white">
        <Text className="text-2xl font-bold text-gray-800">My Rides</Text>
        <Text className="text-gray-500 mt-1">List of all your drives</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadRides} />
        }
      >
        {!drives || drives.length === 0 ? (
          <Text className="text-center text-gray-400 mt-10">No rides found.</Text>
        ) : (
          drives.map((ride) => (
            <View
              key={ride.id}
              className="bg-gray-100 p-4 rounded-xl mb-4 shadow-sm"
            >
              <Text className="text-lg font-semibold text-blue-700">
                {ride.start_location.label} → {ride.end_location.label}
              </Text>
              <Text className="text-gray-600 mt-1">
                {format(new Date(ride.departure_time), 'MMM dd, yyyy — hh:mm a')}
              </Text>
              <Text className="text-gray-800 mt-2">
                Driver: <Text className="font-semibold">{ride.driver_name}</Text>
              </Text>
              <Text className="text-gray-700">Car: {ride.car_type}</Text>
              <Text className="text-gray-700">Plate: {ride.number_plate}</Text>
              <Text className="text-gray-700">Seats: {ride.seats}</Text>
              <Text className="text-gray-700">UGX {ride.price.toLocaleString()}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
