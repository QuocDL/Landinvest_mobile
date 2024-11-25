import Colors from '@/constants/Colors';
import { usePlanningStore } from '@/store/planningStore';
import useSearchStore from '@/store/searchStore';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Button } from '@rneui/themed';
import axios from 'axios';
import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
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
    const [listProvince, setListProvince] = useState(null);
    const [viewIndex, setViewIndex] = useState<'province' | 'district' | 'planning'>('province');
    const [loadingExpand, setLoadingExpand] = useState<{province: CollapseState}>({province: {}})
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

    // Handle collapse toggle
    const toggleCollapseProvince = (item: any) => {
        setCollapseProvinceState((prevState) => ({
            ...prevState,
            [item.id_tinh]:
                prevState[item.id_tinh] === undefined ? false : !prevState[item.id_tinh],
        }));
        if(!collapseProvinceState[item.id_tinh]){
            setLoadingExpand((prev) => ({
                ...prev,
                province: {
                    ...prev.province,
                    [item.id_tinh]:
                        prev.province[item.id_tinh] === undefined ? true : !prev.province[item.id_tinh],
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
            const { data } = await axios.get(`https://api.quyhoach.xyz/sap_xep_tinh_quan_huyen`);
            if (data) {
                setListProvince(data[1]);
                const initialCollapseState = data[1].reduce((acc: any, item: any) => {
                    acc[item.id_tinh] = false;
                    return acc;
                }, {});
                setCollapseProvinceState(initialCollapseState);
                setLoadingExpand({province: initialCollapseState})
                const initialCollapseDistrictState = data[1].reduce(
                    (provinceAcc: any, province: any) => {
                        province.quan_huyen_1_tinh.forEach((district: any) => {
                            provinceAcc[district.id_huyen] = false;
                        });
                        return provinceAcc;
                    },
                    {},
                );

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
            handleComponent={() =>
                viewIndex !== 'province' ? (
                    <TouchableOpacity
                        onPress={() => setViewIndex('province')}
                        className="flex-row items-center pt-2 justify-start gap-2 px-2.5 h-8 bg-white border-b border-white rounded-t-2xl"
                    >
                        <Ionicons name="arrow-back" size={20} color="black" />
                        {/* <Text className="text-black font-medium">Quay về</Text> */}
                    </TouchableOpacity>
                ) : (
                    <View className="h-8 pt-2 w-full items-center justify-center rounded-t-2xl bg-white">
                        <View className="h-1.5 w-12 rounded-full bg-gray-400" />
                    </View>
                )
            }
        >
            <BottomSheetView>
                {listProvince && viewIndex === 'province' && (
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
                            )
                            return(
                            <View key={item.id_tinh}>
                                <TouchableOpacity
                                    disabled={!hasPlanning}
                                    onPress={() =>
                                        hasPlanning
                                            ? toggleCollapseProvince(item)
                                            : null
                                    }
                                    style={styles.container}
                                    className={`disabled:opacity-35 flex flex-row items-center pr-3 h-14 rounded border-[1px] border-[#777777] `}
                                >
                                    {hasPlanning && (
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
                                    )}
                                    <Text className="flex-1 font-medium ml-2 text-base">
                                        {item.name_tinh} - {item.id_tinh}
                                    </Text>
                                    {loadingExpand.province[item.id_tinh] ? <ActivityIndicator size={'small'} color={'black'}/> : <></>}
                                </TouchableOpacity>
                                {/* Collapsible content */}
                                <Collapsible
                                    onAnimationEnd={()=> setLoadingExpand((prevState) => ({
                                        ...prevState,
                                        province: {
                                            ...prevState.province,
                                            [item.id_tinh]: false,
                                        },
                                    }))}
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
                                            district.quyhoach && district.quyhoach.length > 0 ? (
                                                <>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            toggleCollapseDistrict(
                                                                district.id_huyen,
                                                            );
                                                        }}
                                                        className={`flex mt-2 flex-row items-center pr-3 h-12 rounded border-[1px] border-[#777777] `}
                                                    >
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
                                                        <Text className="flex-1 font-medium ml-2 text-base">
                                                            {district.name_huyen} -{' '}
                                                            {district.id_huyen}
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
                                                            renderItem={({ item: planning }) => {
                                                                return (
                                                                    <TouchableOpacity
                                                                        className={`flex mt-2 flex-row items-center pr-3 h-12 rounded border-[1px] border-[#777777] `}
                                                                    >
                                                                        <Text className="flex-1 font-medium ml-2 text-base">
                                                                            {planning.description} -{' '}
                                                                            {planning.id_quyhoach}
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
                        )}}
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
