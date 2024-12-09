import { IPlanningAvailable, IResponseGetDistrictId } from "@/interfaces/planning/AllPlanningResponse"
import { IResponseServerBoudingBox } from "@/interfaces/planning/BoundingBoxListImage"
import { IListPlaningAvailable, IResponsePLanningAvailable } from "@/interfaces/planning/PlanningAvailable"
import instance from "@/utils/axiosCustomize"

export const PlanningServices = {
    getAllProvinceDistrictPlanning: async () => {
        const response = await instance.get('/sap_xep_tinh_quan_huyen')
        return response.data
    },
    getListImagesByBoundingBox: async(boundingBox: number[])=>{
        const response = await instance.get<IResponseServerBoudingBox>(`/get_list_image_bound/${boundingBox[0]}/${boundingBox[1]}/${boundingBox[2]}/${boundingBox[3]}`)
        return response.data
    },
    getDistrictIdByLocation: async(location: number[])=>{
        const response = await instance.get<IResponseGetDistrictId>(`/get_district_provinces/${location[0]}/${location[1]}`)
        return response.data
    },
    getPlanningAvailableByBoundingBox: async(boundingBox: number[])=>{
        const response = await instance.get<IResponsePLanningAvailable>(`/get_list_quyhoach_bound/${boundingBox[0]}/${boundingBox[1]}/${boundingBox[2]}/${boundingBox[3]}`)
        return response.data
    },
    getPlanningInDistrict: async(id: string)=>{
        const response = await instance.get<{list_image: IListPlaningAvailable[]}>(`get_list_quyhoach_quan_huyen/${id}`)
        return response.data
    }
}