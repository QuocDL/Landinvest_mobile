
interface IPlanningResponse {
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
interface IAllDistrictInProvinceResponse {
    id_huyen: number;
    name_huyen: string;
    quyhoach: IPlanningResponse[];
}
interface IAllProvincePlanningResponse {
    id_tinh: number;
    link_image: string;
    name_tinh: string;
    quan_huyen_1_tinh: IAllDistrictInProvinceResponse[];
}