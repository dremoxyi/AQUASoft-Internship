import ReviewService from "../services/ReviewService.ts"
import type { Request, Response } from 'express';


export default class ReviewController {
    private readonly reviewService: ReviewService;

    constructor(dependencies:any){
        this.reviewService = new ReviewService(dependencies)
    }

    createReview = async (req: Request, res: Response) => {
        if (!req.body) {
            return res.status(400).json({message: "Missing required field > 'JSON request body' required"});
        }
        if (typeof req.params.id !== "string") {
            return res.status(400).json({message: "Missing required field > 'parameter id' required"});
        }

        const hotelId = Number(req.params.id);
        if (!Number.isInteger(hotelId) || hotelId <= 0) {
            return res.status(400).json({message: "Parameter 'id' must be a positive number"});
        }

        const rating = Number(req.body.Rating);
        const title = req.body.Title ?? null;
        const text = req.body.Text ?? null; 
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({message: "Rating must be an integer between 1 and 5"});
        }

        const userId = Number(res.locals.user?.id);
        if (!Number.isInteger(userId)) {
            return res.status(401).json({message: "Unauthorized -> Invalid user information"});
        }

        const review = await this.reviewService.createReview(hotelId, userId, rating, text, title);
        return res.status(201).json(review);
    }

    readReview = async (req:Request, res:Response) => {
        const user = await this.reviewService.readReview()
        return res.json(user)
    }

    findReview = async (req:Request, res:Response) => {
        if (typeof req.params.id !== 'string') {
            return res.status(400).json({message: "Missing required field > 'parameter id' required"})
        }
        if (isNaN(Number(req.params.id))) {
            return res.status(400).json({message: "Parameter 'id' must be a number"})
        }
        const user = await this.reviewService.findReview(Number(req.params.id))
        return res.json(user)
    }

    updateReview = async (req:Request, res:Response) => {
        if (typeof req.params.id !== 'string') {
            return res.status(400).json({message: "Missing required field > 'parameter id' required"})
        }
        if (isNaN(Number(req.params.id))) {
            return res.status(400).json({message: "Parameter 'id' must be a number"})
        }
        const id = Number(req.params.id)
        if (!req.body) {
            return res.status(400).json({message : "Missing required field > 'JSON request body' required"})
        }
        const user = await this.reviewService.updateReview(id,req.body)
        return res.json(user)
    }

    deleteReview = async (req: Request, res: Response) => {
        if (typeof req.params.id !== "string") {
            return res.status(400).json({ message: "Missing required field > 'parameter id' required" })
        }
        console.log("YESSS")
        if (isNaN(Number(req.params.id))) {
            return res.status(400).json({ message: "Parameter 'id' must be a number" })
        }

        const id = Number(req.params.id)
        const actor = res.locals.user as { id?: number; rolename?: string } | undefined

        if (!actor?.id || !actor.rolename) {
            return res.status(401).json({ message: "Authentication required" })
        }

        try {
            const review = await this.reviewService.deleteReview(id, actor)
            return res.json(review)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to delete review"
            return res.status(403).json({ message })
        }
    }
}