import { QuyHoachResponse } from '@/constants/interface';
import { create } from 'zustand';
type TreeType = {
    name: string;
    planning: QuyHoachResponse[];
};

type State = {
    listPlanningImage: string[] | null;
    listPlanningTree: TreeType[] | null;
};
type Action = {
    doAddListPlanningTree: (newPlanning: TreeType) => void;
    removeWithImagePlanningTree: (planningName: string) => void;
    changeImagePlanning: (planningImage: string) => void;
};

type Store = State & Action;
export const usePlanningStore = create<Store>((set) => ({
    listPlanningTree: null,
    listPlanningImage: null,
    // GLOBALPLANNING TREE
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
                listPlanningTree:
                    state.listPlanningTree?.some((tree) =>
                        tree.planning.some((qh) => qh.huyen_image === planningImage)
                    )
                        ? [] // Nếu có ảnh trùng, xóa toàn bộ listPlanningTree
                        : state.listPlanningTree, // Nếu không có ảnh trùng, giữ nguyên listPlanningTree
            };
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
}));
