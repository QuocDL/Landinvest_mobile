import * as Location from 'expo-location'
import { Alert } from 'react-native';

export const requestLocationPermission = async () => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Quyền bị từ chối', 'Cần có quyền truy cập vị trí để căn giữa bản đồ vào vị trí của bạn.');
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error requesting location permissions:', error);
        return false;
    }
};