import TransactionManager from "../managers/sequelizeManager.ts"
import ReviewRepository from "../repositories/ReviewRepository.ts"
import type { createReviewDTO, updateReviewDTO } from "../models/data-transfer-object/index.ts";
import type HotelRepository from "../repositories/HotelRepository.ts";
import { buildAspectScores } from "../../../../setup/helpers/ratings.ts"
import { buildAquaInput, calculateAquaRating} from "../../../../setup/helpers/aqua.ts"

class ReviewService {
    private readonly transactionManager: TransactionManager
    private readonly Repo: ReviewRepository;
    private readonly hotelRepo: HotelRepository;

    constructor({sequelizeManager,reviewRepository, hotelRepository}
        :{sequelizeManager: TransactionManager,reviewRepository:ReviewRepository,hotelRepository:HotelRepository} ){
        this.transactionManager = sequelizeManager
        this.Repo = reviewRepository
        this.hotelRepo = hotelRepository
    }

    async createReview(hotelId: number, userId: number, rating: number, text?: string, title?: string) {
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            throw new Error("Rating must be an integer between 1 and 5");
        }

        return this.transactionManager.runInTransaction(async (t) => {
            const hotel = await this.hotelRepo.findByID(hotelId, t);

            if (!hotel) {
                throw new Error("Hotel not found");
            }

            const existingReview =
                await this.Repo.findByUserAndHotel(userId,hotelId,t);
            if (existingReview) {
                throw new Error("You have already rated this hotel");
            }

            const {AmenitiesRate,CleanlinessRate,FoodBeverageRate,SleepQualityRate,InternetQualityRate}
                    = buildAspectScores(text ?? "", rating);

            const reviewDTO: createReviewDTO = {
                Rating: rating,
                UserID: userId,
                HotelID: hotelId,
                Text: text ?? "",
                Title: title ?? "",

                AmenitiesRate: AmenitiesRate,
                CleanlinessRate: CleanlinessRate,
                FoodBeverageRate: FoodBeverageRate,
                SleepQualityRate: SleepQualityRate,
                InternetQualityRate: InternetQualityRate
            };
            
            const review = await this.Repo.create(reviewDTO,t);

            const score = { BaseRate: rating, AmenitiesRate, CleanlinessRate, FoodBeverageRate, SleepQualityRate, InternetQualityRate}
            await this.hotelRepo.incrementRating(hotelId,score,t);

            const updatedHotel = await this.hotelRepo.findByID(hotelId, t);
            if (!updatedHotel) {
                throw new Error("Hotel not found");
            }

            const aquaInput = buildAquaInput(updatedHotel);
            const aqua = calculateAquaRating(aquaInput);
            await this.hotelRepo.updateAquaRating(hotelId,aqua,t);

            return review;
        });
    }

    async readReview(){
        const review = await this.Repo.read()
        return review
    }

    async findReview(ID:number) {
        const review = await this.Repo.findByID(ID)
        return review
    }

    async updateReview(ID: number, updatedReview: updateReviewDTO) {
        return this.transactionManager.runInTransaction(async (t) => {
            const review= await this.Repo.update(ID,updatedReview,t)
            return review
        })
    }

    async deleteReview(ID: number, actor: { id?: number; rolename?: string }) {
        return this.transactionManager.runInTransaction(async (t) => {
            const review = await this.Repo.findByID(ID, t)

            if (!review) {
                throw new Error("Review not found")
            }

            const isPrivileged = actor.rolename === "Admin" || actor.rolename === "DataOperator"
            const isOwner = review.UserID === actor.id

            if (!isPrivileged && !isOwner) {
                throw new Error("You do not have permission to delete this review")
            }

            const DeletedReview = await this.Repo.delete(ID, t)

            return { DeletedReview }
        })
    }
}

export default ReviewService