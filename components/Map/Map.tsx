import { CheckpointsIcon, RecyclebinIcon } from '@/assets/icons';
import { LocationData } from '@/constants/interface';
import { usePlanningStore } from '@/store/planningStore';
import useMarkerStore from '@/store/quyhoachStore';
import useRefStore from '@/store/refStore';
import useSearchStore from '@/store/searchStore';
import { getCenterOfBoundingBoxes } from '@/utils/GetCenterOfBoundingBox';
import { requestLocationPermission } from '@/utils/Permission';
import { Feather } from '@expo/vector-icons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { Divider } from '@rneui/themed';
import axios from 'axios';
import * as Location from 'expo-location';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import MapView, { ClickEvent, MapPressEvent, Marker, Region, UrlTile } from 'react-native-maps';
import { tags } from 'react-native-svg/lib/typescript/xmlTags';
import removeAccents from 'remove-accents';
type IMapsPropsType = {
    setLocationInfo: (data: LocationData) => void;
    opacity: number;
};
const Map = ({ opacity, setLocationInfo }: IMapsPropsType) => {
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
    // Store State
    const sheetPlanningRef = useRefStore((state) => state.sheetPlanningRef);
    const {
        lat,
        lon,
        latitudeDelta: latDeltaGlobal,
        longitudeDelta: lonDeltaGlobal,
    } = useSearchStore((state) => state);
    const listImagePlanning = usePlanningStore((state) => state.listPlanningImage);
    // Store Dispatch
    const doSetDistrictId = useSearchStore((state) => state.doSetDistrictId);
    const doRemovePlanningList = useMarkerStore((state) => state.doRemovePlanningList);
    const doAddPlanningList = usePlanningStore((state) => state.doAddListPlanningTree);
    const doChangeImagePlanning = usePlanningStore((state) => state.changeImagePlanning);
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
    const [districtName, setDistrictName] = useState<string | null>(null);
    const [idQueryMaps, setIdQueryMap] = useState<string | null>(null);
    const [isVietNam, setCheckingCountry] = useState<boolean>();
    // Loading State
    const [loadingGoToUser, setLoadingGoToUser] = useState<boolean>(false);
    const [loadingGlobal, setLoadingGlobal] = useState<boolean>(false);
    // Function On Change
    const onMoveMapEnd = async (newRegion: Region) => {
        const { latitude, longitude } = newRegion;
        if (mapRef.current) {
            setLoadingGlobal(true);
            const data = await addressForCoordinate(latitude, longitude);
            if (data?.subAdministrativeArea) {
                setDistrictName(data?.subAdministrativeArea || '');
                setLoadingGlobal(false);
            }
            if (data) {
                setCheckingCountry(data.countryCode === 'VN');
                setLocationInfo(data as LocationData);
                setLoadingGlobal(false);
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
            Alert.alert('Lỗi', 'Không xác định được vị trí hiện tại của bạn.');
        }
    };
    const handlePressMap = async (e: MapPressEvent) => {
        try {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            const data = await addressForCoordinate(latitude, longitude);
            setLocationInfo(data as LocationData);
            setLocation({
                latitude,
                longitude,
            });
            moveToLocation(latitude, longitude);
            setLoadingGlobal(false);
        } catch (error) {
            setLoadingGlobal(false);
            Alert.alert('Thao tác quá nhanh vui lòng thử lại!');
        }
    };
    const handleDoublePress = async (e: ClickEvent) => {
        if (loadingGlobal || !isVietNam) {
            Alert.alert('Chưa lấy được vị trí hiện tại vui lòng thử lại.');
        } else {
            try {
                const { data: dataQuyHoach } = await axios.get(
                    `https://api.quyhoach.xyz/quyhoach1quan/${idQueryMaps}`,
                );
                if (dataQuyHoach.length) {
                    const { centerLat, centerLon, latitudeDelta, longitudeDelta } =
                        await getCenterOfBoundingBoxes(
                            dataQuyHoach[0]?.location
                                ? dataQuyHoach[0].location
                                : dataQuyHoach[0].boundingbox,
                        );
                    if (
                        centerLat !== null &&
                        centerLon !== null &&
                        latitudeDelta !== null &&
                        longitudeDelta !== null &&
                        !listImagePlanning?.includes(dataQuyHoach[0].huyen_image)
                    ) {
                        mapRef.current?.animateToRegion(
                            {
                                latitude: centerLat,
                                longitude: centerLon,
                                latitudeDelta: latitudeDelta,
                                longitudeDelta: longitudeDelta,
                            },
                            1000,
                        );
                        setLocation({
                            latitude: centerLat,
                            longitude: centerLon,
                        });
                        doAddPlanningList({
                            name: districtName as string,
                            planning: dataQuyHoach,
                        });
                        sheetPlanningRef?.current?.expand();
                        doChangeImagePlanning(dataQuyHoach[0].huyen_image);
                        doAddPlanningList({
                            name: districtName as string,
                            planning: dataQuyHoach
                        })
                    } 
                }
            } catch (error) {
                console.log(error);
            }
        }
    };
    // Effect Function
    useEffect(() => {
        const getIdDistrictData = async () => {
            if (districtName) {
                try {
                    const apiNameDistrict = removeAccents(districtName.toLowerCase())
                        .split('.')
                        .pop();
                    const { data: getIdDistrict } = await axios.get(
                        `https://api.quyhoach.xyz/quyhoach/search/${apiNameDistrict}`,
                    );
                    if (getIdDistrict.Posts[0]) {
                        setIdQueryMap(getIdDistrict.Posts[0].idDistrict);
                    }
                } catch (error) {
                    doSetDistrictId(null);
                    setIdQueryMap(null);
                    doRemovePlanningList();
                }
            } else {
                setIdQueryMap(null);
            }
        };
        getIdDistrictData();
    }, [districtName]);
    // useEffect funtion state global
    useEffect(() => {
        if (lat !== 0 && lon !== 0) {
            setLocation({ latitude: lat, longitude: lon });
            if (mapRef) {
                mapRef.current?.animateToRegion({
                    latitude: lat,
                    longitude: lon,
                    latitudeDelta: latDeltaGlobal || region.latitudeDelta,
                    longitudeDelta: lonDeltaGlobal || region.longitudeDelta,
                });
            }
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
                onLongPress={(e) => console.log(e)}
                onDoublePress={handleDoublePress}
                onRegionChangeComplete={onChangeRegionMap}
            >
                <Marker coordinate={location}>
                    <Image
                        source={require('@/assets/images/marker.png')}
                        style={{ width: 40, height: 40, resizeMode: 'contain' }}
                    />
                </Marker>

                {listImagePlanning &&
                    listImagePlanning.map((item, index) => (
                        <UrlTile
                            key={index}
                            urlTemplate={`${item}/{z}/{x}/{y}`}
                            maximumZ={25}
                            opacity={opacity}
                            offlineMode
                            zIndex={-2}
                        />
                    ))}
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
