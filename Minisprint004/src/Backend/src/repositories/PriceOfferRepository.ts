import { Transaction } from "sequelize";
import type { createPriceOfferDTO, updatePriceOfferDTO } from "../models/data-transfer-object/index.ts";


class PriceOfferRepository {
    private readonly models: any;
    
    constructor(models:any){
        this.models = models;
    }

    async create(newPriceOffer:createPriceOfferDTO,transaction?:Transaction) {
        const priceoffer = await this.models.PriceOffer.create(newPriceOffer, {transaction})
        return priceoffer
    }

    async read(){
        const priceoffers = await this.models.PriceOffer.findAll();
        return priceoffers;
    }

    async findForHotel(hotelID:number, transaction?:Transaction): Promise<any[]> {
        const priceoffers = await this.models.PriceOffer.findAll({where: {HotelID: hotelID}, transaction})
        return priceoffers
    }

    async findByID(ID:number, transaction?:Transaction) {
        const priceoffer = await this.models.PriceOffer.findOne({where: {PriceOfferID: ID}, transaction})
        return priceoffer
    }

    async update(ID:number,updPriceOffer:updatePriceOfferDTO, transaction?:Transaction) {
        const priceoffer = await this.models.PriceOffer.update(updPriceOffer, {where : {PriceOfferID: ID}, returning: true, transaction} )
        return priceoffer
    }

    async delete(ID:number, transaction?:Transaction) {
        const priceoffer = await this.models.PriceOffer.destroy({where: {PriceOfferID: ID}, transaction})
        return priceoffer
    }
}

export default PriceOfferRepository