import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    Linking,
} from 'react-native';
import { Image } from '@rneui/themed';
import { FontAwesome } from '@expo/vector-icons';
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import Colors from '@/constants/Colors';
import { usePlanningStore } from '@/store/planningStore';
import useSearchStore from '@/store/searchStore';
import ImageView from 'react-native-image-viewing';
import { getIdVideoYoutube } from '@/utils/GetIdVideoYoutube';

export type Ref = BottomSheetModal;
type IListImageItem = {
    imageHttp: string;
    loai_anh: string;
    location: string;
};

const BottomSheetImage = forwardRef<Ref, { dismiss: () => void }>((props, ref) => {
    const [allTypeInList, setAllTypeInList] = useState<string[]>([]);
    const [currentType, setCurrentType] = useState<string>();
    const listImageBoundingBox = usePlanningStore((state) => state.boundingBoxImage);
    const doSetSearchResult = useSearchStore((state) => state.doSetSearchResult);
    const [listImage, setListImage] = useState<IListImageItem[] | null>(null);
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(null);

    // Ref for FlatList
    const flatRef = useRef<FlatList<IListImageItem>>(null);

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

    const openImageViewer = (uri: string) => {
        if (uri !== currentImage) {
            setCurrentImage(uri);
        }
        setIsImageViewerVisible(true);
    };

    const closeImageViewer = () => {
        setIsImageViewerVisible(false);
    };

    const openUrl = (url: string) => {
        Linking.openURL(url).catch((err) =>
            console.error('Không thể mở trình duyệt:', err),
        );
    };

    useEffect(() => {
        setListImage(listImageBoundingBox);
        const priorityOrder = ['FLYCAM', 'ANH_MAT_DAT'];
        const sortedImages = listImageBoundingBox?.sort((a, b) => {
            const aPriority = priorityOrder.includes(a.loai_anh) ? 0 : 1;
            const bPriority = priorityOrder.includes(b.loai_anh) ? 0 : 1;
            if (aPriority === bPriority) {
                return 0;
            }
            return aPriority - bPriority;
        });
        const uniqueTypes = [...new Set(sortedImages?.map((image) => image.loai_anh))];
        setAllTypeInList(uniqueTypes);
        setCurrentType(uniqueTypes[0]);
    }, [listImageBoundingBox]);

    // Filter images based on the current type
    const filteredImages = listImage?.filter((item) => item.loai_anh === currentType);

    return (
        <BottomSheet
            backdropComponent={renderBackdrop}
            ref={ref}
            snapPoints={['55%', '60%']}
            index={-1}
            enablePanDownToClose
            handleComponent={() => (
                <View className="flex flex-col justify-center">
                    <View className="h-10 pt-2 w-full items-center justify-center rounded-t-2xl ">
                        <View className="h-1.5 w-12 rounded-full bg-white" />
                    </View>
                    <FlatList
                        horizontal
                        contentContainerStyle={{
                            gap: 12,
                            justifyContent: 'flex-start',
                        }}
                        className="mx-2"
                        data={allTypeInList}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setCurrentType(item)}
                                className={`py-2 p-2 rounded-md ${
                                    currentType === item ? 'bg-[#4caf50]' : 'bg-white'
                                }`}
                            >
                                <Text
                                    className={`text-center ${
                                        currentType === item ? 'text-white' : 'text-black'
                                    } capitalize`}
                                >
                                    {item.replaceAll('_', ' ')}
                                </Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(_, index) => index.toString()}
                    />
                </View>
            )}
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
                    data={filteredImages} // Dữ liệu đã được lọc
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{
                        paddingTop: 8,
                        marginHorizontal: 8,
                        marginTop: 8,
                    }}
                    keyExtractor={(item) => item.imageHttp.toString()}
                    contentContainerStyle={{
                        gap: 12,
                    }}
                    getItemLayout={(data, index) => ({
                        length: 280, // Chiều rộng của mỗi item
                        offset: 280 * index, // Tính toán offset dựa trên chiều rộng của item
                        index,
                    })}
                    renderItem={({ item }) => {
                        return (
                            <View
                                style={{
                                    flexDirection: 'row',
                                    position: 'relative',
                                    alignItems: 'center',
                                }}
                            >
                                {item.loai_anh === 'FLYCAM' && (
                                    <TouchableOpacity
                                        onPress={() => openImageViewer(item.imageHttp)}
                                        style={{
                                            borderWidth: 1,
                                            borderColor: 'white',
                                            borderRadius: 6,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Image
                                            style={{
                                                width: 280,
                                                height: 280,
                                            }}
                                            containerStyle={{}}
                                            source={{ uri: item.imageHttp }}
                                            PlaceholderContent={<ActivityIndicator />}
                                            placeholderStyle={{ borderRadius: 6 }}
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                )}
                                {item.loai_anh === '360' && (
                                    <View
                                        className="flex flex-col items-center justify-center"
                                        style={{
                                            borderWidth: 1,
                                            borderColor: 'white',
                                            borderRadius: 6,
                                            overflow: 'hidden',
                                            width: 280,
                                            height: 280,
                                        }}
                                    >
                                        <Text className="text-white">Chưa hỗ trợ xem trên APP</Text>
                                        <TouchableOpacity
                                            onPress={() => openUrl('https://quyhoach.xyz')}
                                            className="flex flex-row item-center"
                                        >
                                            <Text className="text-white">Truy cập: </Text>
                                            <Text className="text-[#4caf50]">quyhoach.xyz</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {item.loai_anh === 'VIDEO_FLYCAM' &&
                                    item.imageHttp.includes('youtu') && (
                                        <TouchableOpacity
                                            onPress={() => openUrl(item.imageHttp)}
                                            className="flex flex-row item-center"
                                            style={{
                                                borderWidth: 1,
                                                borderColor: 'white',
                                                borderRadius: 6,
                                                overflow: 'hidden',
                                                width: 280,
                                                height: 280,
                                            }}
                                        >
                                            <Image
                                                source={{
                                                    uri: getIdVideoYoutube(item.imageHttp)
                                                }}
                                                style={{
                                                    width: 280,
                                                    height: 280,
                                                }}
                                            />
                                        </TouchableOpacity>
                                    )}
                                <TouchableOpacity
                                    onPress={() => handleGoToLocation(item.location)}
                                    className="px-2.5 py-2 rounded-full"
                                    style={{
                                        backgroundColor: 'white',
                                        flexDirection: 'row',
                                        gap: 8,
                                        alignItems: 'center',
                                        position: 'absolute',
                                        bottom: 6,
                                        right: 8,
                                    }}
                                >
                                    <FontAwesome name="location-arrow" size={24} color="green" />
                                </TouchableOpacity>
                                <ImageView
                                    images={[{ uri: currentImage as string }]}
                                    imageIndex={0}
                                    visible={isImageViewerVisible}
                                    onRequestClose={closeImageViewer}
                                />
                            </View>
                        );
                    }}
                />
            </BottomSheetView>
        </BottomSheet>
    );
});

export default BottomSheetImage;
