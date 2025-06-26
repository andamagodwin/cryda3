import {View, Text} from 'react-native';
import Map from '@/components/Map/Map';

export default function HomeScreen() {
    return (
        <View style={{ flex: 1 }}>
            <Text className='bg-red-500'>Home Screen</Text>
            <Map />
        </View>
    );
}
