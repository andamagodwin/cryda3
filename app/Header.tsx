

import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from '@expo/vector-icons';

export default function Header() {
    // Example data - you would fetch this from your state or API
    const userTokens = 1250;
    const hasNewNotifications = true;

    return (
        <View className="w-full flex-row items-center justify-between bg-primary px-6 pt-6 pb-3 h-28">
            <View>
                <TouchableOpacity className="flex-row items-center space-x-2 rounded-full bg-black px-3 py-1.5">
                    <Feather name="database" size={18} color="#FFDE21" />
                    <Text className="font-bold text-primary">{userTokens}</Text>
                </TouchableOpacity>
            </View>

            {/* Right-side icons */}
            <View className="flex-row items-center space-x-4">
                {/* Tokens Display */}
                

                {/* Notification Bell */}
                <TouchableOpacity className="relative p-2 bg-black rounded-full">
                    <Feather name="bell" size={24} color="#FFDE21" />
                    {hasNewNotifications && (
                        <View className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-primary" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    )
}