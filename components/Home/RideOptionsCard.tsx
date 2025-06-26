import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent, DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';

type Props = {
  fromCoords?: Coordinates | null;
  toCoords?: Coordinates | null;
};

type Coordinates = {
  latitude: number;
  longitude: number;
  label: string;
};


const RideOptionsCard: React.FC<Props> = ({ fromCoords, toCoords }) => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      const newDate = new Date(date);
      if (pickerMode === 'date') {
        newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      } else {
        newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      }
      setDate(newDate);
    }
    setShowDatePicker(false);
  };

  const showPicker = (mode: 'date' | 'time') => {
    setPickerMode(mode);
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: date,
        onChange: handleChange,
        mode,
        is24Hour: false,
      });
    } else {
      setShowDatePicker(true);
    }
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <View className="bg-white rounded-2xl p-5 mx-4 my-4 shadow-lg w-11/12">
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-[22px] font-bold text-[#333]">Plan Your Ride</Text>
      </View>

      {/* Pickup Location */}
      <TouchableOpacity
        className="flex-row items-center py-3"
        onPress={() => router.push('/pickupLocation')}
      >
        <View className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: 'rgba(61,144,239,0.1)' }}>
          <MaterialIcons name="location-pin" size={24} color="#FFDE21" />
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-500 mb-0.5">Pickup Location</Text>
          <Text className="text-base font-medium text-[#333]">
            {fromCoords?.label || "Select pickup point"}
          </Text>

        </View>
        <MaterialIcons name="chevron-right" size={24} color="#ccc" />
      </TouchableOpacity>

      <View className="h-px bg-gray-200 my-1.5" />

      {/* Destination */}
      <TouchableOpacity
        className="flex-row items-center py-3"
        onPress={() => router.push('/destination')}
      >
        <View className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: 'rgba(255,107,107,0.1)' }}>
          <FontAwesome name="map-marker" size={24} color="#FFDE21" />
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-500 mb-0.5">Destination</Text>
          <Text className="text-base font-medium text-[#333]">
  {toCoords?.label || "Where are you going?"}
</Text>

        </View>
        <MaterialIcons name="chevron-right" size={24} color="#ccc" />
      </TouchableOpacity>

      <View className="h-px bg-gray-200 my-1.5" />

      {/* Pick Date */}
      <TouchableOpacity
        className="flex-row items-center py-3"
        onPress={() => showPicker('date')}
      >
        <View className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: 'rgba(76,217,100,0.1)' }}>
          <Ionicons name="calendar" size={24} color="#FFDE21" />
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-500 mb-0.5">Pick Date</Text>
          <Text className="text-base font-medium text-[#333]">{formatDate(date)}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#ccc" />
      </TouchableOpacity>

      <View className="h-px bg-gray-200 my-1.5" />

      {/* Pick Time */}
      <TouchableOpacity
        className="flex-row items-center py-3"
        onPress={() => showPicker('time')}
      >
        <View className="w-10 h-10 rounded-full items-center justify-center mr-4" style={{ backgroundColor: 'rgba(255,206,84,0.1)' }}>
          <Ionicons name="time" size={24} color="#ffce54" />
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-500 mb-0.5">Pick Time</Text>
          <Text className="text-base font-medium text-[#333]">{formatTime(date)}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#ccc" />
      </TouchableOpacity>

      {Platform.OS === 'ios' && showDatePicker && (
        <DateTimePicker
          value={date}
          mode={pickerMode}
          display="default"
          onChange={handleChange}
        />
      )}

      {/* Find Ride Button */}
      <TouchableOpacity
        className="bg-primary rounded-xl p-4 flex-row items-center justify-center mt-5"
        onPress={() =>
          router.push({
            pathname: '/findRide',
            params: {
              from: fromCoords?.label ?? '',
              to: toCoords?.label ?? '',
              date: date.toISOString(),
            },
          })
        }
      >
        <Text className="text-black text-lg font-bold mr-2">Find Ride</Text>
        <MaterialIcons name="chevron-right" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default RideOptionsCard;
