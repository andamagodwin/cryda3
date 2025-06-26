import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ThirdwebProvider } from "thirdweb/react";
import { useAuth } from "../hooks/useAuth";

import { useColorScheme } from "@/hooks/useColorScheme";
import { StatusBar, View, ActivityIndicator } from "react-native";
import { Colors } from "../constants/Colors";
import 'react-native-reanimated';
import "../global.css"

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	
  	const router = useRouter();
  	const segments = useSegments();
  	const { session, loading } = useAuth();

	

  	const inAuthGroup = segments[0] === "(auth)";

	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	useEffect(() => {
		if (loading) return;

		if (!session && !inAuthGroup) {
			router.replace("/login");
		} else if (session && inAuthGroup) {
			router.replace("/"); // Redirect logged-in users away from login
		}
	}, [session, loading, segments]);

	if (loading) {
		return (
			<View className="flex-1 items-center justify-center bg-primary">
				<ActivityIndicator size="large" color="#FFFFFF" />
			</View>
		);
	}

	if (!loaded) {
		return null;
	}

	return (
		<ThirdwebProvider>
			<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
				<StatusBar
					backgroundColor={"#FFDE21"}
					barStyle="light-content"
				/>
				
				<Stack>
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
					<Stack.Screen name="(auth)" options={{ headerShown: false }} />
					<Stack.Screen name="+not-found" />
				</Stack>
			</ThemeProvider>
		</ThirdwebProvider>
	);
}
