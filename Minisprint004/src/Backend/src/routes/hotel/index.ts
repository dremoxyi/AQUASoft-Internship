import express from "express";
import { Bearer_Auth, JWT_Auth } from "../../middlewares/tk_auth.ts";
import HotelController from "../../controllers/HotelController.ts";
import type {Router} from 'express'
import hotelgroupRoute from './hotel-group/index.ts'
import priceofferRoute from './price-offer/index.ts'
import type HotelGroupController from "../../controllers/HotelGroupController.ts";
import type PriceOfferController from "../../controllers/PriceOfferController.ts";

const router = express.Router();

export default (hotelController: HotelController,hotelgroupController:HotelGroupController,priceofferController:PriceOfferController): Router => {

  router.use('/hgroup', hotelgroupRoute(hotelgroupController));
  router.use('/prices', priceofferRoute(priceofferController));
  //--
  router.get('/', hotelController.readHotel);
  router.get('/:id', hotelController.findHotel);
  router.post('/', JWT_Auth, hotelController.createHotel);
  router.put('/:id', JWT_Auth, hotelController.updateHotel);
  router.delete('/:id', JWT_Auth, hotelController.deleteHotel);

  return router;
};