import Colors from '@/constants/Colors';
import { PlanningServices } from '@/service/PlanningServices';
import { usePlanningStore } from '@/store/planningStore';
import useSearchStore from '@/store/searchStore';
import { getCenterOfBoundingBoxes } from '@/utils/GetCenterOfBoundingBox';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Button, CheckBox } from '@rneui/themed';
import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import Collapsible from 'react-native-collapsible';

export type Ref = BottomSheetModal;
interface CollapseState {
    [key: number]: boolean;
}

const BottomSheetPlanning = forwardRef<Ref, { dismiss: () => void }>((props, ref) => {
    // Component State
    const [collapseProvinceState, setCollapseProvinceState] = useState<CollapseState>({});
    const [collapseDistrictState, setCollapseDistrictState] = useState<CollapseState>({});
    const [filter, setFilter] = useState<boolean>(false);
    const [listProvince, setListProvince] = useState<IAllProvincePlanningResponse[] | null>(null);
    const [loadingExpand, setLoadingExpand] = useState<{
        province: CollapseState;
        district: CollapseState;
    }>({
        province: {},
        district: {},
    });
    // State
    const listImagePlanning = usePlanningStore((state) => state.listPlanningImage);

    // dispatch
    const doRemoveWithImagePlanningTree = usePlanningStore(
        (state) => state.removeWithImagePlanningTree,
    );
    const changeImagePlanning = usePlanningStore((state) => state.changeImagePlanning);
    const doSetNewLocation = useSearchStore((state) => state.doSetSearchResult);
    const doSetPlaningTree = usePlanningStore((state) => state.doAddListPlanningTree);
    // Backdrop render for bottom Sheet
    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
        ),
        [],
    );
    // handle press and onchange
    const onPressChoosePlanning = async (
        item: IPlanningResponse,
        district: IAllDistrictInProvinceResponse,
    ) => {
        const hasImagePlanning = listImagePlanning?.includes(item.huyen_image);
        if (!hasImagePlanning) {
            const { centerLat, centerLon, latitudeDelta, longitudeDelta } =
                await getCenterOfBoundingBoxes(item.location ? item.location : item.boundingbox);
            doSetNewLocation({
                lat: centerLat as number,
                lon: centerLon as number,
                latitudeDelta: latitudeDelta,
                longitudeDelta: longitudeDelta,
            });
            changeImagePlanning(item.huyen_image);
            doSetPlaningTree({
                name: district.name_huyen,
                planning: district.quyhoach,
            });
        } else {
            changeImagePlanning(item.huyen_image);
        }
    };
    const onPressChooseProvince = async (item: IAllProvincePlanningResponse) => {
        // KKiểm tra có ảnh quy hoạch quận huyện nào đang được hiển thị hay không
        const districtImage = item.quan_huyen_1_tinh
            .map((district) => district.quyhoach)
            .flat()
            .filter((q) => q.huyen_image)
            .map((q) => q.huyen_image);
        const hasMatchingImage = listImagePlanning?.some((imageItem) =>
            districtImage.includes(imageItem),
        );
        if (hasMatchingImage) {
            const matchingImage = listImagePlanning?.filter((imageItem) =>
                districtImage.includes(imageItem),
            );
            matchingImage?.forEach((e) => changeImagePlanning(e));
        } else {
            if (listImagePlanning?.includes(item.link_image)) {
                changeImagePlanning(item.link_image);
                return;
            }
            if (item.link_image.length === 0) {
                Alert.alert('Chưa có dữ liệu quy hoạch của cả tỉnh');
            } else {
                // Thêm ảnh tỉnh vào state để hiển thị
                changeImagePlanning(item.link_image);
                // Tìm những quy hoạch khả dụng ở trong 1 tỉnh để go tới boundingBox tỉnh đó
                const result = item.quan_huyen_1_tinh
                    .map((district) => {
                        if (district.quyhoach.length > 0) {
                            return district.quyhoach.map((q) => ({
                                huyen_name: district.name_huyen,
                                boundingbox: q.boundingbox || null,
                                location: q.location || null,
                            }));
                        }
                        return [];
                    })
                    .flat();
                const { centerLat, centerLon, latitudeDelta, longitudeDelta } =
                    await getCenterOfBoundingBoxes(
                        result[0].location ? result[0].location : result[0].boundingbox,
                    );
                doSetNewLocation({
                    lat: centerLat as number,
                    lon: centerLon as number,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta,
                });
                doSetPlaningTree({
                    name: item.name_tinh,
                    planning: [
                        {
                            boundingbox: `${
                                result[0].location ? result[0].location : result[0].boundingbox
                            }`,
                            coordation: '',
                            description: `Quy hoạch ${item.name_tinh}`,
                            huyen_image: item.link_image,
                            id_quyhoach: item.id_tinh,
                            idDistrict: item.id_tinh,
                            idProvince: item.id_tinh,
                            location: `${
                                result[0].location ? result[0].location : result[0].boundingbox
                            }`,
                        },
                    ],
                });
            }
        }
    };

    // Handle collapse toggle
    const toggleCollapseProvince = (item: any) => {
        setCollapseProvinceState((prevState) => ({
            ...prevState,
            [item.id_tinh]:
                prevState[item.id_tinh] === undefined ? false : !prevState[item.id_tinh],
        }));
        if (!collapseProvinceState[item.id_tinh]) {
            setLoadingExpand((prev) => ({
                ...prev,
                province: {
                    ...prev.province,
                    [item.id_tinh]:
                        prev.province[item.id_tinh] === undefined
                            ? true
                            : !prev.province[item.id_tinh],
                },
            }));
        }
    };
    const toggleCollapseDistrict = (id: number) => {
        setCollapseDistrictState((prevState) => ({
            ...prevState,
            [id]: prevState[id] === undefined ? false : !prevState[id],
        }));
    };
    // Fetch provinces data on mount
    useEffect(() => {
        (async () => {
            const data = await PlanningServices.getAllProvinceDistrictPlanning();
            if (data) {
                setListProvince(data[1]);
                const initialCollapseState = data[1].reduce((acc: any, item: any) => {
                    acc[item.id_tinh] = false;
                    return acc;
                }, {});
                setCollapseProvinceState(initialCollapseState);
                const initialCollapseDistrictState = data[1].reduce(
                    (provinceAcc: any, province: any) => {
                        province.quan_huyen_1_tinh.forEach((district: any) => {
                            provinceAcc[district.id_huyen] = false;
                        });
                        return provinceAcc;
                    },
                    {},
                );
                setLoadingExpand({
                    province: initialCollapseState,
                    district: initialCollapseDistrictState,
                });
                setCollapseDistrictState(initialCollapseDistrictState);
            }
        })();
    }, []);

    return (
        <BottomSheet
            backdropComponent={renderBackdrop}
            ref={ref}
            snapPoints={['80%', '80%']}
            index={-1}
            enablePanDownToClose
            onClose={() => {
                Keyboard.dismiss();
            }}
        >
            <BottomSheetView>
                {listProvince && (
                    <FlatList
                        className="min-h-full px-2 pt-2"
                        data={listProvince}
                        ListHeaderComponent={
                            <View>
                                <View className="flex flex-row pb-2 gap-2 items-center">
                                    <Button
                                        className="h-10"
                                        buttonStyle={[
                                            styles.buttonYearStyle,
                                            !filter && styles.activeYear,
                                        ]}
                                    >
                                        <Text className={'text-white'}>Tất cả</Text>
                                    </Button>
                                    <Button
                                        className="h-10"
                                        buttonStyle={[
                                            styles.buttonYearStyle,
                                            filter && styles.activeYear,
                                        ]}
                                    >
                                        <Text className={'text-white'}>Đang được hiện thị</Text>
                                    </Button>
                                </View>
                                <View className=" py-1 bg-white">
                                    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                                        <TextInput
                                            placeholder="Tìm kiếm"
                                            placeholderTextColor={'#7777'}
                                            className="border border-[#7777] rounded px-3 h-10 flex flex-row items-center text-base"
                                        />
                                    </TouchableWithoutFeedback>
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
                        initialNumToRender={1000}
                        renderItem={({ item }) => {
                            const hasPlanning = item.quan_huyen_1_tinh.some(
                                (district: any) =>
                                    district.quyhoach && district.quyhoach.length > 0,
                            );
                            const imageList = item.quan_huyen_1_tinh
                                .map((e) => e.quyhoach)
                                .flat()
                                .filter((e) => e.huyen_image)
                                .map((e) => e.huyen_image);
                            return (
                                <View key={item.id_tinh}>
                                    <TouchableOpacity
                                        disabled={!hasPlanning}
                                        onPress={() =>
                                            hasPlanning ? toggleCollapseProvince(item) : null
                                        }
                                        style={styles.container}
                                        className={`disabled:opacity-35 flex flex-row items-center pr-3 h-14 rounded border-[1px] border-[#777777] `}
                                    >
                                        {loadingExpand.province[item.id_tinh] ? (
                                            <ActivityIndicator
                                                className="mr-2"
                                                size={24}
                                                color={'black'}
                                            />
                                        ) : (
                                            hasPlanning && (
                                                <Ionicons
                                                    name={
                                                        collapseProvinceState[item.id_tinh]
                                                            ? 'remove'
                                                            : 'add'
                                                    }
                                                    size={24}
                                                    color="black"
                                                    className="mr-2"
                                                />
                                            )
                                        )}

                                        <Text
                                            numberOfLines={2}
                                            className="flex-1 font-medium ml-2 text-base"
                                        >
                                            {item.name_tinh} - {item.id_tinh}
                                        </Text>
                                        <CheckBox
                                            checked={
                                                listImagePlanning
                                                    ? listImagePlanning?.some((image) =>
                                                          imageList.includes(image),
                                                      ) ||
                                                      listImagePlanning.includes(item.link_image)
                                                    : false
                                            }
                                            onPress={() => onPressChooseProvince(item)}
                                            size={19}
                                            containerStyle={{
                                                backdropFilter: 'transparent',
                                                backgroundColor: 'transparent',
                                            }}
                                            // Use ThemeProvider to make change for all checkbox
                                            iconType="material-community"
                                            checkedIcon="checkbox-marked"
                                            uncheckedIcon="checkbox-blank-outline"
                                            checkedColor="green"
                                        />
                                    </TouchableOpacity>
                                    {/* Collapsible content */}
                                    <Collapsible
                                        onAnimationEnd={() =>
                                            setLoadingExpand((prevState) => ({
                                                ...prevState,
                                                province: {
                                                    ...prevState.province,
                                                    [item.id_tinh]: false,
                                                },
                                            }))
                                        }
                                        renderChildrenCollapsed={false}
                                        enablePointerEvents={true}
                                        duration={600}
                                        collapsed={collapseProvinceState[item.id_tinh] === false}
                                    >
                                        <FlatList
                                            className="pl-4"
                                            data={item.quan_huyen_1_tinh}
                                            keyExtractor={(item, index) => index.toString()}
                                            renderItem={({ item: district }) =>
                                                district.quyhoach &&
                                                district.quyhoach.length > 0 ? (
                                                    <>
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                toggleCollapseDistrict(
                                                                    district.id_huyen,
                                                                );
                                                            }}
                                                            className={`flex mt-2 flex-row items-center pr-3 h-12 rounded border-[1px] border-[#777777] `}
                                                        >
                                                            {loadingExpand.district[
                                                                district.id_huyen
                                                            ] ? (
                                                                <ActivityIndicator
                                                                    className="mr-2"
                                                                    size={24}
                                                                    color={'black'}
                                                                />
                                                            ) : (
                                                                hasPlanning && (
                                                                    <Ionicons
                                                                        name={
                                                                            collapseDistrictState[
                                                                                district.id_huyen
                                                                            ]
                                                                                ? 'remove'
                                                                                : 'add'
                                                                        }
                                                                        size={24}
                                                                        color="black"
                                                                        className="mr-2"
                                                                    />
                                                                )
                                                            )}
                                                            <Text
                                                                numberOfLines={2}
                                                                className="flex-1 font-medium ml-2 text-base"
                                                            >
                                                                {district.name_huyen} -{' '}
                                                                {district.id_huyen} - {item.id_tinh}
                                                            </Text>
                                                        </TouchableOpacity>
                                                        <Collapsible
                                                            renderChildrenCollapsed={false}
                                                            duration={300}
                                                            collapsed={
                                                                collapseDistrictState[
                                                                    district.id_huyen
                                                                ] === false
                                                            }
                                                        >
                                                            <FlatList
                                                                className="pl-4"
                                                                data={district.quyhoach}
                                                                keyExtractor={(item, index) =>
                                                                    index.toString()
                                                                }
                                                                renderItem={({
                                                                    item: planning,
                                                                }) => {
                                                                    const hasImage =
                                                                        listImagePlanning
                                                                            ? listImagePlanning?.includes(
                                                                                  planning.huyen_image,
                                                                              )
                                                                            : false;
                                                                    return (
                                                                        <TouchableOpacity
                                                                            onPress={() =>
                                                                                onPressChoosePlanning(
                                                                                    planning,
                                                                                    district,
                                                                                )
                                                                            }
                                                                            className={`flex mt-2 flex-row items-center pr-3 h-12 relative rounded border-[1px] border-[#777777] `}
                                                                        >
                                                                            <CheckBox
                                                                                className="h-10"
                                                                                checked={hasImage}
                                                                                onPress={() =>
                                                                                    onPressChoosePlanning(
                                                                                        planning,
                                                                                        district,
                                                                                    )
                                                                                }
                                                                                size={14}
                                                                                containerStyle={{
                                                                                    backdropFilter:
                                                                                        'transparent',
                                                                                    backgroundColor:
                                                                                        'transparent',
                                                                                }}
                                                                                iconType="material-community"
                                                                                checkedIcon="checkbox-marked"
                                                                                uncheckedIcon="checkbox-blank-outline"
                                                                                checkedColor="green"
                                                                            />
                                                                            <Text
                                                                                numberOfLines={2}
                                                                                className="flex-1 font-medium ml-2 text-base"
                                                                            >
                                                                                {
                                                                                    planning.description
                                                                                }{' '}
                                                                                -{' '}
                                                                                {
                                                                                    planning.id_quyhoach
                                                                                }
                                                                            </Text>
                                                                        </TouchableOpacity>
                                                                    );
                                                                }}
                                                            />
                                                        </Collapsible>
                                                    </>
                                                ) : null
                                            }
                                        />
                                    </Collapsible>
                                </View>
                            );
                        }}
                    />
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

export default BottomSheetPlanning;
