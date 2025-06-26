import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

type Suggestion = {
  name: string;
  mapbox_id: string;
  place_formatted: string;
};

type Location = {
  latitude: number;
  longitude: number;
  label: string;
};


type Props = {
  onLocationsSelected: (from: Location | null, to: Location | null) => void;
};


const MAPBOX_TOKEN = 'sk.eyJ1IjoiYW5kYW1hZXpyYSIsImEiOiJjbWM4dndwMzUwenk2MmpyMmp3NW1zcG80In0.TIcX8_WM6GfdzqJHXNIf6g';
const SESSION_TOKEN = 'd509081b-3268-454f-87b4-535b9a978cd0';

const DualLocationPicker: React.FC<Props> = ({ onLocationsSelected }) => {
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [activeInput, setActiveInput] = useState<'from' | 'to' | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [proximity, setProximity] = useState('32.587776,0.32768');
  const [loading, setLoading] = useState(false);
  const [fromCoords, setFromCoords] = useState<Location | null>(null);
  const [toCoords, setToCoords] = useState<Location | null>(null);


  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setProximity(`${loc.coords.longitude},${loc.coords.latitude}`);
      }
    };
    getLocation();
  }, []);

  useEffect(() => {
    const query = activeInput === 'from' ? fromQuery : toQuery;
    if (!activeInput || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await axios.get('https://api.mapbox.com/search/searchbox/v1/suggest', {
          params: {
            q: query,
            access_token: MAPBOX_TOKEN,
            session_token: SESSION_TOKEN,
            language: 'en',
            limit: 10,
            types: 'place,address,poi,locality,neighborhood,street',
            proximity,
          },
        });
        setSuggestions(res.data.suggestions || []);
      } catch (err) {
        console.error('Suggestion fetch error:', err);
      }
      setLoading(false);
    };

    const debounce = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(debounce);
  }, [fromQuery, toQuery, activeInput]);

  const handleSelect = async (item: Suggestion) => {
  const querySetter = activeInput === 'from' ? setFromQuery : setToQuery;

  querySetter(item.name);
  setSuggestions([]);
  setActiveInput(null); 
  setLoading(true);

  try {
    const res = await axios.get(`https://api.mapbox.com/search/searchbox/v1/retrieve/${item.mapbox_id}`, {
      params: {
        access_token: MAPBOX_TOKEN,
        session_token: SESSION_TOKEN,
      },
    });

    const coords = res.data.features[0]?.geometry?.coordinates;
    const label = item.place_formatted || item.name;

    if (coords) {
      const coordinate = {
        latitude: coords[1],
        longitude: coords[0],
        label,
      };

      if (activeInput === 'from') {
        setFromCoords(coordinate);
        onLocationsSelected(coordinate, toCoords);
      } else {
        setToCoords(coordinate);
        onLocationsSelected(fromCoords, coordinate);
      }
    }
  } catch (err) {
    console.error('Retrieve failed:', err);
  } finally {
    setLoading(false);
  }
};


  const handleUseCurrentLocation = async () => {
  setLoading(true);
  setActiveInput(null);
  setSuggestions([]);
  try {
    const loc = await Location.getCurrentPositionAsync({});
    const current: Location = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      label: 'Current Location',
    };
    setFromCoords(current);
    setFromQuery('Current Location');
    onLocationsSelected(current, toCoords);
  } catch (err) {
    console.error('Get current location failed:', err);
  } finally {
    setLoading(false);
  }
};


  return (
    <View className="bg-white rounded-xl p-4 shadow-md w-full max-w-xl">
      <Text className="text-lg font-semibold text-gray-800 mb-2">Select Trip Locations</Text>

      {/* From Input */}
      <Text className="text-sm text-gray-600 mb-1">From</Text>
      <View className="flex-row gap-2 mb-3">
        <TextInput
          value={fromQuery}
          onChangeText={text => {
            setFromQuery(text);
            setActiveInput('from');
          }}
          placeholder="Search starting point"
          className="flex-1 border border-black rounded-lg p-3 text-base"
        />
        <TouchableOpacity
          onPress={handleUseCurrentLocation}
          className="bg-primary px-3 py-2 rounded-lg"
        >
          <MaterialIcons name="my-location" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* To Input */}
      <Text className="text-sm text-gray-600 mb-1">To</Text>
      <TextInput
        value={toQuery}
        onChangeText={text => {
          setToQuery(text);
          setActiveInput('to');
        }}
        placeholder="Search destination"
        className="border border-black rounded-lg p-3 text-base mb-3"
      />

      {/* Suggestions */}
      {loading && <ActivityIndicator className="mb-2" />}
      <FlatList
        data={suggestions}
        keyExtractor={item => item.mapbox_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelect(item)}
            className="p-3 border-b border-gray-100 bg-white"
          >
            <Text className="text-gray-900 font-medium">{item.name}</Text>
            <Text className="text-sm text-gray-500">{item.place_formatted}</Text>
          </TouchableOpacity>
        )}
        className="bg-white rounded-lg max-h-60"
      />

      
    </View>
  );
};

export default DualLocationPicker;
