import express from "express";
import { Bearer_Auth, JWT_Auth } from "../../../middlewares/tk_auth.ts";
import PriceOfferController from "../../../controllers/PriceOfferController.ts";
import type {Router} from 'express'

const router = express.Router();

export default (priceofferController: PriceOfferController): Router => {

  router.get('/', priceofferController.readPriceOffer);
  router.get('/:id', priceofferController.findPriceOffer);
  router.post('/', Bearer_Auth, priceofferController.createPriceOffer);
  router.put('/:id', Bearer_Auth, priceofferController.updatePriceOffer);
  router.delete('/:id', Bearer_Auth, priceofferController.deletePriceOffer);

  return router;
};