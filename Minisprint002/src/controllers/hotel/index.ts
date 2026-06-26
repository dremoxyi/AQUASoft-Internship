import { INTEGER } from 'sequelize';
import HotelService from '../../services/hotelServices.ts';
import type { Request, Response } from 'express';

export default class HotelController {
    private readonly hotelService: HotelService;

    constructor(repositories:any) {
        this.hotelService = new HotelService(repositories);
    }

    getAllHotels = async (req:Request,res:Response) => {
        const hotels = await this.hotelService.getAllHotels();
        return res.json(hotels);
    }

    getHotelsByName = async (req:Request,res:Response) => {
        if ((typeof req.params.name) !== 'string') {
            console.log("[ERROR] Could not proceed with 'getHotelsByName'")
            return res.status(401).json({message : "parameter 'name' must be a 'string'"})
        }
        const hotels = await this.hotelService.getHotelsByName(req.params.name);
        return res.json(hotels);
    }

    createHotel = async (req:Request,res:Response) => {
        if (!req.body) {
            console.log( "[ERROR] No request body for 'createHotel'")
            return res.status(401).json({message : "Missing required field > 'JSON request body' required"})
        }
        const hotel = await this.hotelService.createHotel(req.body);
        return res.json(hotel);
    }

    updateHotel = async (req:Request,res:Response) => {
        if (!req.body) {
            console.log( "[ERROR] No request body for 'UpdateHotel'")
            return res.status(401).json({message : "Missing required field > 'JSON request body' required"})
        }
        if (!req.body.GlobalPropertyID) {
            console.log( "[ERROR] Could not proceed with 'UpdateHotel'")
            return res.status(401).json({message : "Missing ID > 'GlobalPropertyID' required"})
        }
        if (isNaN(req.body.GlobalPropertyID)) {
            console.log("[ERROR] Could not proceed with 'deleteHotel'")
            return res.status(401).json({message: "Invalid ID value > 'GlobalPropertyID' must be a number"})
        }
        const hotel = await this.hotelService.updateHotel(req.body);
        return res.json(hotel);
    }
    deleteHotel = async (req:Request, res:Response) => {
        if (typeof (req.params.id) !== 'string') {
            console.log("[ERROR] Could not proceed with 'deleteHotel'")
            return res.status(401).json({message : "Couldn't find an ID > URL parameter 'id' is required"})
        }
        if (isNaN(Number(req.params.id))) {
            console.log("[ERROR] Could not proceed with 'deleteHotel'")
            return res.status(401).json({message: "Invalid ID value > 'id' must be a number"})
        }
        const result = await this.hotelService.deleteHotel(Number(req.params.id));
        return res.json(result);
    }
}