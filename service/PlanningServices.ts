import instance from "@/utils/axiosCustomize"

export const PlanningServices = {
    getAllProvinceDistrictPlanning: async () => {
        const response = await instance.get('/sap_xep_tinh_quan_huyen')
        return response.data
    }
}