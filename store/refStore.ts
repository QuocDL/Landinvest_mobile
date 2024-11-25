import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React from "react";
import { create } from "zustand";

interface State {
    sheetPlanningRef: React.RefObject<BottomSheetModal> | null
    sheetGlobalPlanningRef: React.RefObject<BottomSheetModal> | null
}
interface Action {
    DoSetPlanningRef: (ref: React.RefObject<BottomSheetModal>)=> void
    DoSetGlobalPlanningRef: (ref: React.RefObject<BottomSheetModal>)=> void
}

type Store = State & Action

const useRefStore = create<Store>((set)=>({
    sheetPlanningRef: null,
    sheetGlobalPlanningRef: null,
    DoSetPlanningRef: (ref)=> set({sheetPlanningRef: ref}),
    DoSetGlobalPlanningRef: (ref)=> set({sheetGlobalPlanningRef: ref})
}))

export default useRefStore