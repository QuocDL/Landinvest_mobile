import Colors from '@/constants/Colors';
import { QuyHoachResponse } from '@/constants/interface';
import { usePlanningStore } from '@/store/planningStore';
import useSearchStore from '@/store/searchStore';
import { getCenterOfBoundingBoxes } from '@/utils/GetCenterOfBoundingBox';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import axios from 'axios';
import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type Ref = BottomSheetModal;
type IListPlanning = {
    name: string;
    planning: QuyHoachResponse[];
};
const BottomSheetPlanning = forwardRef<Ref, { dismiss: () => void }>((props, ref) => {
    // Component State
    const [listProvince, setListProvince] = useState(null);
    const [listDistrict, setListDistrict] = useState<IListPlanning[] | null>(null);
    const [listPlanning, setListPlanning] = useState<QuyHoachResponse[] | null>(null);
    // State
    const listImagePlanning = usePlanningStore((state) => state.listPlanningImage);
    // dispatch
    const doRemoveWithImagePlanningTree = usePlanningStore(
        (state) => state.removeWithImagePlanningTree,
    );
    const changeListPlanningImage = usePlanningStore((state) => state.changeImagePlanning);
    const doSetNewLocation = useSearchStore((state) => state.doSetSearchResult);
    // Backdrop render for bottom Sheet
    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
        ),
        [],
    );
    // Change IdDistrict onPress section planning
    const handleChoosePlanningProvince = async (item: any) => {
        if (item.link_image === '') {
            item.quan_huyen_1_tinh.forEach((huyen: any) => {
                huyen.quyhoach?.forEach((qh: any) => {
                    changeListPlanningImage(qh.huyen_image);
                });
            });
        } else {
            const district = item.quan_huyen_1_tinh[item.quan_huyen_1_tinh.length - 1];
            const lastPlanning = district.quyhoach[0];
            const { centerLat, centerLon, latitudeDelta, longitudeDelta } =
                await getCenterOfBoundingBoxes(
                    lastPlanning.location ? lastPlanning.location : lastPlanning.boundingbox,
                );
            doSetNewLocation({
                lat: centerLat as number,
                lon: centerLon as number,
                latitudeDelta: latitudeDelta,
                longitudeDelta: longitudeDelta,
            });
            changeListPlanningImage(item.link_image);
        }
    };
    const handleSettingsProvince = (item: any) => {
        Alert.alert(
            'Lựa chọn',
            'Đang có quận huyện đang hiện thị quy hoạch hãy lựa chọn mong muốn của bạn.',
            [
                {
                    text: 'Xem quy hoạch trong huyện',
                    onPress: () => {
                        const filteredHuyen = item.quan_huyen_1_tinh.filter((huyen: any) =>
                            huyen.quyhoach?.some((qh: any) =>
                                listImagePlanning?.includes(qh.huyen_image),
                            ),
                        );
                        const filteredQuyHoach = filteredHuyen.flatMap(
                            (huyen: any) => huyen.quyhoach,
                        );
                    },
                },
                {
                    text: 'Bỏ hiển thị tất cả quy hoạch',
                    onPress: () => {
                        item.quan_huyen_1_tinh.forEach((huyen: any) => {
                            huyen.quyhoach?.forEach((qh: any) => {
                                if (listImagePlanning?.includes(qh.huyen_image)) {
                                    changeListPlanningImage(qh.huyen_image);
                                    doRemoveWithImagePlanningTree(qh.huyen_image);
                                }
                            });
                        });
                    },
                },
                {
                    text: 'Hủy bỏ',
                    style: 'cancel',
                },
            ],
        );
    };
    // useEffect function
    useEffect(() => {
        (async () => {
            const { data } = await axios.get(`https://api.quyhoach.xyz/sap_xep_tinh_quan_huyen`);
            if (data) {
                setListProvince(data[1]);
            }
        })();
    }, []);
    return (
        <BottomSheet
            backdropComponent={renderBackdrop}
            ref={ref}
            snapPoints={['70%', '70%']}
            index={-1}
            enablePanDownToClose
            handleComponent={() =>
                listPlanning ? (
                    // Hiển thị nút quay lại khi có listPlanning
                    <TouchableOpacity
                        onPress={() => setListPlanning(null)}
                        className="flex-row items-center pt-2 justify-start gap-2 px-2.5 h-8 bg-white border-b border-white rounded-t-2xl"
                    >
                        <Ionicons name="arrow-back" size={20} color="black" />
                        <Text className="text-black font-medium">Quay về</Text>
                    </TouchableOpacity>
                ) : (
                    // Thanh vuốt mặc định khi không có listPlanning
                    <View className="h-8 pt-2 w-full items-center justify-center rounded-t-2xl bg-white">
                        <View className="h-1.5 w-12 rounded-full bg-gray-400" />
                    </View>
                )
            }
        >
            <BottomSheetView>
                {listDistrict && listDistrict.length === 0 && (
                    <Text className="text-center ">Không có quy hoạch tại quận này</Text>
                )}
                {listProvince && !listPlanning && (
                    <FlatList
                        className="min-h-full px-2 pt-2"
                        data={listProvince}
                        contentContainerStyle={{
                            gap: 5,
                        }}
                        ListFooterComponent={
                            <View
                                style={{
                                    height: 10,
                                }}
                            ></View>
                        }
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.container}
                                className={`relative flex flex-row items-center pr-3 h-20 rounded border-[1px] border-[#777777] ${
                                    listImagePlanning?.includes(item.link_image) ||
                                    listImagePlanning?.some((image) =>
                                        item.quan_huyen_1_tinh?.some((huyen: any) =>
                                            huyen.quyhoach?.some(
                                                (qh: any) => qh.huyen_image === image,
                                            ),
                                        ),
                                    )
                                        ? `bg-[${Colors.primary.green}]`
                                        : 'bg-white'
                                }`}
                                onPress={() => {
                                    Alert.alert(
                                        'Lựa chọn',
                                        'Bạn muốn chọn quy hoạch của cả tỉnh hay là đi vào xem quy hoạch huyện?',
                                        [
                                            {
                                                text: `${
                                                    listImagePlanning?.includes(item.link_image)
                                                        ? `Bỏ hiển thị`
                                                        : 'Hiển thị cả tỉnh'
                                                }`,
                                                onPress: () => {
                                                    handleChoosePlanningProvince(item);
                                                },
                                            },
                                            {
                                                text: 'Xem huyện',
                                            },
                                            {
                                                text: 'Hủy bỏ',
                                                style: 'cancel',
                                            },
                                        ],
                                        { cancelable: true },
                                    );
                                }}
                            >
                                <Text
                                    numberOfLines={1}
                                    className={`flex-1 font-medium ml-2 text-base`}
                                >
                                    {item.name_tinh}
                                </Text>
                                {listImagePlanning?.some((image) =>
                                    item.quan_huyen_1_tinh?.some((huyen: any) =>
                                        huyen.quyhoach?.some((qh: any) => qh.huyen_image === image),
                                    ),
                                ) && (
                                    <TouchableOpacity>
                                        <AntDesign
                                            onPress={() => handleSettingsProvince(item)}
                                            name="setting"
                                            size={24}
                                            color="black"
                                        />
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                        )}
                    />
                )}
                {/* {listDistrict && !listPlanning && (
                    <FlatList
                        className="min-h-full px-2 pt-2"
                        data={listDistrict}
                        contentContainerStyle={{
                            gap: 5,
                        }}
                        ListFooterComponent={
                            <View
                                style={{
                                    height: 10,
                                }}
                            ></View>
                        }
                        keyExtractor={(item) => item.name.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.container}
                                className={`relative flex flex-row items-center pr-3 h-20 rounded border-[1px] border-[#777777] bg-white`}
                                onPress={() => setListPlanning(item.planning)}
                            >
                                <Image
                                    source={require('@/assets/images/quyhoach.png')}
                                    className="h-full w-20 bg-contain rounded-sm"
                                />
                                <Text
                                    numberOfLines={1}
                                    className={`flex-1 font-medium ml-2 text-base`}
                                >
                                    {item.name}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => handleRemoveDistrict(item)}
                                    className="absolute right-2"
                                >
                                    <FontAwesome name="trash-o" size={20} color="gray" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}
                    />
                )} */}
                {/* {listPlanning && (
                    <View className="px-2">
                        <FlatList
                            className="min-h-full pt-2"
                            data={listPlanning}
                            contentContainerStyle={{
                                gap: 5,
                            }}
                            ListFooterComponent={
                                <View
                                    style={{
                                        height: 10,
                                    }}
                                ></View>
                            }
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.container}
                                    onPress={() => handleChoosePlanning(item)}
                                    className={`flex flex-row items-center pr-3 h-20 rounded border-[1px] border-[#777777] ${
                                        listImagePlanning?.includes(item.huyen_image)
                                            ? `bg-[${Colors.primary.green}]`
                                            : 'bg-white'
                                    }`}
                                >
                                    <Image
                                        source={require('@/assets/images/quyhoach.png')}
                                        className="h-full w-20 bg-contain rounded-sm"
                                    />
                                    <Text
                                        numberOfLines={1}
                                        className={`flex-1 font-medium ml-2 text-base`}
                                    >
                                        {item.name_huyen}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}  */}
            </BottomSheetView>
        </BottomSheet>
    );
});
const styles = StyleSheet.create({
    container: {
        shadowColor: '#000',
        shadowOffset: {
            width: 3,
            height: 5,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,

        elevation: 10,
    },
});
export default BottomSheetPlanning;
/* <TouchableOpacity
style={styles.container}
className={`flex flex-row items-center pr-3 h-20 rounded border-[1px] border-[#777777] ${
    item.id === selectedDistrictId ? `bg-[${Colors.primary.green}]` : 'bg-white'
}`}
onPress={()=> handleChangePlanning(item)}
>
<Image
    source={require('@/assets/images/quyhoach.png')}
    className="h-full w-20 bg-contain rounded-sm"
/>
<Text
    numberOfLines={1}
    className={`flex-1 font-medium ml-2 ${
        item.id === selectedDistrictId ? `text-white` : 'text-black'
    }  text-base`}
>
    {item.description}
</Text>
</TouchableOpacity> */

// const handleChoosePlanning = async (item: QuyHoachResponse) => {
//     doSetDistrictId(item.id);
//     const { centerLat, centerLon, latitudeDelta, longitudeDelta } =
//         await getCenterOfBoundingBoxes(item.location);
//     doSetLatLon({
//         lat: centerLat as number,
//         lon: centerLon as number,
//         latitudeDelta: latitudeDelta,
//         longitudeDelta: longitudeDelta,
//     });
// };
