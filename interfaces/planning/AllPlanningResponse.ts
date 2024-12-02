
export interface IPlanningResponse {
    boundingbox: string;
    coordation: string;
    description: string;
    huyen_image: string;
    idDistrict: number;
    idProvince: number;
    id_quyhoach: number;
    id?: number;
    ten_quan?: string;
    location: string;
}
export interface IAllDistrictInProvinceResponse {
    id_huyen: number;
    name_huyen: string;
    quyhoach: IPlanningResponse[];
}
export interface IAllProvincePlanningResponse {
    id_tinh: number;
    link_image: string;
    name_tinh: string;
    quan_huyen_1_tinh: IAllDistrictInProvinceResponse[];
}

export interface IResponseGetDistrictId {
    diachi: string;
    district: number;
    message: string;
    provinces: number;
    status: number;
}