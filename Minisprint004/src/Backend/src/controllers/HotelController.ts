import HotelService from "../services/HotelService.ts"
import type { Request, Response } from 'express';


export default class HotelController {
    private readonly hotelService: HotelService;

    constructor(dependencies:any){
        this.hotelService = new HotelService(dependencies)
    }

    createHotel = async (req:Request, res:Response) => {
        try {
            if (!req.body) {
                return res.status(400).json({message : "Missing required field > 'JSON request body' required"})
            }

            const actor = res.locals.user as { id?: string | number } | undefined
            const creatorId = actor?.id != null ? Number(actor.id) : undefined

            const user = await this.hotelService.createHotel(req.body, creatorId)
            return res.json(user)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to create hotel"
            const status = message === "Unauthorized" ? 401 : 400
            return res.status(status).json({ message })
        }
    }

    readHotel = async (req:Request, res:Response) => {
        const user = await this.hotelService.readHotel()
        return res.json(user)
    }

    findHotel = async (req:Request, res:Response) => {
        if (typeof req.params.id !== 'string'){
            return res.status(400).json({message: "Parameter 'id' must be defined"})
        }
        const id = Number(req.params.id)
        if (isNaN(id)){
            return res.status(400).json({message: "Parameter 'id' must be a number"})
        }
        const user = await this.hotelService.findHotel(id)
        return res.status(200).json(user)
    }

    updateHotel = async (req:Request, res:Response) => {
        try {
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

            const actor = res.locals.user as { id?: string | number, rolename?: string } | undefined
            const editorId = actor?.id != null ? Number(actor.id) : undefined
            const role = actor?.rolename

            const user = await this.hotelService.updateHotel(id,req.body, editorId, role)
            return res.json(user)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to update hotel"
            const status = message === "Unauthorized" ? 401 : 400
            return res.status(status).json({ message })
        }
    }

    deleteHotel = async (req:Request, res:Response) => {
        if (typeof req.params.id !== 'string') {
            return res.status(400).json({message: "Missing required field > 'parameter id' required"})
        }
        if (isNaN(Number(req.params.id))) {
            return res.status(400).json({message: "Parameter 'id' must be a number"})
        }
        const id = Number(req.params.id)
        const user = await this.hotelService.deleteHotel(id)
        return res.json(user)
    }


}