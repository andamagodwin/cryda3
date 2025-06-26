import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, ScrollView, Alert } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDriveStore } from '../../store/driveStore';
import { supabase } from '../../utils/supabase';



export default function CreateDriveForm() {
  const { startLocation, endLocation } = useDriveStore( );
  const [price, setPrice] = useState('');

  const [driverName, setDriverName] = useState('');
  const [carType, setCarType] = useState('');
  const [numberPlate, setNumberPlate] = useState('');
  const [seats, setSeats] = useState('');


  const [date, setDate] = useState(new Date());
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChangeDate = (_: any, selectedDate?: Date) => {
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
        onChange: handleChangeDate,
        mode,
        is24Hour: false,
      });
    } else {
      setShowDatePicker(true);
    }
  };

  const handleSubmit = async () => {
  if (!driverName || !carType || !numberPlate || !seats || !startLocation || !endLocation) {
    Alert.alert('Missing Fields', 'Please fill all the required fields.');
    return;
  }

  const departureTime = date.toISOString(); // Convert to ISO format

  const { error } = await supabase.from('drives').insert({
    driver_name: driverName,
    car_type: carType,
    number_plate: numberPlate,
    seats: Number(seats),
    price: Number(price),
    start_location: startLocation,
    end_location: endLocation,
    departure_time: departureTime,
  });

  if (error) {
    console.error('Supabase insert error:', error);
    Alert.alert('Error', 'Failed to create drive.');
  } else {
    // Optionally add to Zustand store
    

    Alert.alert('Success', 'Drive has been created successfully.');
    setDriverName('');
    setCarType('');
    setNumberPlate('');
    setSeats('');
    setPrice('');
    setDate(new Date());
    router.push('/'); // Navigate back to home
  }
};

  return (
    <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 ,width: '100%'}} className="bg-white w-11/12">
      <View className=''>
        <Text className="text-2xl font-bold mb-4">Create a Ride</Text>

      <Text className="mb-1 text-gray-600">Drivers Name</Text>
      <TextInput
        value={driverName}
        onChangeText={setDriverName}
        placeholder="e.g. John Doe"
        className="border border-black rounded-lg p-3 mb-4"
      />

      <Text className="mb-1 text-gray-600">Car Type</Text>
      <TextInput
        value={carType}
        onChangeText={setCarType}
        placeholder="e.g. Toyota Wish"
        className="border border-black rounded-lg p-3 mb-4"
      />

      <Text className="mb-1 text-gray-600">Number Plate</Text>
      <TextInput
        value={numberPlate}
        onChangeText={setNumberPlate}
        placeholder="e.g. UBA 123C"
        className="border border-black rounded-lg p-3 mb-4"
      />

      <Text className="mb-1 text-gray-600">Number of Seats</Text>
      <TextInput
        value={seats}
        onChangeText={setSeats}
        placeholder="e.g. 4"
        keyboardType="numeric"
        className="border border-black rounded-lg p-3 mb-4"
      />

      <Text className="mb-1 text-gray-600">Price per Seat (UGX)</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="e.g. 10000"
        keyboardType="numeric"
        className="border border-black rounded-lg p-3 mb-4"
      />


      {/* Start Location */}
      <TouchableOpacity
        className="flex-row items-center py-3 border-b border-gray-200 mb-2"
        onPress={() => router.push('/pickupLocation?type=start')}
      >
        <MaterialIcons name="location-on" size={24} color="#3d90ef" className="mr-3" />
        <Text className="text-base text-[#333]">
          {startLocation?.label || 'Select Start Location'}
        </Text>
      </TouchableOpacity>

      {/* End Location */}
      <TouchableOpacity
        className="flex-row items-center py-3 border-b border-gray-200 mb-2"
        onPress={() => router.push('/destination?type=end')}
      >
        <MaterialIcons name="location-pin" size={24} color="#ff6b6b" className="mr-3" />
        <Text className="text-base text-[#333]">
          {endLocation?.label || 'Select Destination'}
        </Text>
      </TouchableOpacity>

      {/* Pick Date */}
      <TouchableOpacity
        className="flex-row items-center py-3 border-b border-gray-200 mb-2"
        onPress={() => showPicker('date')}
      >
        <Ionicons name="calendar" size={24} color="#4cd964" className="mr-3" />
        <Text className="text-base text-[#333]">
          {date.toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      {/* Pick Time */}
      <TouchableOpacity
        className="flex-row items-center py-3 border-b border-gray-200 mb-4"
        onPress={() => showPicker('time')}
      >
        <Ionicons name="time" size={24} color="#ffce54" className="mr-3" />
        <Text className="text-base text-[#333]">
          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>

      {/* DateTimePicker for iOS */}
      {Platform.OS === 'ios' && showDatePicker && (
        <DateTimePicker
          value={date}
          mode={pickerMode}
          display="default"
          onChange={handleChangeDate}
        />
      )}

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-primary p-4 rounded-lg items-center"
      >
        <Text className="text-black font-bold text-lg">Create Drive</Text>
      </TouchableOpacity>

      </View>
      
    </ScrollView>
  );
}
