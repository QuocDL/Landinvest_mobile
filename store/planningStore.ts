import { QuyHoachResponse } from '@/constants/interface';
import { IListImageItem } from '@/interfaces/planning/BoundingBoxListImage';
import { IListPlaningAvailable } from '@/interfaces/planning/PlanningAvailable';
import { create } from 'zustand';
type TreeType = {
    name: string;
    planning: QuyHoachResponse[];
};

type State = {
    listPlanningImage: string[] | null;
    listPlanningAvailable: IListPlaningAvailable[] | null;
    listPlanningItemDoublePress: QuyHoachResponse[] | null;
    listPlanningTree: TreeType[] | null;
    boundingBoxImage: IListImageItem[] | null;
};
type Action = {
    doAddListPlanningTree: (newPlanning: TreeType) => void;
    removeWithImagePlanningTree: (planningName: string) => void;
    changeImagePlanning: (planningImage: string) => void;
    doRemoveDistrictWithPlaningList: (planningList: QuyHoachResponse[]) => void;
    doDoublePressAddPlanning: (num: QuyHoachResponse[] | null) => void;
    doSetListImageBoudingBox: (boundingBoxImage: IListImageItem[] | null)=> void;
    doRemoveAllPlanning: ()=> void
    doSetListPlaningAvailable: (listAvailable: IListPlaningAvailable[]) => void 
};

type Store = State & Action;
export const usePlanningStore = create<Store>((set) => ({
    listPlanningTree: null,
    listPlanningItemDoublePress: null,
    listPlanningAvailable: null,
    listPlanningImage: null,
    boundingBoxImage: null,
    // GLOBALPLANNING TREE
    doDoublePressAddPlanning: (num) => set({listPlanningItemDoublePress: num}),
    doRemoveAllPlanning: ()=> set({listPlanningTree: null, listPlanningImage: null}),
    doAddListPlanningTree: (newPlanning) =>
        set((state) => {
            const isExist = state.listPlanningTree?.some(
                (tree) => tree.name === newPlanning.name, // Kiểm tra dựa trên thuộc tính `name`
            );
            return {
                listPlanningTree: isExist
                    ? state.listPlanningTree // Nếu đã tồn tại, giữ nguyên mảng hiện tại
                    : state.listPlanningTree
                    ? [...state.listPlanningTree, newPlanning] // Thêm phần tử mới nếu chưa tồn tại
                    : [newPlanning], // Khởi tạo mảng mới nếu `null`
            };
        }),
    removeWithImagePlanningTree: (planningImage: string) =>
        set((state) => {
            return {
                listPlanningTree: state.listPlanningTree?.some((tree) =>
                    tree.planning.some((qh) => qh.huyen_image === planningImage),
                )
                    ? [] // Nếu có ảnh trùng, xóa toàn bộ listPlanningTree
                    : state.listPlanningTree, // Nếu không có ảnh trùng, giữ nguyên listPlanningTree
            };
        }),
    doRemoveDistrictWithPlaningList: (planningList) =>
        set((state) => {
            if (!state.listPlanningTree) return state;
            // Lọc ảnh trong listPlanningImage nếu tồn tại, nếu không có thì khởi tạo mảng rỗng
            const updatedImageList =
                state.listPlanningImage?.filter(
                    (image) => !planningList.some((planning) => planning.huyen_image === image),
                ) ?? []; // Nếu listPlanningImage là null, trả về mảng rỗng
            // Cập nhật lại listPlanningImage
            set({ listPlanningImage: updatedImageList });
            // Find index in array want remove
            const indexToRemove = state.listPlanningTree.findIndex(
                (district) => district.planning === planningList,
            );
            // if find success index to compare logic
            if (indexToRemove !== -1) {
                const updatedTree = [...state.listPlanningTree];
                updatedTree.splice(indexToRemove, 1);
                return { listPlanningTree: updatedTree };
            }

            return state;
        }),
    // IMAGE PLANNING
    changeImagePlanning: (planningImage: string) =>
        set((state) => {
            // Kiểm tra xem ảnh đã có trong mảng chưa
            const imageExists = state.listPlanningImage?.includes(planningImage);

            return {
                listPlanningImage: imageExists
                    ? state.listPlanningImage?.filter((image) => image !== planningImage) // Nếu ảnh đã tồn tại, xóa ảnh
                    : [...(state.listPlanningImage || []), planningImage], // Nếu chưa có, thêm ảnh vào, khởi tạo mảng rỗng nếu null
            };
        }),
    // IMAGE BOUNDINGBOX
    doSetListImageBoudingBox: (boundingBoxImage)=>{
        set({boundingBoxImage: boundingBoxImage})
    },
    // Available 
    doSetListPlaningAvailable: (listPlanningAvailable)=> set({listPlanningAvailable: listPlanningAvailable}) 
}));
