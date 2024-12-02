import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Button, CheckBox, Image } from '@rneui/themed';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import { useSharedValue } from 'react-native-reanimated';

import { MapLocationIcon } from '@/assets/icons';
import Map from '@/components/Map/Map';
import Colors from '@/constants/Colors';
import { LocationData } from '@/constants/interface';
import { usePlanningStore } from '@/store/planningStore';
import useRefStore from '@/store/refStore';
import { Feather } from '@expo/vector-icons';
import { Tooltip } from '@rneui/base';
import BottomSheetShowing from '@/components/ui/BottomSheet/BottomSheetShowing';
import BottomSheetPlanning from '@/components/ui/BottomSheet/BottomSheetPlanning';
import BottomSheetImage from '@/components/ui/BottomSheet/BottomSheetImage';

const Page = () => {
    const [opacity, setOpacity] = useState(1);
    const [locationInfo, setLocationInfo] = useState<LocationData | null>(null);
    const sheetPlanningRef = useRef<BottomSheetModal>(null);
    const sheetPlanningIsShowingRef = useRef<BottomSheetModal>(null);
    const sheetImageBoundingBoxRef = useRef<BottomSheetModal>(null);
    const progress = useSharedValue(1);
    const min = useSharedValue(0);
    const max = useSharedValue(1);
    const doSetPlanningRef = useRefStore((state) => state.DoSetPlanningRef);
    const doSetGlobalPlanningRef = useRefStore((state) => state.DoSetGlobalPlanningRef);

    const planningList = usePlanningStore((state) => state.listPlanningTree);
    const mapType = useRefStore((state) => state.mapType);
    const DoSetMapType = useRefStore((state) => state.DoSetMapType);
    const listImageBoundingBox = usePlanningStore((state) => state.boundingBoxImage);
    const openBottomSheetPlanning = useCallback(() => {
        sheetPlanningRef.current?.expand();
    }, []);
    const openBottomSheetPlanningIsShowing = useCallback(() => {
        sheetPlanningIsShowingRef.current?.expand();
    }, []);
    const handleBottomSheetPlanningDismiss = useCallback(() => {
        sheetPlanningRef.current?.dismiss();
    }, []);
    const handleBottomSheetPlanningIsShowingDismiss = useCallback(() => {
        sheetPlanningIsShowingRef.current?.dismiss();
    }, []);
    const openBottomSheetImageBounding = useCallback(() => {
        sheetImageBoundingBoxRef.current?.expand();
    }, []);
    const handleBottomImageBoundingDismiss = useCallback(() => {
        sheetImageBoundingBoxRef.current?.dismiss();
    }, []);
    const handleOpacityChange = useCallback((value: number) => {
        setOpacity(Number(value.toFixed(1)));
    }, []);

    // useEffect funtion
    useEffect(() => {
        doSetPlanningRef(sheetPlanningIsShowingRef);
        doSetGlobalPlanningRef(sheetPlanningRef);
    }, [sheetPlanningRef, sheetPlanningIsShowingRef]);
    const [open, setOpen] = useState<boolean>(false);
    return (
        <View className="flex-1 justify-center items-center relative">
            <StatusBar style="light" />
            <Map opacity={opacity} setLocationInfo={setLocationInfo} />
            <View
                className=" w-full absolute bottom-0 left-0 pb-2 pt-1"
                style={{ backgroundColor: Colors.primary.header }}
            >
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="space-x-2 "
                    contentContainerStyle={{
                        gap: 5,
                    }}
                >
                    <View className="h-full py-1.5 min-w-[300px] bg-[#D9D9D9] rounded-3xl flex flex-row items-center justify-center space-x-2 px-2">
                        <MapLocationIcon />
                        <Text className="flex-1 font-normal text-sm">
                            {locationInfo?.administrativeArea === '(null)' &&
                                locationInfo.subAdministrativeArea === '(null)' &&
                                'Không có dữ liệu'}
                            {locationInfo?.administrativeArea !== '(null)' &&
                                locationInfo?.administrativeArea}
                            {locationInfo?.subAdministrativeArea !== '(null)' &&
                                ', ' + locationInfo?.subAdministrativeArea}
                            {!locationInfo?.administrativeArea && 'Không có dữ liệu'}
                        </Text>
                    </View>
                    {planningList && planningList !== null && planningList.length !== 0 && (
                        <Button
                            onPress={openBottomSheetPlanningIsShowing}
                            buttonStyle={[styles.buttonYearStyle]}
                        >
                            <Text className={'text-black'}>Quy hoạch đang hiển thị</Text>
                        </Button>
                    )}
                    <Button
                        onPress={openBottomSheetPlanning}
                        buttonStyle={[styles.buttonYearStyle, styles.activeYear]}
                    >
                        <Text className={'text-white'}>Danh sách quy hoạch</Text>
                    </Button>
                </ScrollView>
            </View>
            {listImageBoundingBox && listImageBoundingBox.length !== 0 && (
                <View className="rounded-md p-1 bg-white absolute top-2 left-16">
                    <TouchableOpacity onPress={openBottomSheetImageBounding} className='relative'>
                        <Image
                            PlaceholderContent={<ActivityIndicator/>}
                            style={{
                                width: 32,
                                height: 32,
                            }}
                            source={{ uri: listImageBoundingBox[0].imageHttp }}
                        />
                    </TouchableOpacity>
                </View>
            )}
            <View className="rounded-md p-2 bg-white absolute top-2 left-3">
                <Tooltip
                    visible={open}
                    onOpen={() => setOpen(true)}
                    onClose={() => {
                        setOpen(false);
                    }}
                    overlayColor={'transparent'}
                    backgroundColor={'white'}
                    height={90}
                    width={120}
                    popover={
                        <View className="w-full">
                            <Text className="ml-2 font-medium">Kiểu bản đồ</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    DoSetMapType('standard');
                                    setOpen(false);
                                }}
                                className="flex mt-2 items-center gap-3 flex-row"
                            >
                                <CheckBox
                                    containerStyle={{
                                        backgroundColor: 'transparent',
                                        borderWidth: 0,
                                        padding: 0,
                                        margin: 0,
                                    }}
                                    className="w-0"
                                    checked={mapType === 'standard'}
                                    checkedColor="green"
                                    checkedIcon="dot-circle-o"
                                    size={20}
                                    uncheckedIcon="circle-o"
                                />
                                <Text>Mặc định</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setOpen(false);
                                    DoSetMapType('hybrid');
                                }}
                                className="flex mt-2 items-center gap-3 flex-row"
                            >
                                <CheckBox
                                    containerStyle={{
                                        backgroundColor: 'transparent',
                                        borderWidth: 0,
                                        padding: 0,
                                        margin: 0,
                                    }}
                                    className="w-0"
                                    checkedColor="green"
                                    checked={mapType === 'hybrid'}
                                    checkedIcon="dot-circle-o"
                                    size={20}
                                    uncheckedIcon="circle-o"
                                />
                                <Text>Vệ tinh</Text>
                            </TouchableOpacity>
                        </View>
                    }
                >
                    <Feather name="layers" size={24} color="black" />
                </Tooltip>
            </View>
            <View className="absolute bottom-[115px] right-[-40px] rotate-[-90deg]">
                <Slider
                    progress={progress}
                    style={{ width: 120 }}
                    minimumValue={min}
                    maximumValue={max}
                    theme={{
                        disableMinTrackTintColor: '#fff',
                        maximumTrackTintColor: '#fff',
                        minimumTrackTintColor: Colors.primary.green,
                        cacheTrackTintColor: '#fff',
                        bubbleBackgroundColor: '#666',
                        heartbeatColor: '#999',
                    }}
                    onValueChange={handleOpacityChange}
                />
            </View>

            {/* <BottomSheet dismiss={dismiss} ref={sheetRef} /> */}
            <BottomSheetImage
                dismiss={handleBottomImageBoundingDismiss}
                ref={sheetImageBoundingBoxRef}
            />
            <BottomSheetShowing
                dismiss={handleBottomSheetPlanningIsShowingDismiss}
                ref={sheetPlanningIsShowingRef}
            />
            <BottomSheetPlanning
                dismiss={handleBottomSheetPlanningDismiss}
                ref={sheetPlanningRef}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    }, // className="w-fit p-2 rounded-3xl text-center items-center"

    buttonYearStyle: {
        borderRadius: 24,
        backgroundColor: '#D9D9D9',
        color: '#333',
        height: '100%',
    },
    buttonSaveStyle: {
        backgroundColor: '#B74C00',
        flexDirection: 'row',
        textAlign: 'center',
        borderRadius: 24,
    },
    buttonDollarStyle: {
        backgroundColor: Colors.primary.green,
        flexDirection: 'row',
        textAlign: 'center',
        borderRadius: 24,
    },
    activeYear: {
        backgroundColor: Colors.primary.green,
        color: '#fff',
    },
});
export default Page;
