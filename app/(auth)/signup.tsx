import { useState, useEffect } from "react";
import { Alert, AppState, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../utils/supabase";
import { useRouter } from "expo-router";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    return () => subscription.remove();
  }, []);

  const handleSignup = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) Alert.alert("Signup Error", error.message);
    else if (!data.session) Alert.alert("Check your inbox to verify email.");

    setLoading(false);
  };

  return (
    <View className="flex-1 items-center justify-center px-6 bg-white">
      <Text className="text-2xl font-bold mb-6">Sign Up</Text>

      <TextInput
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4"
        placeholder="Email"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
        keyboardType="email-address"
      />

      <TextInput
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4"
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity
        className={`w-full bg-green-600 rounded-lg py-3 mt-2 ${loading && "opacity-50"}`}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold">Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text className="text-blue-500 mt-4">Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}
