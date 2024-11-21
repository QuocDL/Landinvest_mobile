import { Feather, Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

export type Ref = BottomSheetModal;

const GroupBottomSheet = forwardRef<Ref, { dismiss: () => void; onLeaveGroup: () => void }>(
    (props, ref) => {
        const snapPoints = useMemo(() => ['30%'], []);
        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
            ),
            [],
        );

        return (
            <BottomSheetModal
                backdropComponent={renderBackdrop}
                ref={ref}
                snapPoints={snapPoints}
                index={0}
                onDismiss={props.dismiss}
            >
                <View className="p-3 space-y-3">
                    <TouchableOpacity
                        onPress={props.onLeaveGroup}
                        className="flex flex-row items-center"
                    >
                        <View className="rounded-full p-2 bg-[#f0f0f0]">
                            <Feather name="log-out" size={24} color="#333" />
                        </View>
                        <Text className="ml-2 text-[#333] font-semibold">Rời group</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex flex-row items-center">
                        <View className="rounded-full p-2 bg-[#f0f0f0]">
                            <Ionicons name="notifications-off" size={24} color="#333" />
                        </View>
                        <Text className="ml-2 text-[#333] font-semibold">Tắt thông báo</Text>
                    </TouchableOpacity>
                </View>
            </BottomSheetModal>
        );
    },
);

export default GroupBottomSheet;
