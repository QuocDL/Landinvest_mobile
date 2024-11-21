import Colors from '@/constants/Colors';
import { QuyHoachResponse } from '@/constants/interface';
import useMarkerStore from '@/store/quyhoachStore';
import useSearchStore from '@/store/searchStore';
import { getCenterOfBoundingBoxes } from '@/utils/GetCenterOfBoundingBox';
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type Ref = BottomSheetModal;

const BottomSheetQuyHoach = forwardRef<Ref, { dismiss: () => void }>((props, ref) => {
    // State
    const listPlanning = useMarkerStore((state) => state.planningList);
    const selectedDistrictId = useSearchStore((state) => state.districtId);
    // dispatch
    const doSetDistrictId = useSearchStore((state) => state.doSetDistrictId);
    const doSetLatLon = useSearchStore(state=> state.doSetSearchResult)
    // Backdrop render for bottom Sheet
    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
        ),
        [],
    );
    // Change IdDistrict onPress section planning
    const handleChangePlanning = async(item: QuyHoachResponse) => {
        doSetDistrictId(item.id);
        const {centerLat, centerLon, latitudeDelta, longitudeDelta} = await getCenterOfBoundingBoxes(item.location)
        doSetLatLon({
            lat: centerLat as number,
            lon: centerLon as number,
            latitudeDelta: latitudeDelta,
            longitudeDelta: longitudeDelta
        })
    };
    return (
        <BottomSheet
            backdropComponent={renderBackdrop}
            ref={ref}
            snapPoints={['70%', '70%']}
            index={1}
        >
            <BottomSheetView>
                {!listPlanning && (
                    <Text className="text-center mt-4">Không có quy hoạch tại quận này</Text>
                )}
                {listPlanning && (
                    <FlatList
                        className="min-h-full px-2 pt-2"
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
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
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
                            </TouchableOpacity>
                        )}
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
});
export default BottomSheetQuyHoach;
