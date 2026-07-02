import type { Transaction } from "sequelize";


class ReviewRepository {
    private readonly models:any;

    constructor(models:any){
        this.models = models
    }

    async findThisHotel(HotelID: number, transaction?:Transaction) {
        const reviews = this.models.Review.findAll({ where: {HotelID:HotelID}, transaction})
        return reviews
    }
    
    async deleteWithHotel(HotelID: number, transaction?:Transaction) {
        const del = this.models.Review.destroy({ where: { HotelID: HotelID },transaction} )
        return del
    }

}


export default ReviewRepository;