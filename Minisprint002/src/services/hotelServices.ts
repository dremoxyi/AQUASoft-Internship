import type { FullDTO, RegionDTO ,CityDTO, HotelDTO, updateHotelDTO } from '../models/DataTransferObject/index.ts';
import CityRepository from '../repositories/cityRepo.ts';
import type HotelRepository from '../repositories/hotelRepo.ts';
import type RegionRepository from '../repositories/regionRepo.ts';

class HotelServices {
    private repository: HotelRepository;
    private CityRepo : CityRepository;
    private RegionRepo : RegionRepository

    constructor(
        {hotelRepository, cityRepository,regionRepository}
        :{hotelRepository: HotelRepository, cityRepository:CityRepository, regionRepository:RegionRepository}){

        this.repository = hotelRepository
        this.CityRepo = cityRepository
        this.RegionRepo = regionRepository
    }


    async getTest() {
        const test = await this.repository.test();
        return test;
    }

    private async getCity(cityDraft: CityDTO){
        let city = await this.CityRepo.getCityByID(cityDraft.CityID);
        if (!city) {
            if ((cityDraft.CityName) && (cityDraft.Country)) {
                city = false;
            } else {
                throw new Error("\n[ SERVICES ] > 'CityID' don't exist, Please verify 'CityID' or add 'PropertyCountryCode: string' and 'Country: string' values in your JSON query.")
            }
        }
        return city;
    }

    private async getRegion(RegionDraft: RegionDTO){
        let region = await this.RegionRepo.getRegionByID(RegionDraft.PropertyStateProvinceID);
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

    async createHotel(newHotel:FullDTO) {  
        const cityDraft:CityDTO = { CityID: newHotel.CityID, CityName: newHotel.PropertyCityName!, Country:newHotel.PropertyCountryCode! }
        const createCity:any = await this.getCity(cityDraft)

        const regionDraft:RegionDTO = { PropertyStateProvinceID: newHotel.PropertyStateProvinceID, PropertyStateProvinceName: newHotel.PropertyStateProvinceName!}
        const createRegion:any = await this.getRegion(regionDraft)
        const { PropertyCityName, PropertyCountryCode,  ...restHotel  } = newHotel

        if (!createCity) await this.CityRepo.create(cityDraft);
        console.log("> City Done <")
        if (!createRegion) await this.RegionRepo.create(regionDraft);
        console.log("> Region Done <")
        const hotel = await this.repository.create( {...restHotel} );
        console.log("> Hotel Done <")
        return hotel
    }

    async updateHotel(updatedHotel:updateHotelDTO) {
        const hotel = await this.repository.update(updatedHotel);
        return hotel
    }

    async deleteHotel(ID: number) {
        const hotel = await this.repository.findById(ID);
        if (!hotel) {
            throw new Error("Hotel ID not found");
        }
        const cityID = hotel.CityID;
        const regionID = hotel.PropertyStateProvinceID;
        const DeletedHotel = await this.repository.delete(ID);
        let DeletedCity = 0;
        let DeletedRegion = 0;
        const remainingHotel_inCity = await this.repository.cityHasHotel(cityID);
        const remainingHotel_inRegion = await this.repository.regionHasHotel(regionID);

        if (!remainingHotel_inCity) {
            DeletedCity = await this.CityRepo.delete(cityID);
        }

        if (!remainingHotel_inRegion) {
            DeletedRegion = await this.RegionRepo.delete(regionID);
        }

        return { DeletedHotel, DeletedCity, DeletedRegion };
    }
}

export default HotelServices;