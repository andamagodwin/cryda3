import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';

interface TabSwitchProps {
  onTabChange: (direction: "left" | "right") => void;
}

const TabSwitch = ({ onTabChange }: TabSwitchProps) => {
  const [activeTab, setActiveTab] = useState<'left' | 'right'>('left');
  const position = useState(new Animated.Value(0))[0];

  const handleTabPress = (direction: 'left' | 'right') => {
    if (activeTab === direction) return;

    Animated.spring(position, {
      toValue: direction === 'left' ? 0 : 1,
      useNativeDriver: false,
    }).start();

    setActiveTab(direction);
    onTabChange(direction);
  };

  const leftPosition = position.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  return (
    <View className="items-center justify-center">
      <View className="rounded-full bg-white border border-[#FFDE21] p-2 w-[200px] max-w-[316px]">
        <View className="relative flex-row h-12">
          <Animated.View
            style={{
              position: 'absolute',
              width: '50%',
              top: 0,
              height: '100%',
              borderRadius: 27.5,
              backgroundColor: '#FFDE21',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 15,
              elevation: 2,
              left: leftPosition,
            }}
          />
          <TouchableOpacity
            className="flex-1 items-center justify-center z-10"
            onPress={() => handleTabPress('left')}
          >
            <Text className={`font-bold text-base ${activeTab === 'left' ? 'text-black' : 'text-[#FFDE21]'}`}>
              Ride
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 items-center justify-center z-10"
            onPress={() => handleTabPress('right')}
          >
            <Text className={`font-bold text-base ${activeTab === 'right' ? 'text-black' : 'text-[#FFDE21]'}`}>
              Drive
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default TabSwitch;


