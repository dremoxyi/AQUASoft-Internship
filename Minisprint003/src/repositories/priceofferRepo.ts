import type { Transaction } from "sequelize";


class PriceOfferRepository {
    private readonly models:any;

    constructor(models:any){
        this.models = models
    }
    
    async findThisHotel(HotelID: number, transaction?:Transaction) {
        const PriceOffers = this.models.PriceOffer.findAll({ where: {HotelID:HotelID}, transaction})
        return PriceOffers
    }
    async deleteWithHotel(HotelID: number, transaction?:Transaction) {
        const del = this.models.PriceOffer.destroy({ where: { HotelID: HotelID },transaction} )
        return del
    }

}


export default PriceOfferRepository;