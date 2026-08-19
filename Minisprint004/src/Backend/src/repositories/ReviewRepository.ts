import { Transaction } from "sequelize";
import type { createReviewDTO, updateReviewDTO } from "../models/data-transfer-object/index.ts";


class ReviewRepository {
    private readonly models: any;
    
    constructor(models:any){
        this.models = models;
    }

    async create(newReview: createReviewDTO, transaction?: Transaction) {
        const review = await this.models.Review.create(newReview, { transaction });

        return this.models.Review.findOne({
            where: { ReviewId: review.ReviewId },
            include: [{ model: this.models.User }],
            transaction
        });
    }

    async read(){
        const reviews = await this.models.Review.findAll();
        return reviews;
    }

    async findByID(ID:number, transaction?:Transaction) {
        const review = await this.models.Review.findOne({where: {ReviewId: ID}, transaction})
        return review
    }

    async findByUserAndHotel(userId: number, hotelId: number, transaction?: Transaction) {
        const review = this.models.Review.findOne({
            where: {UserID: userId, HotelID: hotelId},
            transaction,
        });
        return review
    }

    async update(ID:number,updReview:updateReviewDTO, transaction?:Transaction) {
        const review = await this.models.Review.update(updReview, {where : {ReviewId: ID}, returning: true, transaction} )
        return review
    }

    async delete(ID:number, transaction?:Transaction) {
        const review = await this.models.Review.destroy({where: {ReviewId: ID}, transaction})
        return review
    }
}

export default ReviewRepository