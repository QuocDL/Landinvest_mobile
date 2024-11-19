import {  ListMarker, PlaceResult, QuyHoachResponse } from '@/constants/interface';
import { create } from 'zustand';

interface State {
    listMarkers: ListMarker[] | null,
    planningList: QuyHoachResponse[] | null
}

type Action = {
    doSetListMarkers: (listMarkers: ListMarker[] | null) => void
    doSetPlanningList: (listQuyHoach:  QuyHoachResponse[])=> void,
    doRemovePlanningList: ()=> void
};

// Create the Zustand store
const useMarkerStore = create<State & Action>((set) => ({
    listMarkers: null,
    planningList: null,
    doSetListMarkers: (listMarkers: ListMarker[] | null) => set({ listMarkers }),
    doSetPlanningList: (listQuyHoach:  QuyHoachResponse[])=> set({planningList: listQuyHoach}),
    doRemovePlanningList: ()=> set({planningList: null})
}));

export default useMarkerStore;
