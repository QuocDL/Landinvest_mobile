import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React from "react";
import { create } from "zustand";

interface State {
    sheetPlanningRef: React.RefObject<BottomSheetModal> | null
}
interface Action {
    DoSetPlanningRef: (ref: React.RefObject<BottomSheetModal>)=> void
}

type Store = State & Action

const useSheetRefStore = create<Store>((set)=>({
    sheetPlanningRef: null,
    DoSetPlanningRef: (ref)=> set({sheetPlanningRef: ref})
}))

export default useSheetRefStore