// app/rides.tsx or app/(tabs)/rides.tsx
import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
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
        {!drives || drives.length === 0 ? (
          <Text className="text-center text-gray-400 mt-10">No rides found.</Text>
        ) : (
          drives.map((ride) => (
            <View
              key={ride.id}
              className="bg-white rounded-2xl p-4 mb-4 border border-primary flex-row justify-between items-start"
            >
              {/* Left side content */}
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800">
                  {ride.start_location.label} → {ride.end_location.label}
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
                      Seats: {ride.seats} • UGX {ride.price.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Delete Button */}
              <View className="ml-2">
                <TouchableOpacity className="bg-primary px-3 py-2 rounded-md flex-row items-center">
                  <Text className="text-black font-semibold text-sm mr-1">🗑️</Text>
                  <Text className="text-black font-semibold text-sm">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>

          ))
        )}
      </ScrollView>
    </View>
  );
}
