import PriceOfferService from "../services/PriceOfferService.ts"
import type { Request, Response } from 'express';


export default class PriceOfferController {
    private readonly priceofferService: PriceOfferService;

    constructor(dependencies:any){
        this.priceofferService = new PriceOfferService(dependencies)
    }

    createPriceOffer = async (req:Request, res:Response) => {
        if (!req.body) {
            return res.status(400).json({message : "Missing required field > 'JSON request body' required"})
        }
        const user = await this.priceofferService.createPriceOffer(req.body)
        return res.json(user)
    }

    readPriceOffer = async (req:Request, res:Response) => {
        const user = await this.priceofferService.readPriceOffer()
        return res.json(user)
    }

    findPriceOffer = async (req:Request, res:Response) => {
        if (typeof req.params.id !== 'string') {
            return res.status(400).json({message: "Missing required field > 'parameter id' required"})
        }
        if (isNaN(Number(req.params.id))) {
            return res.status(400).json({message: "Parameter 'id' must be a number"})
        }
        const user = await this.priceofferService.findPriceOffer(Number(req.params.id))
        return res.json(user)
    }

    updatePriceOffer = async (req:Request, res:Response) => {
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
        const user = await this.priceofferService.updatePriceOffer(id,req.body)
        return res.json(user)
    }

    deletePriceOffer = async (req:Request, res:Response) => {
        if (typeof req.params.id !== 'string') {
            return res.status(400).json({message: "Missing required field > 'parameter id' required"})
        }
        if (isNaN(Number(req.params.id))) {
            return res.status(400).json({message: "Parameter 'id' must be a number"})
        }
        const id = Number(req.params.id)
        const user = await this.priceofferService.deletePriceOffer(id)
        return res.json(user)
    }


}