import Colors from '@/constants/Colors';
import { QuyHoachResponse } from '@/constants/interface';
import { usePlanningStore } from '@/store/planningStore';
import useSearchStore from '@/store/searchStore';
import { FontAwesome } from '@expo/vector-icons';
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Image } from '@rneui/themed';
import React, { forwardRef, useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import ImageView from 'react-native-image-viewing';

export type Ref = BottomSheetModal;
type IListPlanning = {
    name: string;
    planning: QuyHoachResponse[];
};

const BottomSheetImage = forwardRef<Ref, { dismiss: () => void }>((props, ref) => {
    const typeImage = ['FLYCAM', '360'];
    const listImageBoundingBox = usePlanningStore((state) => state.boundingBoxImage);
    const doSetSearchResult = useSearchStore((state) => state.doSetSearchResult);

    // State để kiểm soát modal ảnh fullscreen
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(null);

    const handleGoToLocation = (location: string) => {
        const locationArr = location.split(',');
        doSetSearchResult({
            lat: Number(locationArr[0]),
            lon: Number(locationArr[1]),
            latitudeDelta: 0.007,
            longitudeDelta: 0.002,
        });
    };

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
        ),
        [],
    );

    // Hàm mở ảnh fullscreen
    const openImageViewer = (uri: string) => {
        setCurrentImage(uri);
        setIsImageViewerVisible(true);
    };

    // Hàm đóng ảnh fullscreen
    const closeImageViewer = () => {
        setIsImageViewerVisible(false);
    };

    return (
        <BottomSheet
            backdropComponent={renderBackdrop}
            ref={ref}
            snapPoints={['52%', '52%']}
            index={-1}
            enablePanDownToClose
            backgroundStyle={{
                backgroundColor: Colors.primary.header,
            }}
            handleIndicatorStyle={{
                backgroundColor: 'white',
            }}
        >
            <BottomSheetView>
                <FlatList
                    ListEmptyComponent={
                        <View>
                            <Text>Chưa có ảnh nào hiển thị</Text>
                        </View>
                    }
                    data={listImageBoundingBox}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="h-full pt-2 mx-2"
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{
                        gap: 12,
                    }}
                    renderItem={({ item }) => (
                        <View className="flex flex-row relative items-center">
                            {item.loai_anh === typeImage[0] && (
                                <>
                                    <TouchableOpacity
                                        onPress={() => openImageViewer(item.imageHttp)}
                                    >
                                        <Image
                                            style={{
                                                width: 280,
                                                height: 280,
                                            }}
                                            className="border-[1px] border-white rounded-md overflow-hidden"
                                            source={{ uri: item.imageHttp }}
                                            PlaceholderContent={<ActivityIndicator />}
                                            placeholderStyle={{
                                                borderRadius: 6,
                                            }}
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleGoToLocation(item.location)}
                                        className="bg-white flex flex-row gap-2 items-center rounded-md bottom-8 right-3 p-1.5 absolute"
                                    >
                                        <Text className="text-base">Đi tới</Text>
                                        <FontAwesome
                                            name="location-arrow"
                                            size={16}
                                            color="black"
                                        />
                                    </TouchableOpacity>
                                    <ImageView
                                        images={[{ uri: currentImage as string }]}
                                        imageIndex={0}
                                        visible={isImageViewerVisible}
                                        onRequestClose={closeImageViewer}
                                    />
                                </>
                            )}
                            {item.loai_anh === typeImage[1] && (
                                <>
                                    <Image
                                        style={{
                                            width: 280,
                                            height: 280,
                                        }}
                                        className="border-[1px] border-white rounded-md overflow-hidden"
                                        source={{ uri: item.imageHttp }}
                                        PlaceholderContent={<ActivityIndicator />}
                                        placeholderStyle={{
                                            borderRadius: 6,
                                        }}
                                        resizeMode="cover"
                                    />
                                    <TouchableOpacity
                                        onPress={() => handleGoToLocation(item.location)}
                                        className="bg-white flex flex-row gap-2 items-center rounded-md bottom-8 right-3 p-1.5 absolute"
                                    >
                                        <Text className="text-base">Đi tới</Text>
                                        <FontAwesome
                                            name="location-arrow"
                                            size={16}
                                            color="black"
                                        />
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    )}
                />
            </BottomSheetView>

            {/* Modal xem ảnh fullscreen */}
        </BottomSheet>
    );
});

export default BottomSheetImage;
