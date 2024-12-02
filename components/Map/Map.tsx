import { CheckpointsIcon, RecyclebinIcon } from '@/assets/icons';
import { LocationData, QuyHoachResponse } from '@/constants/interface';
import { PlanningServices } from '@/service/PlanningServices';
import { usePlanningStore } from '@/store/planningStore';
import useMarkerStore from '@/store/quyhoachStore';
import useRefStore from '@/store/refStore';
import useSearchStore from '@/store/searchStore';
import { getCenterOfBoundingBoxes } from '@/utils/GetCenterOfBoundingBox';
import { requestLocationPermission } from '@/utils/Permission';
import { Entypo, Feather } from '@expo/vector-icons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { Divider } from '@rneui/themed';
import axios from 'axios';
import * as Location from 'expo-location';
import React, { memo, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { ClickEvent, MapPressEvent, Marker, Region, UrlTile } from 'react-native-maps';
type IMapsPropsType = {
    setLocationInfo: (data: LocationData) => void;
    opacity: number;
};
const MemoizedUrlTile = React.memo(UrlTile);
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
    const mapType = useRefStore((state) => state.mapType);
    const sheetPlanningRef = useRefStore((state) => state.sheetPlanningRef);
    const {
        lat,
        lon,
        latitudeDelta: latDeltaGlobal,
        longitudeDelta: lonDeltaGlobal,
    } = useSearchStore((state) => state);
    const listImagePlanning = usePlanningStore((state) => state.listPlanningImage);
    const listImageBoundingBox = usePlanningStore((state) => state.boundingBoxImage);
    // Store Dispatch
    const doSetDistrictId = useSearchStore((state) => state.doSetDistrictId);
    const doRemovePlanningList = useMarkerStore((state) => state.doRemovePlanningList);
    const doAddPlanningList = usePlanningStore((state) => state.doAddListPlanningTree);
    const doChangeImagePlanning = usePlanningStore((state) => state.changeImagePlanning);
    const doDoublePressSetPlanning = usePlanningStore((state) => state.doDoublePressAddPlanning);
    const doSetListImageBoundingBox = usePlanningStore((state) => state.doSetListImageBoudingBox);
    // MapState
    const [imagePlanning, setImagePlanning] = useState<string[] | null>(null);
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
    // Loading State
    const [loadingGoToUser, setLoadingGoToUser] = useState<boolean>(false);
    const [loadingGlobal, setLoadingGlobal] = useState<boolean>(false);
    // Function On Change
    const onMoveMapEnd = async (newRegion: Region) => {
        const { latitude, longitude, latitudeDelta } = newRegion;

        if (mapRef.current) {
            const data = await addressForCoordinate(latitude, longitude);
            if (latitudeDelta < 0.065) {
                const boudingBox = await mapRef.current.getMapBoundaries();
                const params = [
                    boudingBox.southWest.longitude,
                    boudingBox.southWest.latitude,
                    boudingBox.northEast.longitude,
                    boudingBox.northEast.latitude,
                ];
                const boudingBoxImageData = await PlanningServices.getListImagesByBoundingBox(
                    params,
                );
                if (boudingBoxImageData.list_image.length > 0) {
                    doSetListImageBoundingBox(boudingBoxImageData.list_image);
                } else {
                    doSetListImageBoundingBox(null);
                }
            } else {
                doSetListImageBoundingBox(null);
            }

            if (data?.subAdministrativeArea) {
                setDistrictName(data?.subAdministrativeArea || '');
            }
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
                accuracy: Location.Accuracy.Balanced,
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
            const checkLocation = listImageBoundingBox?.some((item) => {
                const [lat, lon] = item.location.split(',').map(Number);
                return lat === latitude && lon === longitude;
            });
            if (!checkLocation) {
                const data = await addressForCoordinate(latitude, longitude);

                setLocationInfo(data as LocationData);
                setLocation({
                    latitude,
                    longitude,
                });
                moveToLocation(latitude, longitude);
                setLoadingGlobal(false);
            }
        } catch (error) {
            setLoadingGlobal(false);
            Alert.alert('Thao tác quá nhanh vui lòng thử lại!');
        }
    };
    const handleDoublePress = async (e: ClickEvent) => {
        try {
            setLoadingGlobal(true);
            const { latitude, longitude } = e.nativeEvent.coordinate;
            const info = await addressForCoordinate(latitude, longitude);
            // const infoProvince = await addressForCoordinate()
            if (info?.countryCode === 'VN') {
                try {
                    const searchIdDistrict = await PlanningServices.getDistrictIdByLocation([
                        latitude,
                        longitude,
                    ]);
                    const { data: dataQuyHoach } = await axios.get<QuyHoachResponse[]>(
                        `https://api.quyhoach.xyz/quyhoach1quan/${searchIdDistrict.district}`,
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
                            await mapRef.current?.animateToRegion(
                                {
                                    latitude: centerLat,
                                    longitude: centerLon,
                                    latitudeDelta: 0.13527821510000138,
                                    longitudeDelta: 0.0966010987000061,
                                },
                                1000,
                            );
                            setLocation({
                                latitude: centerLat,
                                longitude: centerLon,
                            });
                            doDoublePressSetPlanning(dataQuyHoach);
                            if (dataQuyHoach.length > 1) {
                                sheetPlanningRef?.current?.expand();
                            }
                            doChangeImagePlanning(dataQuyHoach[0].huyen_image);
                            doAddPlanningList({
                                name: dataQuyHoach[0].ten_quan as string,
                                planning: dataQuyHoach,
                            });
                        }
                        setLoadingGlobal(false);
                    } else {
                        Alert.alert('Lỗi hệ thống vui lòng thử lại sau');
                        setLoadingGlobal(false);
                    }
                } catch (error) {
                    Alert.alert('Lỗi hệ thống vui lòng thử lại sau');
                }
            }
        } catch (error) {
            setLoadingGlobal(false);
            console.log(error);
        }
    };
    // useEffect funtion state global
    useEffect(() => {
        if (lat !== 0 && lon !== 0) {
            const checkLocation = listImageBoundingBox?.some((item) => {
                const [latState, lonState] = item.location.split(',').map(Number);
                return latState === lat && lonState === lon;
            });
            if (!checkLocation) {
                setLocation({ latitude: lat, longitude: lon });
            }
            if (mapRef) {
                mapRef.current?.animateToRegion({
                    latitude: lat,
                    longitude: lon,
                    latitudeDelta:
                        latDeltaGlobal && latDeltaGlobal < 0.13527821510000138
                            ? (latDeltaGlobal as number)
                            : 0.13527821510000138,
                    longitudeDelta:
                        lonDeltaGlobal && lonDeltaGlobal < 0.0966010987000061
                            ? (latDeltaGlobal as number)
                            : 0.0966010987000061,
                });
            }
        }
    }, [lat, lon]);
    useEffect(() => {
        setImagePlanning(listImagePlanning);
    }, [listImagePlanning]);
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
                mapType={mapType}
                onPress={handlePressMap}
                onLongPress={(e) => console.log('longPress')}
                onDoublePress={handleDoublePress}
                onRegionChangeComplete={onChangeRegionMap}
            >
                <Marker zIndex={10} coordinate={location}>
                    <Image
                        source={require('@/assets/images/marker.png')}
                        style={{ width: 40, height: 40, resizeMode: 'contain' }}
                    />
                </Marker>
                {listImageBoundingBox &&
                    listImageBoundingBox.map((item, index) => {
                        const locationArr = item.location.split(',');
                        const convertLocation = {
                            latitude: parseFloat(locationArr[0]),
                            longitude: parseFloat(locationArr[1]),
                        };
                        return (
                            <Marker
                                key={index}
                                zIndex={5}
                                icon={undefined}
                                coordinate={convertLocation}
                            >
                                <Entypo name="location-pin" size={28} color="red" />
                            </Marker>
                        );
                    })}
                {imagePlanning &&
                    imagePlanning.map((item, index) => (
                        <MemoizedUrlTile
                            key={index}
                            urlTemplate={`${item}/{z}/{x}/{y}`}
                            maximumZ={25}
                            opacity={opacity}
                            maximumNativeZ={18}
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
