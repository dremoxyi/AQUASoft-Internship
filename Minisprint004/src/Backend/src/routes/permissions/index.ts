import express from "express";
import type { Router } from "express";
import { JWT_Auth } from "../../middlewares/tk_auth.ts";
import type RolePermissionController from "../../controllers/PermissionController.ts";

const router: Router = express.Router();

export default (permissionController: RolePermissionController): Router => {
    router.get("/", JWT_Auth, permissionController.readRolePermissions);
    router.put("/:roleId", JWT_Auth, permissionController.updateRolePermissions);

    return router;
};
