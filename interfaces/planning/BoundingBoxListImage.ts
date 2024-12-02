export interface IListImageItem {
    description: string;
    idDistrict: number;
    idProvince: number;
    id_quyhoach: number;
    imageHttp: string;
    loai_anh: string;
    location: string;
}

export interface IResponseServerBoudingBox {
    list_image: IListImageItem[]
}