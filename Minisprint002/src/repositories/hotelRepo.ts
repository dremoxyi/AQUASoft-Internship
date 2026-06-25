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

    async countByCity(cityID:number) {
        const count = await this.models.Hotel.count({ where:{CityID: cityID} })
        return count
    }
    async countByRegion(regionID:number) {
        const count = await this.models.Hotel.count({ where: {PropertyStateProvinceID:regionID}})
        return count
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
        if (!updatedHotel.GlobalPropertyID) { throw new Error("[ REPO ] > Global Property ID needed")}
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