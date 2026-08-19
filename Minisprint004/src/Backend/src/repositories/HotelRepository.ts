import { Op, Transaction } from "sequelize";
import type { createHotelDTO, updateHotelDTO } from "../models/data-transfer-object/index.ts";
import { DistanceHaversineKM } from "../../../../setup/helpers/z-helper.ts";


class HotelRepository {
    private readonly models: any;
    
    constructor(models:any){
        this.models = models;
    }

    private normalizeText(value?: string) {
        const nextValue = value?.trim();
        return nextValue ? nextValue : undefined;
    }

    private async resolveCityID(hotel: Pick<createHotelDTO, "CityID" | "CityName" | "ProvinceName" | "CountryName">, transaction?: Transaction) {
        if (hotel.CityID != null) {
            return Number(hotel.CityID);
        }

        const cityName = this.normalizeText(hotel.CityName);
        const provinceName = this.normalizeText(hotel.ProvinceName);
        const countryName = this.normalizeText(hotel.CountryName);

        if (!cityName || !provinceName || !countryName) {
            throw new Error("City name, province, and country are required");
        }

        const [country] = await this.models.Country.findOrCreate({
            where: { CountryName: countryName },
            defaults: { CountryName: countryName },
            transaction,
        });

        const [province] = await this.models.Province.findOrCreate({
            where: {
                ProvinceName: provinceName,
                CountryID: country.CountryID,
            },
            defaults: {
                ProvinceName: provinceName,
                CountryID: country.CountryID,
            },
            transaction,
        });

        const [city] = await this.models.City.findOrCreate({
            where: {
                CityName: cityName,
                ProvinceID: province.ProvinceID,
            },
            defaults: {
                CityName: cityName,
                ProvinceID: province.ProvinceID,
            },
            transaction,
        });

        return city.CityID;
    }

    async create(newHotel:createHotelDTO, userId?: number, transaction?:Transaction) {
        const cityId = await this.resolveCityID(newHotel, transaction);

        const { CityID: _CityID, CityName: _CityName, ProvinceName: _ProvinceName, CountryName: _CountryName, PriceOffers: _PriceOffers, ...hotelData } = newHotel;
        const hotel = await this.models.Hotel.create({
            ...hotelData,
            CityID: cityId,

            RatingSum: 0,
            RatingCounts: 0,
            AmenitiesRate: 0,
            CleanlinessRate: 0,
            FoodBeverageRate: 0,
            SleepQualityRate: 0,
            InternetQualityRate: 0,
            
        }, {transaction})

        if (userId != null) {
            await this.models.HotelManager.create({
                UserID: userId,
                HotelID: hotel.HotelID,
                ManagerRole: "OWNER",
            }, { transaction });
        }

        return hotel
    }

    async read(){
        const hotels = await this.models.Hotel.findAll({
            include: [
                {
                    model: this.models.City,
                    include: [
                        {
                            model: this.models.Province,
                            include: [
                                {
                                    model: this.models.Country,
                                },
                            ],
                        },
                    ],
                },
                {
                    model: this.models.PriceOffer,
                    attributes: [
                        "PriceOfferID",
                        "Category",
                        "Price",
                        "Currency",
                    ],
                },
                {
                    model: this.models.HotelGroup,
                    include: [
                        {
                            model: this.models.User,
                            through: { attributes: ["ManagerRole", "MembershipStatus"] },
                        },
                    ],
                },
                {
                    model: this.models.User,
                    through: {
                        attributes: ["UserID", "HotelID"],
                    },
                },
            ],
            order: [["HotelID", "ASC"]],
        });
        return hotels;
    }

    async findAllIds(transaction?: Transaction) {
        return this.models.Hotel.findAll({attributes: ["HotelID"],transaction})
    }
    
    async findByID(id: number, transaction?: Transaction) {
        const hotel = await this.models.Hotel.findOne({
            where: { HotelID: id },
            transaction,
            include: [
            {
                model: this.models.City,
                include: [
                {
                    model: this.models.Province,
                    include: [
                    {
                        model: this.models.Country,
                    },
                    ],
                },
                ],
            },
            {
                model: this.models.HotelGroup,
                include: [
                    {
                        model: this.models.User,
                        through: { attributes: ["ManagerRole", "MembershipStatus"] },
                    },
                ],
            },
            {
                model: this.models.PriceOffer,
            },
            {
                model: this.models.Review,
                include: [
                {
                    model: this.models.User,
                },
                ],
            },
            {
                model: this.models.User,
                through: { attributes: [] },
            },
            ],
        });

        if (!hotel) return null;
        const airports = await this.models.Airport.findAll({
            transaction,
        });


        const nearestAirports = airports
            .map((airport:any) => {
            const distance = DistanceHaversineKM(
                Number(hotel.get("Latitude")),
                Number(hotel.get("Longitude")),
                Number(airport.get("Latitude")),
                Number(airport.get("Longitude"))
            );

            return {
                ...airport.toJSON(),
                DistanceKm: Number(distance.toFixed(2)),
            };
            })
            .sort((a:any, b:any) => a.DistanceKm - b.DistanceKm)
            .slice(0, 5);

        hotel.setDataValue("NearestAirports", nearestAirports);

        return hotel;
    }

    async update(ID:number,updHotel:updateHotelDTO, transaction?:Transaction) {
        const cityId = await this.resolveCityID(updHotel, transaction);
        const { CityID: _CityID, CityName: _CityName, ProvinceName: _ProvinceName, CountryName: _CountryName, PriceOffers: _PriceOffers, ...hotelData } = updHotel;

        const hotel = await this.models.Hotel.update({
            ...hotelData,
            CityID: cityId,
        }, {where : {HotelID: ID}, returning: true, transaction} )
        return hotel
    }

    async delete(ID:number, transaction?:Transaction) {
        const hotel = await this.models.Hotel.destroy({where: {HotelID: ID}, transaction})
        return hotel
    }

    async incrementRating(hotelId: number, scores: {BaseRate:number, AmenitiesRate: number, CleanlinessRate: number, FoodBeverageRate: number, SleepQualityRate: number, InternetQualityRate: number,}, transaction?: Transaction) {
        return this.models.Hotel.increment(
            {
                RatingCounts: 1,
                RatingSum: scores.BaseRate * 10,
                
                AmenitiesRate: scores.AmenitiesRate * 10,
                CleanlinessRate: scores.CleanlinessRate * 10,
                FoodBeverageRate: scores.FoodBeverageRate * 10,
                SleepQualityRate: scores.SleepQualityRate * 10,
                InternetQualityRate: scores.InternetQualityRate * 10,
            },
            {where: { HotelID: hotelId },transaction,}
        );
    }

    async updateAquaRating(hotelId: number, aquaRating: number,transaction?:Transaction) {
        return this.models.Hotel.update({ AquaRating: Math.round(aquaRating) }, { where: { HotelID: hotelId },transaction });
    }

//  /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
// 𝄀𝄁𝄂                                 SEARCH                                   𝄃𝄁𝄀 
//  \_________________________________________________________________________/
    async search(q: string,limit:number,offset:number) {
        const {count, rows} = await this.models.Hotel.findAndCountAll({

            where: {
                HotelName: {
                    [Op.iLike]: `%${q}%`
                }
            },

            order: [["AquaRating", "DESC"]],

            include: [
                {
                    model: this.models.City,
                    attributes: ["CityName"],
                    include: [
                        {
                            model: this.models.Province,
                            attributes: ["ProvinceName"],
                            include: [
                                {
                                    model: this.models.Country,
                                    attributes: ["CountryName"]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: this.models.PriceOffer,
                    where: { Category: "standard" },
                    attributes: ["Price", "Currency"],
                    required: false,
                    separate: true,
                    order: [["Price", "ASC"]],
                    limit: 1
                }
            ],
            
            limit,
            offset,
        });

        return { items:rows,total:count };
    }

}



export default HotelRepository