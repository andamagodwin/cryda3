import { useState } from "react";
import { View, Text } from "react-native";
import LocationSelector from "../components/Location/LocationPicker";


type Coordinates = {
  latitude: number;
  longitude: number;
};

export default function Destination() {
  
  const [location, setLocation] = useState<Coordinates | null>(null);
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-bold text-gray-800">Destination Screen</Text>
      <LocationSelector onLocationSelect={(coords) => setLocation(coords)} />
      {/* Add your destination-related components here */}

      {location && (
        <View className="mt-4 p-3 bg-green-100 rounded-lg">
          <Text className="text-green-700 font-bold">Selected Location:</Text>
          <Text>Lat: {location.latitude}</Text>
          <Text>Lng: {location.longitude}</Text>
        </View>
      )}
    </View>
  );
}