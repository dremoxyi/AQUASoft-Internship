import express from 'express'
import userRoute from './user/index.ts'
import authRoute from './auth/index.ts'
import airportRoute from './airport/index.ts'
import hotelRoute from './hotel/index.ts'
import reviewRoute from './review/index.ts'
import permissionRoute from './permissions/index.ts'
import type {Router,Request,Response} from 'express'
import type UserController from '../controllers/UserController.ts';
import type AuthController from '../controllers/AuthController.ts';
import type AirportController from '../controllers/AirportController.ts';
import type HotelController from '../controllers/HotelController.ts'
import type ReviewController from '../controllers/ReviewController.ts'
import type HotelGroupController from '../controllers/HotelGroupController.ts'
import type PriceOfferController from '../controllers/PriceOfferController.ts'
import type SearchController from '../controllers/SearchController.ts'
import type PermissionController from '../controllers/PermissionController.ts'

const router : Router = express.Router();
export default (params: {userController:UserController, authController:AuthController, airportController:AirportController, hotelController:HotelController, reviewController:ReviewController, hotelgroupController:HotelGroupController, priceofferController: PriceOfferController, searchController: SearchController, permissionController:PermissionController ,models?: any}):Router => {
    
    router.get('/', (req: Request,res: Response) => {res.send("Server is indeed running<br>Welcome To HomePage")});

    router.get('/search', params.searchController.searchHotel);
    router.use('/auth', authRoute(params.authController));
    router.use('/role-permissions', permissionRoute(params.permissionController));
    router.use('/user', userRoute(params.userController));
    router.use('/airport', airportRoute(params.airportController));
    router.use('/hotel', hotelRoute(params.hotelController, params.hotelgroupController, params.priceofferController));
    router.use('/review', reviewRoute(params.reviewController));

    return router;
}
