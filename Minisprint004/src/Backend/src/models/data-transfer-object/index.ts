//--------------------------------------------------------\\
interface createUserDTO {
    UserID?: number,
    UserName: string,
    Email: string,
    Password: string
}
interface updateUserDTO {
    UserID?: number,
    UserName?: string,
    Email?: string,
    Password?: string
}
//--------------------------------------------------------\\
interface createAirportDTO {
    AirportID?: number,
    IataCode: string,
    AirportName: string,
    Longitude: number,
    Latitude: number
}
interface updateAirportDTO {
    AirportID?: number,
    IataCode: string,
    AirportName: string,
    Longitude: number,
    Latitude: number
}
//--------------------------------------------------------\\
interface priceOfferDTO {
    PriceOfferID?: number,
    Category: "budget" | "standard" | "comfort" | "premium" | "luxury",
    Price: number,
    Currency: "USD" | "EUR" | "GBP" | "RON" | "JPY" | "CNY" | "CHF" | "RUB"
}

interface createHotelDTO {
    HotelID?: number,
    HotelName: string,
    Address: string,
    Longitude: number,
    Latitude: number,
    CityID?: number,
    CityName?: string,
    ProvinceName?: string,
    CountryName?: string,
    HGroupID?: number
    PriceOffers?: priceOfferDTO[]
}
interface updateHotelDTO {
    HotelID?: number,
    HotelName: string,
    Address: string,
    Longitude: number,
    Latitude: number,
    CityID?: number,
    CityName?: string,
    ProvinceName?: string,
    CountryName?: string,
    HGroupID?: number,
    PriceOffers?: priceOfferDTO[]
}
//--------------------------------------------------------\\
interface createReviewDTO {
    ReviewID?: number,
    Title?: string,
    Text?: string,
    Rating: number,
    AmenitiesRate?: number,
    CleanlinessRate?: number,
    FoodBeverageRate?: number,
    SleepQualityRate?: number,
    InternetQualityRate?: number,
    UserID: number,
    HotelID: number
}
interface updateReviewDTO {
    ReviewID?: number,
    Title: string,
    Text: string,
    Rating: number,
    AmenitiesRate: number,
    CleanlinessRate: number,
    FoodBeverageRate: number,
    SleepQualityRate: number,
    InternetQualityRate: number,
    UserID?: string,
    HotelID?: string
}
//--------------------------------------------------------\\
interface createHotelGroupDTO {
    HGroupID?: number,
    GroupName: string
}
interface updateHotelGroupDTO {
    HGroupID?: number,
    GroupName: string
}
interface inviteHotelGroupUsersDTO {
    UserIDs: number[]
}
interface activateHotelGroupMembershipDTO {
    token: string
}
//--------------------------------------------------------\\
interface createPriceOfferDTO {
    PriceOfferID?: number,
    Category: string,
    Price: number,
    Currency: string,
    HotelID?: number
}
interface updatePriceOfferDTO {
    PriceOfferID?: number,
    Category: string,
    Price: number,
    Currency: string,
    HotelID?: number
}

export type {
    createUserDTO,
    updateUserDTO,

    createAirportDTO,
    updateAirportDTO,

    priceOfferDTO,
    createHotelDTO,
    updateHotelDTO,

    createReviewDTO,
    updateReviewDTO,

    createHotelGroupDTO,
    updateHotelGroupDTO,
    inviteHotelGroupUsersDTO,
    activateHotelGroupMembershipDTO,

    createPriceOfferDTO,
    updatePriceOfferDTO,
}