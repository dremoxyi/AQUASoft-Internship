import { Association, Op, Transaction } from 'sequelize';
import type { HotelDTO, UpdateHotelDTO } from '../models/DataTransferObject/index.ts';

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
        const hotel = await this.models.Hotel.findOne({where: {PropertyStateProvinceID:regionID}, attributes:["GlobalPropertyID"],transaction});
        return hotel !== null;
    }

    async findAll() {
        const hotel = await this.models.Hotel.findAll({
            include: [
                //{model: this.models.HotelGroup},
                //{model: this.models.PriceOffer},
                //{model: this.models.Review}
            ]});
        return hotel;
    }

    async findById(ID:number,transaction:Transaction) {
        const hotel = await this.models.Hotel.findOne({
            where: {GlobalPropertyID: ID},
            include: [
                {model: this.models.HotelGroup},
                {model: this.models.PriceOffer},
                {model: this.models.Review}
            ],
            transaction
        });
        return hotel;
    }

    async findByName(name:string) {
        const hotel = await this.models.Hotel.findOne({
            where: {GlobalPropertyName: {[Op.iLike]: `%`+name+`%`}},
            include: [
                {model: this.models.HotelGroup},
                {model: this.models.PriceOffer},
                {model: this.models.Review}
            ]
        });
        return hotel        
    }

    async create(newHotel:HotelDTO, transaction?:Transaction) {
        try {
            const hotel = await this.models.Hotel.create(newHotel, {
                include: [
                    {association: 'PriceOffers'}
                ]
                ,transaction
            });
            return hotel
        } catch (err:any){
            console.log(err)
        } 
    }

    async update(GlobalPropertyID:number, updatedHotel:UpdateHotelDTO){
        const hotel = await this.models.Hotel.update( updatedHotel , { where: {GlobalPropertyID: GlobalPropertyID}, returning: true});
        return hotel
    }

    async delete(ID:number,transaction?:Transaction) {
        const hotel = await this.models.Hotel.destroy({where: {GlobalPropertyID: ID},transaction});
        return hotel;
    }
}

export default HotelRepository;