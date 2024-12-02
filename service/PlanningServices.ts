import { IResponseGetDistrictId } from "@/interfaces/planning/AllPlanningResponse"
import { IResponseServerBoudingBox } from "@/interfaces/planning/BoundingBoxListImage"
import instance from "@/utils/axiosCustomize"

export const PlanningServices = {
    getAllProvinceDistrictPlanning: async () => {
        const response = await instance.get('/sap_xep_tinh_quan_huyen')
        return response.data
    },
    getListImagesByBoundingBox: async(boudingBox: number[])=>{
        const response = await instance.get<IResponseServerBoudingBox>(`/get_list_image_bound/${boudingBox[0]}/${boudingBox[1]}/${boudingBox[2]}/${boudingBox[3]}`)
        return response.data
    },
    getDistrictIdByLocation: async(location: number[])=>{
        const response = await instance.get<IResponseGetDistrictId>(`/get_district_provinces/${location[0]}/${location[1]}`)
        return response.data
    }
}