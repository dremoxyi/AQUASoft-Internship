import SearchService from "../services/SearchService.ts"
import type { Request, Response } from 'express';

export default class HotelController {
    private readonly SearchService: SearchService;

    constructor(dependencies:any){
        this.SearchService = new SearchService(dependencies)
    }

    searchHotel = async (req:Request, res:Response) => {
        const start = Date.now()
        const l = Number(req.query.limit)
        const o = Number(req.query.offset)
        const q = String(req.query.q).replace(/[%_]/g, "\\$&");
        const user = await this.SearchService.searchHotel(q, l, o)
        console.log("Query time:", Date.now() - start,'ms')
        return res.json(user)
    }
}