import express from "express";
import { Bearer_Auth ,JWT_Auth } from "../../middlewares/tk_auth.ts";
import UserController from "../../controllers/UserController.ts";
import type {Router} from 'express'

const router = express.Router();

export default (userController: UserController): Router => {

  router.get('/', JWT_Auth, userController.readUser);
  router.get('/:username', JWT_Auth, userController.findUser);
  router.post('/', JWT_Auth, userController.createUser);
  router.put('/:id', JWT_Auth, userController.updateUser);
  router.delete('/:id', JWT_Auth, userController.deleteUser);

  return router;
};