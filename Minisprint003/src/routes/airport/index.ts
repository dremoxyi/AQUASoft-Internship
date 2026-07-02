import express from 'express';
import type { Router } from 'express';
import type AirportController from '../../controllers/airport/index.ts';
import authenticate from '../../middlewares/auth.ts';

const router = express.Router();

export default (airportController: AirportController): Router => {

  router.get('/:iataCode/closest-hotel-offers',airportController.getClosestHotelOffers);
  router.post('/',authenticate,airportController.createAirport)
  router.delete('/',authenticate,airportController.deleteAirport)
  return router;

};