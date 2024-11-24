import Colors from '@/constants/Colors';
import { QuyHoachResponse } from '@/constants/interface';
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
    const [listPlanning, setListPlanning] = useState<QuyHoachResponse[] | null>(null);
    const [districtName, setDistrictName] = useState<string | null>(null);
    // State
    const listImagePlanning = usePlanningStore((state) => state.listPlanningImage);
    const listPlanningTree = usePlanningStore((state) => state.listPlanningTree);
    const doublePressListPlanning = usePlanningStore(state=> state.listPlanningItemDoublePress)
    // dispatch
    const changeListPlanningImage = usePlanningStore((state) => state.changeImagePlanning);
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
        const imageExists = listImagePlanning?.includes(item.huyen_image);
        if (!imageExists) {
            changeListPlanningImage(item.huyen_image);
            const { centerLat, centerLon, latitudeDelta, longitudeDelta } =
                await getCenterOfBoundingBoxes(item.location ? item.location : item.boundingbox);
            doSetLatLon({
                lat: centerLat as number,
                lon: centerLon as number,
                latitudeDelta: latitudeDelta,
                longitudeDelta: longitudeDelta,
            });
        } else {
            changeListPlanningImage(item.huyen_image);
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

            console.log(filtered);
            setListDistrict(filtered);
        }
        if (query === '') {
            setListDistrict(listPlanningTree);
        }
    };
    const handleHiddenDistrictPlanning = (item: IListPlanning) => {
        doRemoveDistrictTreeWithPlanningList(item.planning);
    };
    // useEffect function
    useEffect(() => {
        setListDistrict(listPlanningTree);
    }, [listPlanningTree]);
    useEffect(()=>{
        setListPlanning(doublePressListPlanning)
    },[doublePressListPlanning])
    return (
        <BottomSheet
            backdropComponent={renderBackdrop}
            ref={ref}
            snapPoints={['65%', '70%']}
            index={-1}
            enablePanDownToClose
            onClose={() => Keyboard.dismiss()}
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
                {listDistrict && !listPlanning && (
                    <FlatList
                        ListHeaderComponent={
                            <View className=" py-2 bg-white">
                                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                                    <TextInput
                                        value={searchQuery}
                                        onChangeText={handleSearch}
                                        placeholder="Tìm kiếm theo tên huyện"
                                        placeholderTextColor={'#7777'}
                                        className="border border-[#7777] rounded px-3 py-2 text-base"
                                    />
                                </TouchableWithoutFeedback>
                            </View>
                        }
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
                                onPress={() => {
                                    setListPlanning(item.planning);
                                    setDistrictName(item.name);
                                }}
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
                                    onPress={() => handleHiddenDistrictPlanning(item)}
                                    className="absolute right-2"
                                >
                                    <FontAwesome name="trash-o" size={20} color="gray" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}
                    />
                )}

                {listPlanning &&(
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
                                        Danh sách quy hoạch của{' '}
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
                                    onPress={() => handleChoosePlanning(item)}
                                    style={styles.container}
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
                                        {item.description}
                                    </Text>
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
