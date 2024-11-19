import { create } from "zustand";

interface State {
    modalPlanningList: boolean
}
type Action = {
    doOpenModalPlanningList: (enable: boolean) => void
}

const useModalStore = create<State & Action>((set)=>({
    // State
    modalPlanningList: false,
    // Dispatch
    doOpenModalPlanningList: (enable)=> set({modalPlanningList: enable})
}))

export default useModalStore