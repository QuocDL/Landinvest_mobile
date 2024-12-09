export interface IListPlaningAvailable {
    boundingbox: string;
    coordation: string;
    description: string;
    idDistrict: number | string;
    idProvince: number;
    image: string;
    imageHttp: string;
    location: string;
    link_quyhoach: string;
    name_location?: string;
    type: string;
  }
export interface IResponsePLanningAvailable {
    dongnam: string;
    list_image: IListPlaningAvailable[];
    taybac: string;
  }
