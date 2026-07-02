import type { HotelDTO,
    CreateHotelDTO,
    UpdateHotelDTO,
    CityDTO,
    RegionDTO,
    AirportDTO,
    HotelGroupDTO,
    PriceOfferDTO,
    PriceCategory  } from '../models/DataTransferObject/index.ts';
import CityRepository from '../repositories/cityRepo.ts';
import HotelRepository from '../repositories/hotelRepo.ts';
import RegionRepository from '../repositories/regionRepo.ts';
import ReviewRepository from '../repositories/reviewRepo.ts';
import PriceOfferRepository from '../repositories/priceofferRepo.ts';
import TransactionManager from '../manager/TransactionManager.ts';
import { Transaction } from 'sequelize';
import type AirportRepository from '../repositories/airportRepo.ts';

class HotelServices {
    private readonly repository: HotelRepository;
    private readonly CityRepo : CityRepository;
    private readonly RegionRepo : RegionRepository;
    private readonly ReviewRepo : ReviewRepository;
    private readonly PriceOfferRepo: PriceOfferRepository;
    private readonly AirportRepo: AirportRepository;
    private readonly transactionManager: TransactionManager

    constructor(
        {hotelRepository, cityRepository,regionRepository,reviewRepository,priceofferRepository,airportRepository,transactionManager}
        :{hotelRepository: HotelRepository, cityRepository:CityRepository, regionRepository:RegionRepository, reviewRepository:ReviewRepository, priceofferRepository:PriceOfferRepository, airportRepository:AirportRepository,transactionManager:TransactionManager}){
        this.repository = hotelRepository
        this.CityRepo = cityRepository
        this.RegionRepo = regionRepository
        this.ReviewRepo = reviewRepository
        this.PriceOfferRepo = priceofferRepository
        this.AirportRepo = airportRepository
        this.transactionManager = transactionManager
    }


    async getTest() {
        const test = await this.repository.test();
        return test;
    }

    private async getCity(cityDraft: CityDTO, transaction?:Transaction){
        let city = await this.CityRepo.getCityByID(cityDraft.CityID, transaction);
        if (!city) {
            if ((cityDraft.CityName) && (cityDraft.Country)) {
                city = false;
            } else {
                throw new Error("\n[ SERVICES ] > 'CityID' don't exist, Please verify 'CityID' or add 'PropertyCountryCode: string' and 'Country: string' values in your JSON query.")
            }
        }
        return city;
    }

    private async getRegion(RegionDraft: RegionDTO, transaction?:Transaction){
        let region = await this.RegionRepo.getRegionByID(RegionDraft.PropertyStateProvinceID,transaction);
        if (!region) {
            if (RegionDraft.PropertyStateProvinceName){
                region = false
            } else { 
                throw new Error("\n[ SERVICES ] > 'PropertyStateProvinceID' don't exist, Please verify 'PropertyStateProvinceID' or add 'PropertyStateProvinceName: string' value in your JSON query.")
            }
        }
        return region;
    }


    async getAllHotels() {
        const hotel = await this.repository.findAll();
        return hotel;
    }

    async getHotelsByName(name: string) {
        const hotel = await this.repository.findByName(name)
        return hotel
    }

    async createHotel(newHotel:CreateHotelDTO) {
        return this.transactionManager.runInTransaction(async (t) => {
            const cityDraft:CityDTO = { CityID: newHotel.CityID, CityName: newHotel.PropertyCityName!, Country:newHotel.PropertyCountryCode! }
            const createCity:any = await this.getCity(cityDraft, t)

            const regionDraft:RegionDTO = { PropertyStateProvinceID: newHotel.PropertyStateProvinceID!, PropertyStateProvinceName: newHotel.PropertyStateProvinceName!}
            const createRegion:any = await this.getRegion(regionDraft, t)
            const { PropertyCityName, PropertyCountryCode,  ...restHotel  } = newHotel

            
            if (!createCity) await this.CityRepo.create(cityDraft, t);
            console.log("> City Created <")
            if (!createRegion) await this.RegionRepo.create(regionDraft, t);
            console.log("> Region Created <")

            const hotel = await this.repository.create( {...restHotel}, t);
            console.log("> Hotel Created <")
            return hotel
        });
    }

    async updateHotel(GlobalPropertyID:number,updatedHotel:UpdateHotelDTO) {
        const hotel = await this.repository.update(GlobalPropertyID,updatedHotel);
        return hotel
    }

    async deleteHotel(ID: number) {
        return this.transactionManager.runInTransaction(async (t) => {
            let DeletedCity = 0;
            let DeletedRegion = 0;
            let DeletedReviews = 0;
            let DeletedPriceOffer = 0;

            const hotel = await this.repository.findById(ID,t);
            if (!hotel) {
                throw new Error("Hotel ID not found");
            }

            const cityID = hotel.CityID;
            const regionID = hotel.PropertyStateProvinceID;
            console.log("\n\n___\nthis.reviewRepo =",this.ReviewRepo)
            const hasReviews = await this.ReviewRepo.findThisHotel(ID,t);
            const hasPriceOffer = await this.PriceOfferRepo.findThisHotel(ID,t);
            if (hasReviews) {
                DeletedReviews = await this.ReviewRepo.deleteWithHotel(ID,t);
            }
            if (hasPriceOffer){
                DeletedPriceOffer = await this.PriceOfferRepo.deleteWithHotel(ID,t);
            }

            const DeletedHotel = await this.repository.delete(ID,t);
            const remainingHotel_inCity = await this.repository.cityHasHotel(cityID,t);
            const remainingHotel_inRegion = await this.repository.regionHasHotel(regionID,t);

            if (!remainingHotel_inCity) {
                DeletedCity = await this.CityRepo.delete(cityID,t);
            }
            if (!remainingHotel_inRegion) {
                DeletedRegion = await this.RegionRepo.delete(regionID,t);
            }
            return { DeletedHotel, DeletedCity, DeletedRegion, DeletedPriceOffer, DeletedReviews };
        });
    }
}

export default HotelServices;