import express from "express";
import { Bearer_Auth, JWT_Auth } from "../../../middlewares/tk_auth.ts";
import HotelGroupController from "../../../controllers/HotelGroupController.ts";
import type {Router} from 'express'

const router = express.Router();

export default (hotelgroupController: HotelGroupController): Router => {

  router.get('/invitations/activate', hotelgroupController.activateHotelGroupMembership);
  router.get('/', JWT_Auth, hotelgroupController.readHotelGroup);
  router.get('/:id/users', JWT_Auth, hotelgroupController.readHotelGroupUsers);
  router.get('/:name', JWT_Auth, hotelgroupController.findHotelGroup);
  router.post('/', JWT_Auth, hotelgroupController.createHotelGroup);
  router.put('/:id', JWT_Auth, hotelgroupController.updateHotelGroup);
  router.delete('/:id', JWT_Auth, hotelgroupController.deleteHotelGroup);
  router.post('/:id/users', JWT_Auth, hotelgroupController.addHotelGroupUser);
  router.post('/:id/invitations', JWT_Auth, hotelgroupController.inviteHotelGroupUsers);
  router.put('/:id/users/:userId', JWT_Auth, hotelgroupController.updateHotelGroupUserRole);
  router.delete('/:id/users/:userId', JWT_Auth, hotelgroupController.removeHotelGroupUser);

  return router;
};