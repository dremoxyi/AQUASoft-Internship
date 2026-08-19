import express from "express";
import { Bearer_Auth, JWT_Auth } from "../../middlewares/tk_auth.ts";
import ReviewController from "../../controllers/ReviewController.ts";
import type {Router} from 'express'

const router = express.Router();

export default (reviewController: ReviewController): Router => {

  router.get('/', reviewController.readReview);
  router.get('/:id', reviewController.findReview);

  router.post('/hotel/:id/rating', JWT_Auth, reviewController.createReview)
  
  router.put('/:id', Bearer_Auth, reviewController.updateReview);
  router.delete('/:id', JWT_Auth, reviewController.deleteReview);

  return router;
};