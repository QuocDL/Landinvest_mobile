import Colors from '@/constants/Colors';
import { QuyHoachResponse } from '@/constants/interface';
import { IPlanningResponse } from '@/interfaces/planning/AllPlanningResponse';
import { usePlanningStore } from '@/store/planningStore';
import useSearchStore from '@/store/searchStore';
import { getCenterOfBoundingBoxes } from '@/utils/GetCenterOfBoundingBox';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    Keyboard,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import removeAccents from 'remove-accents';

export type Ref = BottomSheetModal;
type IListPlanning = {
    name: string;
    planning: QuyHoachResponse[];
};
const BottomSheetShowing = forwardRef<Ref, { dismiss: () => void }>((props, ref) => {
    // Component State
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [listDistrict, setListDistrict] = useState<IListPlanning[] | null>(null);
    const [listPlanning, setListPlanning] = useState<IPlanningResponse[] | null>(null);
    const [districtName, setDistrictName] = useState<string | null>(null);
    // State
    const listImagePlanning = usePlanningStore((state) => state.listPlanningImage);
    const listPlanningTree = usePlanningStore((state) => state.listPlanningTree);
    const doublePressListPlanning = usePlanningStore((state) => state.listPlanningItemDoublePress);
    // dispatch
    const doRemoveAllPlanning = usePlanningStore((state) => state.doRemoveAllPlanning);
    const changeImagePlanning = usePlanningStore((state) => state.changeImagePlanning);
    const doSetLatLon = useSearchStore((state) => state.doSetSearchResult);
    const doRemoveDistrictTreeWithPlanningList = usePlanningStore(
        (state) => state.doRemoveDistrictWithPlaningList,
    );
    // Backdrop render for bottom Sheet
    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
        ),
        [],
    );
    // Change IdDistrict onPress section planning
    const handleChoosePlanning = async (item: QuyHoachResponse) => {
        const imageExists = await listImagePlanning?.includes(item.huyen_image);
        if (!imageExists) {
            changeImagePlanning(item.huyen_image);
            const { centerLat, centerLon, latitudeDelta, longitudeDelta } =
                await getCenterOfBoundingBoxes(item.location ? item.location : item.boundingbox);
            doSetLatLon({
                lat: centerLat as number,
                lon: centerLon as number,
                latitudeDelta: latitudeDelta,
                longitudeDelta: longitudeDelta,
            });
        } else {
            changeImagePlanning(item.huyen_image);
        }
    };
    const handlePrevToViewDistrict = () => {
        if (listPlanning) {
            const hasSelectedImage = listPlanning.some((planning) =>
                listImagePlanning?.includes(planning.huyen_image),
            );
            if (!hasSelectedImage) {
                doRemoveDistrictTreeWithPlanningList(listPlanning);
            }
            setListPlanning(null);
            setDistrictName(null);
        }
    };
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (listDistrict) {
            // Tạo ra 2 phiên bản: một có dấu và một không dấu
            const normalizedQuery = removeAccents(query.toLowerCase());
            const filtered = listDistrict.filter((district) => {
                const normalizedDistrictName = removeAccents(district.name.toLowerCase());
                // So sánh cả chuỗi có dấu và không dấu
                return (
                    normalizedDistrictName.includes(normalizedQuery) ||
                    district.name.toLowerCase().includes(query.toLowerCase())
                );
            });
            setListDistrict(filtered);
        }
        if (query === '') {
            setListDistrict(listPlanningTree);
        }
    };
    const handleHiddenDistrictPlanning = (item: IListPlanning) => {
        doRemoveDistrictTreeWithPlanningList(item.planning);
    };
    const onPressGoToLocation = async (boundingBox: string) => {
        const { centerLat, centerLon, latitudeDelta, longitudeDelta } =
            await getCenterOfBoundingBoxes(boundingBox);
        doSetLatLon({
            lat: centerLat as number,
            lon: centerLon as number,
            latitudeDelta,
            longitudeDelta,
        });
    };
    // useEffect function
    useEffect(() => {
        setListDistrict(listPlanningTree);
    }, [listPlanningTree]);
    useEffect(() => {
        setListPlanning(doublePressListPlanning);
    }, [doublePressListPlanning]);
    const onChangeBottomSheet = () => {
        const listDistrict = listPlanningTree
            ?.map((district) => {
                // Check if none of the planning items has huyen_image present in listImagePlanning
                const planningWithoutImage = district.planning?.every((plan) => {
                    // Check if huyen_image exists and if it is NOT in listImagePlanning
                    return !plan.huyen_image || !listImagePlanning?.includes(plan.huyen_image);
                });

                // If all planning items do not have their huyen_image in listImagePlanning
                if (planningWithoutImage) {
                    return { name: district.name, planning: district.planning };
                }

                // Otherwise, return null
                return null;
            })
            .filter((district) => district !== null);
        listDistrict?.forEach((e) => doRemoveDistrictTreeWithPlanningList(e.planning));
    };
    useEffect(() => {
        if (!listPlanning) {
            onChangeBottomSheet();
        }
    }, [listImagePlanning]);
    return (
        <BottomSheet
            backdropComponent={renderBackdrop}
            ref={ref}
            snapPoints={['65%', '70%']}
            index={-1}
            enablePanDownToClose
            onClose={() => {
                Keyboard.dismiss();
                setListPlanning(null);
                onChangeBottomSheet();
            }}
            handleComponent={() =>
                listPlanning ? (
                    // Hiển thị nút quay lại khi có listPlanning
                    <TouchableOpacity
                        onPress={() => handlePrevToViewDistrict()}
                        hitSlop={10}
                        className="flex-row items-center pt-2.5 justify-start gap-2 px-2.5 h-10 bg-white border-b border-white rounded-t-2xl"
                    >
                        <Ionicons name="arrow-back" size={20} color="black" />
                        <Text className="text-black font-medium">Quay về</Text>
                    </TouchableOpacity>
                ) : (
                    // Thanh vuốt mặc định khi không có listPlanning
                    <View className="h-10 pt-2 w-full items-center justify-center rounded-t-2xl bg-white">
                        <View className="h-1.5 w-12 rounded-full bg-gray-400" />
                    </View>
                )
            }
        >
            <BottomSheetView>
                {/* {listDistrict && !listPlanning && (
                    <View className="py-2">
                        <Text className="text-center">
                            Không có dữ liệu quy hoạch đang được hiển thị
                        </Text>
                    </View>
                )} */}
                {listDistrict && listDistrict.length !== 0 && !listPlanning ? (
                    <FlatList
                        ListHeaderComponent={
                            <View className=" py-1 bg-white">
                                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                                    <TextInput
                                        value={searchQuery}
                                        onChangeText={handleSearch}
                                        placeholder="Tìm kiếm theo tên huyện"
                                        placeholderTextColor={'#7777'}
                                        className="border border-[#7777] rounded px-3 py-2 text-base"
                                    />
                                </TouchableWithoutFeedback>
                                <View className="flex flex-row justify-between">
                                    <Text className="py-1.5 font-medium">
                                        Danh sách quy hoạch đang được hiển thị
                                    </Text>
                                    <TouchableOpacity onPress={() => doRemoveAllPlanning()}>
                                        <Text className="py-1.5 text-sm text-[#777777]">
                                            Bỏ hiển thị
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        }
                        className="min-h-full px-2"
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
                                onPress={() => {
                                    setListPlanning(item.planning);
                                    setDistrictName(item.name);
                                }}
                            >
                                <Text
                                    numberOfLines={1}
                                    className={`flex-1 font-medium ml-2 text-base`}
                                >
                                    {item.name}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => handleHiddenDistrictPlanning(item)}
                                    className="absolute right-5"
                                    hitSlop={10}
                                >
                                    <FontAwesome name="trash-o" size={20} color="gray" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}
                    />
                ) : (
                    !listPlanning && (
                        <View className="py-2">
                            <Text className="text-center">
                                Không có dữ liệu quy hoạch đang được hiển thị
                            </Text>
                        </View>
                    )
                )}

                {listPlanning && listDistrict && listDistrict.length !== 0 && (
                    <View className="px-2">
                        <FlatList
                            className="min-h-full pt-2"
                            data={listPlanning}
                            contentContainerStyle={{
                                gap: 5,
                            }}
                            ListHeaderComponent={
                                <View className="py-2">
                                    <Text className="text-lg font-semibold">
                                        {'Danh sách quy hoạch của '}
                                        {districtName ? districtName : 'Quận/ Huyện'}
                                    </Text>
                                </View>
                            }
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
                                    className={`flex flex-row items-center pr-3 h-20 rounded border-[1px] border-[#777777] ${
                                        listImagePlanning?.includes(item.huyen_image)
                                            ? `bg-green-500`
                                            : 'bg-white'
                                    }`}
                                    activeOpacity={1}
                                    onPress={() => handleChoosePlanning(item)}
                                >
                                    <Image
                                        source={require('@/assets/images/quyhoach.png')}
                                        className="h-full w-20 bg-contain rounded-sm"
                                    />
                                    <Text className={`flex-1 font-medium ml-2 text-base`}>
                                        {item.description}
                                        {' | '}
                                        {item.id_quyhoach || item.id + ' - ' + item.idDistrict}
                                    </Text>
                                    <View>
                                        <TouchableOpacity
                                            onPress={() =>
                                                onPressGoToLocation(
                                                    item.location
                                                        ? item.location
                                                        : item.boundingbox,
                                                )
                                            }
                                            className="bg-slate-200 py-1.5 px-2 rounded-full"
                                        >
                                            <FontAwesome
                                                name="location-arrow"
                                                size={18}
                                                color="black"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}
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
export default BottomSheetShowing;