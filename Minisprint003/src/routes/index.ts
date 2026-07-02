import express from 'express';
import type { Router, Request, Response } from 'express';
import hotelRoute from './hotel/index.ts'
import airportRoute from './airport/index.ts'
import type HotelController from '../controllers/hotel/index.ts';
import type AirportController from '../controllers/airport/index.ts';

const router : Router = express.Router();
export default (params : {hotelController: HotelController, airportController: AirportController} ) => {
    
    router.get('/', (req: Request,res: Response) => {res.send("Nahh the server is indeed running<br>Welcome To API Hotels")});
    router.use('/hotels',hotelRoute(params.hotelController));
    router.use('/airports',airportRoute(params.airportController));

    return router;
}
