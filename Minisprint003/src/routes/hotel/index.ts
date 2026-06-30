import express from 'express';
import type { Router } from 'express';
import type HotelController from '../../controllers/hotel/index.ts';
import authenticate from '../../middlewares/auth.ts';

const router = express.Router();

export default (hotelController: HotelController): Router => {

  router.get('/', hotelController.getAllHotels);
  router.get('/:name', hotelController.getHotelsByName);
  router.post('/', authenticate,hotelController.createHotel);
  router.put('/:id', authenticate,hotelController.updateHotel);
  router.delete('/:id', authenticate,hotelController.deleteHotel);

  return router;
};