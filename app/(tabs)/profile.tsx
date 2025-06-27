import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../utils/supabase';
import { Feather } from '@expo/vector-icons';

// The component no longer needs to receive session as a prop
export default function Account() {
  const [loading, setLoading] = useState(true);
  // Add state to hold the session
  const [session, setSession] = useState<Session | null>(null);
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    // Fetch the session from Supabase when the component mounts
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', session.user.id)
        .single();

      if (error && status !== 406) throw error;

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
      // setLoading(false) was removed from here
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
    } finally {
      // This will now be the only place that sets loading to false
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const updates = {
        id: session.user.id,
        username,
        website,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.log('Update error:', error); // <-- Add this
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header Section */}
      <View className="bg-primary px-6 pt-12 pb-8">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-black">My Profile</Text>
          <View className="bg-black rounded-full p-3">
            <Feather name="user" size={24} color="#FFDE21" />
          </View>
        </View>
        
        {/* User Info Card */}
        <View className="bg-white rounded-2xl p-6 shadow-lg">
          <View className="items-center mb-4">
            <View className="bg-primary rounded-full p-4 mb-3">
              <Feather name="user" size={32} color="#000" />
            </View>
            <Text className="text-lg font-semibold text-gray-800">
              {username || 'Set your username'}
            </Text>
            <Text className="text-sm text-gray-500">{session?.user?.email}</Text>
          </View>
        </View>
      </View>

      {/* Form Section */}
      <View className="px-6 py-6">
        <Text className="text-lg font-semibold text-gray-800 mb-6">Profile Information</Text>
        
        {/* Email Field */}
        <View className="mb-5">
          <Text className="text-sm font-medium text-gray-700 mb-2">Email Address</Text>
          <View className="bg-white border border-gray-200 rounded-xl px-4 py-4 flex-row items-center">
            <Feather name="mail" size={20} color="#9CA3AF" />
            <TextInput
              value={session?.user?.email ?? ''}
              editable={false}
              className="flex-1 ml-3 text-gray-500 text-base"
            />
            <Feather name="lock" size={16} color="#9CA3AF" />
          </View>
        </View>

        {/* Username Field */}
        <View className="mb-5">
          <Text className="text-sm font-medium text-gray-700 mb-2">Username</Text>
          <View className="bg-white border border-gray-200 rounded-xl px-4 py-4 flex-row items-center focus:border-primary">
            <Feather name="user" size={20} color="#9CA3AF" />
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-gray-800 text-base"
            />
          </View>
        </View>

        {/* Website Field */}
        <View className="mb-8">
          <Text className="text-sm font-medium text-gray-700 mb-2">Website</Text>
          <View className="bg-white border border-gray-200 rounded-xl px-4 py-4 flex-row items-center">
            <Feather name="globe" size={20} color="#9CA3AF" />
            <TextInput
              value={website}
              onChangeText={setWebsite}
              placeholder="Enter your website"
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-gray-800 text-base"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View className="space-y-4">
          {/* Update Profile Button */}
          <TouchableOpacity
            onPress={updateProfile}
            disabled={loading}
            className={`${loading ? 'bg-gray-400' : 'bg-primary'} py-4 rounded-xl shadow-lg`}
          >
            <View className="flex-row items-center justify-center">
              <Feather name="save" size={20} color="#000" />
              <Text className="text-black text-center font-bold text-base ml-2">
                {loading ? 'Updating...' : 'Update Profile'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Sign Out Button */}
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Sign Out',
                'Are you sure you want to sign out?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Sign Out', 
                    style: 'destructive',
                    onPress: () => supabase.auth.signOut()
                  }
                ]
              );
            }}
            className="bg-white border-2 border-red-500 py-4 rounded-xl"
          >
            <View className="flex-row items-center justify-center">
              <Feather name="log-out" size={20} color="#EF4444" />
              <Text className="text-red-500 text-center font-bold text-base ml-2">
                Sign Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View className="mt-8 pt-6 border-t border-gray-200">
          <Text className="text-center text-sm text-gray-500 mb-2">
            CRYDA Ride Share
          </Text>
          <Text className="text-center text-xs text-gray-400">
            Version 1.0.0 • Powered by Blockchain
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
