import { Op } from 'sequelize';
import type { HotelDTO, updateHotelDTO } from '../models/DataTransferObject/index.ts';

class HotelRepository {
    private models: any;

    constructor(models:any){
        this.models = models;
    }

    async test() {
        return 'HotelService: Getting Hotel from Database'
    }

    async cityHasHotel(cityID:number) {
        const hotel = await this.models.Hotel.findOne({ where:{CityID: cityID}, attributes: ["GlobalPropertyID"] });
        return hotel !== null;
    }
    async regionHasHotel(regionID:number) {
        const hotel = await this.models.Hotel.findOne({ where: {PropertyStateProvinceID:regionID}, attributes:["GlobalPropertyID"]});
        return hotel !== null;
    }

    async findAll() {
        const hotel = await this.models.Hotel.findAll();
        return hotel;
    }

    async findById(ID:number) {
        const hotel = await this.models.Hotel.findOne({ where: {GlobalPropertyID: ID}});
        return hotel;
    }

    async findByName(name:string) {
        const hotel = await this.models.Hotel.findOne({ where: {GlobalPropertyName: {[Op.iLike]: `%`+name+`%`}}})
        return hotel        
    }

    async create(newHotel:HotelDTO) {
        const hotel = await this.models.Hotel.create(newHotel);
        return hotel 
    }

    async update(updatedHotel:updateHotelDTO){
        const { GlobalPropertyID, ...rest } = updatedHotel 
        const hotel = await this.models.Hotel.update( {...rest} , { where: {GlobalPropertyID: GlobalPropertyID}, returning: true});
        return hotel
    }

    async delete(ID:number) {
        const hotel = await this.models.Hotel.destroy({where: {GlobalPropertyID: ID}});
        return hotel;
    }
}

export default HotelRepository;