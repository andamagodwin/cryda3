import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

type Suggestion = {
  name: string;
  mapbox_id: string;
  place_formatted: string;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};


type Props = {
  onLocationSelect: (coords: Coordinates) => void;
};


const MAPBOX_TOKEN = 'sk.eyJ1IjoiYW5kYW1hZXpyYSIsImEiOiJjbWM4dndwMzUwenk2MmpyMmp3NW1zcG80In0.TIcX8_WM6GfdzqJHXNIf6g';
const SESSION_TOKEN = 'd509081b-3268-454f-87b4-535b9a978cd0';

const LocationSelector: React.FC<Props> = ({ onLocationSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [proximity, setProximity] = useState<string>('32.587776,0.32768'); // Default to Kampala
  const [loading, setLoading] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(null);



  // Get user's location if permission granted
  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setProximity(`${loc.coords.longitude},${loc.coords.latitude}`);
      }
    };
    getLocation();
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://api.mapbox.com/search/searchbox/v1/suggest', {
          params: {
            q: query,
            access_token: MAPBOX_TOKEN,
            session_token: SESSION_TOKEN,
            language: 'en',
            limit: 10,
            types: 'country,region,district,postcode,locality,place,neighborhood,address,poi,street,category',
            proximity,
          },
        });
        setSuggestions(response.data.suggestions || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
      setLoading(false);
    };

    const debounce = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = async (item: Suggestion) => {
    setQuery(item.name);
    setSuggestions([]);

    try {
      const res = await axios.get(`https://api.mapbox.com/search/searchbox/v1/retrieve/${item.mapbox_id}`, {
        params: { access_token: MAPBOX_TOKEN, session_token: SESSION_TOKEN },
      });

      const coords = res.data.features[0]?.geometry?.coordinates;
      if (coords) {
        setSelectedCoordinates({ latitude: coords[1], longitude: coords[0] });

        onLocationSelect({ latitude: coords[1], longitude: coords[0] }); // Send to parent
      }
    } catch (err) {
      console.error('Retrieve failed:', err);
    }
  };

  return (
    <View className="px-4 mt-6">
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search for location"
        className="border border-gray-300 rounded-lg p-3 text-base"
      />

      {loading && <ActivityIndicator className="mt-3" />}

      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.mapbox_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelect(item)}
            className="p-3 border-b border-gray-100 bg-white"
          >
            <Text className="text-gray-900 font-medium">{item.name}</Text>
            <Text className="text-sm text-gray-500">{item.place_formatted}</Text>
          </TouchableOpacity>
        )}
        className="bg-white mt-2 rounded-lg max-h-72"
      />

      {selectedCoordinates && (
        <View className="mt-4 p-3 bg-green-100 rounded-lg">
          <Text className="text-green-700 font-bold">Selected Location:</Text>
          <Text>Lat: {selectedCoordinates.latitude}</Text>
          <Text>Lng: {selectedCoordinates.longitude}</Text>
          <View></View>
        </View>
      )}
    </View>
  );
};

export default LocationSelector;
