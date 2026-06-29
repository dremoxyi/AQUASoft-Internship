import { Op, Transaction } from 'sequelize';
import type { HotelDTO, updateHotelDTO } from '../models/DataTransferObject/index.ts';
import { transcode } from 'node:buffer';

class HotelRepository {
    private readonly models: any;

    constructor(models:any){
        this.models = models;
    }

    async test() {
        return 'HotelService: Getting Hotel from Database'
    }

    async cityHasHotel(cityID:number, transaction?:Transaction) {
        const hotel = await this.models.Hotel.findOne({ where:{CityID: cityID}, attributes: ["GlobalPropertyID"], transaction });
        return hotel !== null;
    }
    async regionHasHotel(regionID:number,transaction?:Transaction) {
        const hotel = await this.models.Hotel.findOne({ where: {PropertyStateProvinceID:regionID}, attributes:["GlobalPropertyID"],transaction});
        return hotel !== null;
    }

    async findAll() {
        const hotel = await this.models.Hotel.findAll();
        return hotel;
    }

    async findById(ID:number,transaction:Transaction) {
        const hotel = await this.models.Hotel.findOne({ where: {GlobalPropertyID: ID}, transaction});
        return hotel;
    }

    async findByName(name:string) {
        const hotel = await this.models.Hotel.findOne({ where: {GlobalPropertyName: {[Op.iLike]: `%`+name+`%`}}})
        return hotel        
    }

    async create(newHotel:HotelDTO, transaction?:Transaction) {
        const hotel = await this.models.Hotel.create(newHotel, {transaction});
        return hotel 
    }

    async update(GlobalPropertyID:number, updatedHotel:updateHotelDTO){
        const hotel = await this.models.Hotel.update( updatedHotel , { where: {GlobalPropertyID: GlobalPropertyID}, returning: true});
        return hotel
    }

    async delete(ID:number,transaction?:Transaction) {
        const hotel = await this.models.Hotel.destroy({where: {GlobalPropertyID: ID},transaction});
        return hotel;
    }
}

export default HotelRepository;