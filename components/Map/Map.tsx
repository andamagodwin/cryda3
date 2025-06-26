import { Text, View } from "react-native";
import Mapbox,{Camera, LocationPuck, MapView,requestAndroidLocationPermissions} from '@rnmapbox/maps'
import { useEffect } from "react";

const accessToken = 'pk.eyJ1IjoiYW5kYW1hZXpyYSIsImEiOiJjbWM3djMyamcwMmxuMmxzYTFsMThpNTJwIn0.9H7kNoaCYW0Kiw0wzrLfhQ';
Mapbox.setAccessToken(accessToken);

export default function Map() {
    useEffect(() => {
        // We need to ask for location permission to use features like followUserLocation
        const requestPermissions = async () => {
          await requestAndroidLocationPermissions();
        };
        requestPermissions();
    }, []);
    return (
            <MapView style={{ width: "100%", height: "100%" }}>
                <Camera followUserLocation followZoomLevel={18}/>
                <LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{isEnabled: true, color: '#FFDE21', radius: 100}} />
            </MapView>

    )
}