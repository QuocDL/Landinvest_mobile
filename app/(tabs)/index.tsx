import Feather from '@expo/vector-icons/Feather';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Button } from '@rneui/themed';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import { useSharedValue } from 'react-native-reanimated';

import { DollarIcon, MapLocationIcon } from '@/assets/icons';
import Map from '@/components/Map/Map';
import Colors from '@/constants/Colors';
import { LocationData, QuyHoachResponse } from '@/constants/interface';
import useMarkerStore from '@/store/quyhoachStore';
import useSearchStore from '@/store/searchStore';
import useModalStore from '@/store/modalStore';

const Page = () => {
    const [opacity, setOpacity] = useState(1);
    const [locationInfo, setLocationInfo] = useState<LocationData | null>(null);
    const sheetRef = useRef<BottomSheetModal>(null);
    const sheetQuyHoachRef = useRef<BottomSheetModal>(null);
    const progress = useSharedValue(1);
    const min = useSharedValue(0);
    const max = useSharedValue(1);
    const doSetDistrictId = useSearchStore((state) => state.doSetDistrictId);
    const planningList = useMarkerStore((state) => state.planningList);
    const idDistrict = useSearchStore((state) => state.districtId);
    // Modal state
    const doSetOpenModalPlanning = useModalStore(state=> state.doOpenModalPlanningList)
    const isOpenModalPlanning = useModalStore(state=> state.modalPlanningList)

    const openBottomSheet = useCallback(() => {
        sheetRef.current?.present();
    }, []);

    const openBottomSheetQuyHoach = useCallback(() => {
        sheetQuyHoachRef.current?.present();
    }, []);

    // const handleBottomSheetQuyHoachDismiss = useCallback(() => {
    //     setActiveYear(0);
    //     sheetQuyHoachRef.current?.dismiss();
    // }, []);

    const handleQuyHoach = useCallback(
        (data: QuyHoachResponse) => {
            doSetDistrictId(data.id);
        },
        [openBottomSheetQuyHoach],
    );

    const handleOpacityChange = useCallback((value: number) => {
        setOpacity(Number(value.toFixed(1)));
    }, []);

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
                    <View className="h-full min-w-[300px] bg-[#D9D9D9] rounded-3xl flex flex-row items-center justify-center space-x-2 px-2">
                        <MapLocationIcon />
                        <Text className="flex-1 font-normal text-sm">
                            {locationInfo?.administrativeArea === '(null)' &&
                                locationInfo.subAdministrativeArea === '(null)' &&
                                'Không có dữ liệu'}
                            {locationInfo?.administrativeArea !== '(null)' &&
                                locationInfo?.administrativeArea}
                            {locationInfo?.subAdministrativeArea !== '(null)' &&
                                ', ' + locationInfo?.subAdministrativeArea}
                        </Text>
                    </View>
                    {planningList && (
                        <Button
                        onPress={()=> doSetOpenModalPlanning(true)}
                        buttonStyle={[styles.buttonYearStyle, isOpenModalPlanning == true && styles.activeYear]}
                    >
                        <Text className={`${isOpenModalPlanning === true ? 'text-white' : 'text-[#333]'}`}>Danh sách quy hoạch</Text>
                    </Button>
                    )}
                    <Button onPress={openBottomSheet} buttonStyle={styles.buttonDollarStyle}>
                        <DollarIcon />
                        <Text className="mx-1 text-white">Hiển thị giá</Text>
                        <Feather name="chevron-down" size={18} color="#fff" />
                    </Button>
                </ScrollView>
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

            {/* <BottomSheet dismiss={dismiss} ref={sheetRef} />
            <BottomSheetQuyHoach dismiss={handleBottomSheetQuyHoachDismiss} ref={sheetQuyHoachRef} /> */}
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
