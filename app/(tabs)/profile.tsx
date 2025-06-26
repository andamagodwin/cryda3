import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../utils/supabase';

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
    <View className="flex-1 bg-white px-4 pt-10">
      <Text className="text-2xl font-bold text-gray-800 mb-6">Account</Text>

      <View className="mb-4">
        <Text className="text-gray-600 mb-1">Email</Text>
        <TextInput
          value={session?.user?.email ?? ''}
          editable={false}
          className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-500"
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-600 mb-1">Username</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
          className="bg-white border border-gray-300 rounded-lg px-4 py-3"
        />
      </View>

      <View className="mb-4">
        <Text className="text-gray-600 mb-1">Website</Text>
        <TextInput
          value={website}
          onChangeText={setWebsite}
          placeholder="Enter website"
          className="bg-white border border-gray-300 rounded-lg px-4 py-3"
        />
      </View>

      <TouchableOpacity
        onPress={updateProfile}
        disabled={loading}
        className="bg-blue-600 py-4 rounded-lg mb-4"
      >
        <Text className="text-white text-center font-semibold">
          {loading ? 'Updating...' : 'Update Profile'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => supabase.auth.signOut()}
        className="bg-red-500 py-4 rounded-lg"
      >
        <Text className="text-white text-center font-semibold">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
