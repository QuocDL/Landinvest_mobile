import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React from "react";
import { MapType } from "react-native-maps";
import { create } from "zustand";

interface State {
    mapType: MapType;
    sheetPlanningRef: React.RefObject<BottomSheetModal> | null
    sheetGlobalPlanningRef: React.RefObject<BottomSheetModal> | null
}
interface Action {
    DoSetMapType: (map: MapType)=> void
    DoSetPlanningRef: (ref: React.RefObject<BottomSheetModal>)=> void
    DoSetGlobalPlanningRef: (ref: React.RefObject<BottomSheetModal>)=> void
}

type Store = State & Action

const useRefStore = create<Store>((set)=>({
    mapType: 'standard',
    sheetPlanningRef: null,
    sheetGlobalPlanningRef: null,
    DoSetMapType: (map)=> set({mapType: map}),
    DoSetPlanningRef: (ref)=> set({sheetPlanningRef: ref}),
    DoSetGlobalPlanningRef: (ref)=> set({sheetGlobalPlanningRef: ref})
}))

export default useRefStore