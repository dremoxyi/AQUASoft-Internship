import HotelService from '../../services/hotelServices.ts';
import type { Request, Response } from 'express';

export default class HotelController {
    private hotelService: HotelService;

    constructor(repositories:any) {
        this.hotelService = new HotelService(repositories);
    }

    getAllHotels = async (req:Request,res:Response) => {
        const hotels = await this.hotelService.getAllHotels();
        return res.json(hotels);
    }

    getHotelsByName = async (req:Request,res:Response) => {
        if ((typeof req.params.name) === 'string') {
            const hotels = await this.hotelService.getHotelsByName(req.params.name);
            res.json(hotels);
        } else {
            console.log("[ ROUTES ] Name ERROR, 'GlobalPropertyName' missing or not a 'string'")
        }
    }

    createHotel = async (req:Request,res:Response) => {
        const hotel = await this.hotelService.createHotel(req.body);
        res.json(hotel);
    }

    updateHotel = async (req:Request,res:Response) => {
        const hotel = await this.hotelService.updateHotel(req.body);
        res.json(hotel);
    }
    deleteHotel = async (req:Request, res:Response) => {
        const result = await this.hotelService.deleteHotel(Number(req.params.id));
        res.json(result);
    }
}