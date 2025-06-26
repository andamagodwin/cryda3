import { View, Text, TouchableOpacity } from 'react-native';
import Map from '../components/Map/Map';
import DualLocationPicker from '../components/Location/DualLocationPicker';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useDriveStore } from '../store/driveStore';

type Location = {
  latitude: number;
  longitude: number;
  label: string;
};

export default function PickupLocation() {
  const [from, setFrom] = useState<Location | null>(null);
  const [to, setTo] = useState<Location | null>(null);

  const { setStartLocation, setEndLocation } = useDriveStore();
  const router = useRouter();

  const handleUseRoute = () => {
    if (!from || !to) return;

    // Save to Zustand instead of passing via URL
    setStartLocation(from);
    setEndLocation(to);

    router.back(); // or router.push('/createDrive') if going forward
  };

  return (
    <View className="flex-1 items-center bg-white">
      <View className="z-10 absolute w-full max-w-md p-4">
        <DualLocationPicker
          onLocationsSelected={(fromCoords, toCoords) => {
            setFrom(fromCoords);
            setTo(toCoords);
          }}
        />
        {from && to && (
          <View className="mt-6 p-4 bg-gray-100 rounded-lg w-full">
            <Text className="text-gray-700">From: {from.label}</Text>
            <Text className="text-gray-700 mt-1">To: {to.label}</Text>

            <TouchableOpacity
              onPress={handleUseRoute}
              className="mt-4 bg-blue-600 px-4 py-3 rounded-lg"
            >
              <Text className="text-white text-center font-semibold">Use Route</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Map />
    </View>
  );
}
