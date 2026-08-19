import RolePermissionService from "../services/PermissionService.ts";
import type { Request, Response } from "express";

export default class RolePermissionController {
    private readonly rolePermissionService: RolePermissionService;

    constructor(dependencies: any) {
        this.rolePermissionService = new RolePermissionService(dependencies);
    }

    readRolePermissions = async (_req: Request, res: Response) => {
        const permissions = await this.rolePermissionService.getPermissions();
        return res.json(permissions);
    };

    updateRolePermissions = async (req: Request, res: Response) => {
        if (typeof req.params.roleId !== "string") {
            return res.status(400).json({ message: "Missing required field > 'parameter roleId' required" });
        }

        if (isNaN(Number(req.params.roleId))) {
            return res.status(400).json({ message: "Parameter 'roleId' must be a number" });
        }

        if (!req.body) {
            return res.status(400).json({ message: "Missing required field > 'JSON request body' required" });
        }

        const roleId = Number(req.params.roleId);
        const permissions = await this.rolePermissionService.updatePermissions(roleId, req.body);

        return res.json(permissions);
    };
}

