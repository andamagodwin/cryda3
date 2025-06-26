import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Tabs } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import React from "react";

export default function TabLayout() {
	const colorScheme = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
				headerShown: false,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color, focused }) => (
						<AntDesign name="home" size={28} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="wallet"
				options={{
					title: "Wallet",
					tabBarIcon: ({ color, focused }) => (
						 <AntDesign name="wallet" size={28} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="rides"
				options={{
					title: "Rides",
					tabBarIcon: ({ color, focused }) => (
						<AntDesign name="car" size={28} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color, focused }) => (
						<AntDesign name="user" size={28} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
