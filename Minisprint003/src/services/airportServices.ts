import {DistanceHaversineKM} from "./1helper.ts"
import AirportRepository from "../repositories/airportRepo.ts";
import type { Transaction } from "sequelize";
import HotelRepository from "../repositories/hotelRepo.ts";
import CityRepository from "../repositories/cityRepo.ts";
import type RegionRepository from "../repositories/regionRepo.ts";
import type TransactionManager from "../manager/TransactionManager.ts";
import type { AirportDTO } from "../models/DataTransferObject/index.ts";

class AirportServices {
    private readonly HotelRepo: HotelRepository;
    private readonly CityRepo : CityRepository;
    private readonly RegionRepo : RegionRepository;
    private readonly AirportRepo: AirportRepository;
    private readonly transactionManager: TransactionManager

    constructor(
        {hotelRepository, cityRepository,regionRepository,airportRepository,transactionManager}
        :{hotelRepository: HotelRepository, cityRepository:CityRepository, regionRepository:RegionRepository, airportRepository:AirportRepository,transactionManager:TransactionManager}){

        this.HotelRepo = hotelRepository
        this.CityRepo = cityRepository
        this.RegionRepo = regionRepository
        this.transactionManager = transactionManager
        this.AirportRepo = airportRepository
    }

    async createAirport(airport:AirportDTO, transaction?: Transaction) {
        const airports = await this.AirportRepo.create(airport, transaction)
        return airports;
    }

    async deleteAirport(ID:number, transaction?: Transaction) {
        const airports = await this.AirportRepo.delete(ID, transaction)
        return airports;
    }

    async getAirportByIataCode(iataCode: string, transaction?: Transaction) {
        const airport = await this.AirportRepo.getAirportByIataCode(iataCode, transaction);

        if (!airport) {
            throw new Error(`Airport ${iataCode} not found`);
        }

        return airport;
    }

    async getClosestHotelOffers(iataCode: string, limit = 10) {
        const airport = await this.getAirportByIataCode(iataCode);
        const hotels = await this.HotelRepo.findAll();

        const airportLat = Number(airport.Latitude);
        const airportLng = Number(airport.Longitude);

        const result = hotels
            .filter((h:any) =>
                h.PropertyLatitude !== null &&
                h.PropertyLongitude !== null
            )
            .map((hotel: any) => {
                    const distanceKm = DistanceHaversineKM(
                    airportLat,
                    airportLng,
                    Number(hotel.PropertyLatitude),
                    Number(hotel.PropertyLongitude)
                );

                return {
                    hotel: {
                        id: hotel.GlobalPropertyID,
                        name: hotel.GlobalPropertyName,
                        address: hotel.PropertyAddress1
                    },
                    distanceKm,
                    offers: hotel.PriceOffers?.map((offer: any) => ({
                        category: offer.Category,
                        price: Number(offer.Price)
                    })) ?? []
                };
            })
            .sort((a:any, b:any) => a.distanceKm - b.distanceKm)
            .slice(0, limit);
        return result;
    }
}

export default AirportServices;