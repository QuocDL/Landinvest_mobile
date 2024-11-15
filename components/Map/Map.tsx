import { CheckpointsIcon, RecyclebinIcon } from '@/assets/icons';
import { requestLocationPermission } from '@/utils/Permission';
import { Feather } from '@expo/vector-icons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { Divider } from '@rneui/themed';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { ClickEvent, MapPressEvent, Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import useSearchStore from '@/store/searchStore';
import { LocationData } from '@/constants/interface';
type IMapsPropsType = {
    setLocationInfo: (data: LocationData) => void;
};
const Map = ({ setLocationInfo }: IMapsPropsType) => {
    // Ref element
    const mapRef = useRef<MapView>(null);
    // CustomHook with Ref
    const addressForCoordinate = async (latitude: number, longitude: number) => {
        if (mapRef.current) {
            const data = await mapRef.current.addressForCoordinate({ latitude, longitude });
            return data;
        }
        return null;
    };
    // searchStore State
    const { lat, lon } = useSearchStore((state) => state);
    // SearStore Dispatch

    // MapState
    const [location, setLocation] = useState({
        latitude: 21.16972,
        longitude: 105.84944,
    });
    const [region, setRegion] = useState<Region>({
        latitude: 21.16972,
        longitude: 105.84944,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });
    // Loading State
    const [loadingGoToUser, setLoadingGoToUser] = useState<boolean>(false);
    const [loadingGlobal, setLoadingGlobal] = useState<boolean>(false);
    // Function On Change
    const onMoveMapEnd = async (newRegion: Region) => {
        const { latitude, longitude } = newRegion;
        if (mapRef.current) {
            const data = await addressForCoordinate(latitude, longitude);
            if (data) {
                setLocationInfo(data as LocationData);
            }
        }
    };
    const onChangeRegionMap = (region: Region) => {
        onMoveMapEnd(region);
        setRegion(region);
    };
    // Function handle press
    const moveToLocation = (latitude: number, longitude: number) => {
        if (mapRef.current) {
            mapRef.current.animateToRegion(
                {
                    latitude,
                    longitude,
                    latitudeDelta: region.latitudeDelta,
                    longitudeDelta: region.longitudeDelta,
                },
                200,
            );
        }
    };
    const centerToUserLocation = async () => {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return;
        setLoadingGoToUser(true);
        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.BestForNavigation,
            });
            const { latitude, longitude, altitude } = location.coords;
            if (mapRef) {
                mapRef.current?.animateToRegion(
                    {
                        latitude,
                        longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    },
                    1500,
                );
            }
            setLocation({
                latitude,
                longitude,
            });
            setLoadingGoToUser(false);
        } catch (error) {
            setLoadingGoToUser(false);
            console.error('Error getting user location: ', error);
            Alert.alert('Lỗi', 'Không xác định được vị trí hiện tại của bạn.');
        }
    };
    const handlePressMap = async (e: MapPressEvent) => {
        setLoadingGlobal(true);
        const { latitude, longitude } = e.nativeEvent.coordinate;
        const data = await addressForCoordinate(latitude, longitude);
        setLocationInfo(data as LocationData);
        setLocation({
            latitude,
            longitude,
        });
        moveToLocation(latitude, longitude);
        setLoadingGlobal(false);
    };
    const handleDoublePress = (e: ClickEvent) => {
        e.preventDefault()
        console.log('handle Double click');
    };
    // Effect Function

    // Memo function
    useMemo(() => {
        if (lat !== 0 && lon !== 0) {
            setLocation({ latitude: lat, longitude: lon });
        }
    }, [lat, lon]);
    return (
        <>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: region.latitudeDelta,
                    longitudeDelta: region.longitudeDelta,
                }}
                mapType="hybridFlyover"
                onPress={handlePressMap}
                onDoublePress={handleDoublePress}
                onRegionChangeComplete={onChangeRegionMap}
            >
                <Marker coordinate={location}>
                    <Image
                        source={require('@/assets/images/marker.png')}
                        style={{ width: 40, height: 40, resizeMode: 'contain' }}
                    />
                </Marker>
            </MapView>
            {loadingGlobal && (
                <View className="absolute  flex flex-row bottom-14 left-2 items-start w-screen">
                    <ActivityIndicator color={'white'} size={'large'} />
                </View>
            )}
            <View
                className={
                    'flex flex-row items-center  space-x-2 p-1 absolute bottom-14 gap-2 right-9'
                }
            >
                <View className={'flex flex-row items-center bg-white rounded-md border  '}>
                    <TouchableOpacity className={`py-1 px-2  ${false && 'bg-[#d9d9d9]'}`}>
                        <CheckpointsIcon />
                    </TouchableOpacity>

                    <Divider orientation="vertical" />
                    <TouchableOpacity className={'py-1 px-2'}>
                        <RecyclebinIcon />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => centerToUserLocation()}
                    className={'p-2 bg-white rounded-full  border'}
                >
                    {loadingGoToUser ? (
                        <ActivityIndicator />
                    ) : (
                        <SimpleLineIcons name="cursor" size={20} color="black" />
                    )}
                </TouchableOpacity>

                <TouchableOpacity className={'p-2 bg-white rounded-full  border'}>
                    <Feather name="plus" size={20} color="black" />
                </TouchableOpacity>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    map: {
        width: '100%',
        height: '100%',
    },
});

export default memo(Map);
