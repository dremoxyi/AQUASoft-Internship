import express from 'express';
import type { Router, Request, Response } from 'express';
import hotelRoute from './hotel/index.ts'
import type HotelController from '../controllers/hotel/index.ts';

const router : Router = express.Router();
export default (params : {hotelController: HotelController} ) => {
    
    router.get('/', (req: Request,res: Response) => {res.send("Nahh the server is indeed running<br>Welcome To API Hotels")});
    router.use('/hotels',hotelRoute(params.hotelController));

    return router;
}
