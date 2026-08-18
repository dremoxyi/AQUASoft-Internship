import express from "express";
import { Bearer_Auth, JWT_Auth } from "../../middlewares/tk_auth.ts";
import AirportController from "../../controllers/AirportController.ts";
import type {Router} from 'express'

const router = express.Router();

export default (airportController: AirportController): Router => {

  router.get('/', airportController.readAirport);
  router.get('/:iata', airportController.findAirport);
  router.post('/', Bearer_Auth, airportController.createAirport);
  router.put('/:id', Bearer_Auth, airportController.updateAirport);
  router.delete('/:id', Bearer_Auth, airportController.deleteAirport);

  return router;
};