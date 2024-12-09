import { QuyHoachResponse } from '@/constants/interface';
import { IPlanningAvailable } from '@/interfaces/planning/AllPlanningResponse';
import { IListPlaningAvailable } from '@/interfaces/planning/PlanningAvailable';
import { PlanningServices } from '@/service/PlanningServices';
import { usePlanningStore } from '@/store/planningStore';
import useSearchStore from '@/store/searchStore';
import { getCenterOfBoundingBoxes } from '@/utils/GetCenterOfBoundingBox';
import { FontAwesome } from '@expo/vector-icons';
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import { CheckBox } from '@rneui/base';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Keyboard,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
export type Ref = BottomSheetModal;

export const BottomSheetPlanningAvailable = forwardRef<Ref, { dismiss: () => void }>(
    (props, ref) => {
        // State Store
        const listPlanningAvailable = usePlanningStore((state) => state.listPlanningAvailable);
        const listImagePlanning = usePlanningStore((state) => state.listPlanningImage);
        // District Store
        const doChangeImagePlanning = usePlanningStore((state) => state.changeImagePlanning);
        const doSetLonLat = useSearchStore((state) => state.doSetSearchResult);
        const doSetListPlanningTree = usePlanningStore((state) => state.doAddListPlanningTree);
        // State components
        const [listData, setListData] = useState<IListPlaningAvailable[] | null>(null);
        const [listImage, setListImage] = useState<string[] | null>(null);
        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
            ),
            [],
        );
        useEffect(() => {
            setListData(listPlanningAvailable);
        }, [listPlanningAvailable]);
        const handlePressPlanningItem = async (item: IListPlaningAvailable) => {
            doChangeImagePlanning(item.link_quyhoach);
            if (!listImage?.includes(item.link_quyhoach)) {
                const { centerLat, centerLon, latitudeDelta, longitudeDelta } =
                    await getCenterOfBoundingBoxes(
                        item.location ? item.location : item.boundingbox,
                    );
                doSetLonLat({
                    lat: centerLat as number,
                    lon: centerLon as number,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta,
                });
                const districtInfor = await PlanningServices.getPlanningInDistrict(
                    item.idDistrict as string,
                );
                const planningList = districtInfor.list_image
                    .filter((item) => item.type !== 'DULIEU_DIACHINH')
                    .map((item) => ({
                        boundingbox: item.boundingbox,
                        coordation: item.coordation,
                        description: item.description,
                        huyen_image: item.link_quyhoach,
                        idDistrict: item.idDistrict,
                        idProvince: item.idProvince,
                    }));

                doSetListPlanningTree({
                    name: districtInfor.list_image[0].name_location as string,
                    planning: planningList as QuyHoachResponse[],
                });
            }
        };
        const handlePressGoToLocation = async (item: IListPlaningAvailable) => {
            const { centerLat, centerLon, latitudeDelta, longitudeDelta } =
                await getCenterOfBoundingBoxes(item.location ? item.location : item.boundingbox);
            doSetLonLat({
                lat: centerLat as number,
                lon: centerLon as number,
                latitudeDelta: latitudeDelta,
                longitudeDelta: longitudeDelta,
            });
        };
        useEffect(() => {
            setListImage(listImagePlanning);
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
                }}
            >
                <BottomSheetView>
                    <FlatList
                        data={listData}
                        className="min-h-full px-2 pt-2"
                        ListEmptyComponent={
                            <View className="flex justify-center items-center h-full">
                                <Text className="text-center font-semibold text-lg">
                                    Không có quy hoạch khả dụng trong vị trí này
                                </Text>
                            </View>
                        }
                        ListHeaderComponent={
                            <View>
                                <View className=" py-1 bg-white">
                                    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                                        <TextInput
                                            //  onChangeText={(text) => setSearchQuery(text)}
                                            placeholder="Tìm kiếm"
                                            placeholderTextColor={'#7777'}
                                            className="border border-[#7777] rounded px-3 h-10 flex flex-row items-center text-base"
                                        />
                                    </TouchableWithoutFeedback>
                                    <Text className="text-lg font-medium">
                                        Quy hoạch khả dụng trong vị trí hiện tại
                                    </Text>
                                </View>
                            </View>
                        }
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
                                onPress={() => handlePressPlanningItem(item)}
                                className={`relative flex flex-row items-center pr-3 h-20 rounded border-[1px] border-[#777777] bg-white`}
                            >
                                 <CheckBox
                                            checked={
                                               listImage ?  listImage?.includes(item.link_quyhoach) : false
                                            }
                                            onPress={() => handlePressPlanningItem(item)}
                                            size={24}
                                            containerStyle={{
                                                padding: 0,
                                                backdropFilter: 'transparent',
                                                backgroundColor: 'transparent',
                                            }}
                                            // Use ThemeProvider to make change for all checkbox
                                            iconType="material-community"
                                            checkedIcon="checkbox-marked"
                                            uncheckedIcon="checkbox-blank-outline"
                                            checkedColor="green"
                                        />
                                <Text
                                    numberOfLines={1}
                                    className={`flex-1 font-medium ml-2 text-base`}
                                >
                                    {item.description}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => handlePressGoToLocation(item)}
                                    className="bg-slate-200 py-1.5 px-2 rounded-full"
                                >
                                    <FontAwesome name="location-arrow" size={18} color="black" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}
                    />
                </BottomSheetView>
            </BottomSheet>
        );
    },
);
