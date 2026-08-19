import express from "express";
import AuthController from "../../controllers/AuthController.ts";
import type {Router} from 'express'

const router = express.Router();

export default (authController: AuthController): Router => {

  router.post('/register',authController.register);
  router.post('/login',authController.login);
  router.post('/logout',authController.logout);
  router.get('/me',authController.whoami);
  router.put('/me',authController.updateMe);
  router.get('/check',authController.check);

  return router;
};