interface HotelDTO {
    GlobalPropertyID: number,
    SourcePropertyID: string,
    GlobalPropertyName: string,
    GlobalChainCode: string,
    PropertyAddress1: string,
    PropertyAddress2?: string,
    PrimaryAirportCode: string,
    CityID: number,
    PropertyStateProvinceID?: number,
    PropertyZipPostal?: string,
    PropertyPhoneNumber: string,
    PropertyFaxNumber?: string,
    SabrePropertyRating?: number,
    PropertyLatitude?: number,
    PropertyLongitude?: number,
    SourceGroupCode?: string
}

interface updateHotelDTO {
    GlobalPropertyID: number,
    SourcePropertyID?: string,
    GlobalPropertyName?: string,
    GlobalChainCode?: string,
    PropertyAddress1?: string,
    PropertyAddress2?: string,
    PrimaryAirportCode?: string,
    CityID?: number,
    PropertyStateProvinceID?: number,
    PropertyZipPostal?: string,
    PropertyPhoneNumber?: string,
    PropertyFaxNumber?: string,
    SabrePropertyRating?: number,
    PropertyLatitude?: number,
    PropertyLongitude?: number,
    SourceGroupCode?: string
}

interface createHotelDTO {
    GlobalPropertyID: number,
    SourcePropertyID: string,
    GlobalPropertyName: string,
    GlobalChainCode: string,
    PropertyAddress1: string,
    PropertyAddress2?: string,
    PrimaryAirportCode: string,
    CityID: number,
    PropertyCityName?: string,
    PropertyStateProvinceID: number,
    PropertyStateProvinceName?: string,
    PropertyZipPostal?: string,
    PropertyCountryCode?: string,
    PropertyPhoneNumber: string,
    PropertyFaxNumber?: string,
    SabrePropertyRating?: number,
    PropertyLatitude?: number,
    PropertyLongitude?: number,
    SourceGroupCode?: string
}

interface CityDTO {
    CityID: number,
    CityName: string,
    Country: string
}

interface RegionDTO {
    PropertyStateProvinceID: number,
    PropertyStateProvinceName: string
}


export type {
    HotelDTO,
    updateHotelDTO,
    CityDTO,
    RegionDTO,
    createHotelDTO
}