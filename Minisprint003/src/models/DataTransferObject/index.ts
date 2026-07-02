interface HotelDTO {
    GlobalPropertyID: number;
    SourcePropertyID?: string;
    GlobalPropertyName: string;
    GlobalChainCode?: string;
    PropertyAddress1: string;
    PropertyAddress2?: string;
    PrimaryAirportCode?: string;
    CityID: number;
    PropertyStateProvinceID?: number;
    HotelGroupID?: number;
    PropertyZipPostal?: string;
    PropertyPhoneNumber: string;
    PropertyFaxNumber?: string;
    SabrePropertyRating?: number;
    PropertyLatitude?: number;
    PropertyLongitude?: number;
    SourceGroupCode?: string;
}

interface CreateHotelDTO {
    GlobalPropertyID: number;
    SourcePropertyID?: string;
    GlobalPropertyName: string;
    GlobalChainCode?: string;
    PropertyAddress1: string;
    PropertyAddress2?: string;

    PrimaryAirportCode?: string;

    CityID: number;
    PropertyCityName: string;

    PropertyStateProvinceID?: number;
    PropertyStateProvinceName: string;
    PropertyCountryCode: string;
    
    HotelGroupID?: number;
    PropertyZipPostal?: string;
    PropertyPhoneNumber: string;
    PropertyFaxNumber?: string;
    SabrePropertyRating?: number;
    PropertyLatitude?: number;
    PropertyLongitude?: number;
    SourceGroupCode?: string;
}

interface UpdateHotelDTO {
    GlobalPropertyID: number;
    SourcePropertyID?: string;
    GlobalPropertyName?: string;
    GlobalChainCode?: string;
    PropertyAddress1?: string;
    PropertyAddress2?: string;
    PrimaryAirportCode?: string;
    CityID?: number;
    PropertyStateProvinceID?: number;
    HotelGroupID?: number;
    PropertyZipPostal?: string;
    PropertyPhoneNumber?: string;
    PropertyFaxNumber?: string;
    SabrePropertyRating?: number;
    PropertyLatitude?: number;
    PropertyLongitude?: number;
    SourceGroupCode?: string;
}

interface CityDTO {
    CityID: number;
    CityName: string;
    Country: string;
}

interface RegionDTO {
    PropertyStateProvinceID: number;
    PropertyStateProvinceName: string;
}

interface AirportDTO {
    AirportID: number;
    Iata_code: string;
    Airport_name: string;
    CityID: number;
    Latitude: number;
    Longitude: number;
}

interface HotelGroupDTO {
    HotelGroupID: number;
    Group_name: string;
}

type PriceCategory =
    | "budget"
    | "standard"
    | "comfort"
    | "premium"
    | "luxury";

interface PriceOfferDTO {
    PriceOfferID: number;
    HotelID: number;
    Category: PriceCategory;
    Price: number;
}

export type {
    HotelDTO,
    CreateHotelDTO,
    UpdateHotelDTO,
    CityDTO,
    RegionDTO,
    AirportDTO,
    HotelGroupDTO,
    PriceOfferDTO,
    PriceCategory
};