import UserService from "../services/UserService.ts"
import type { Request, Response } from 'express';

const ROLE_ID_BY_NAME: Record<string, number> = {
    "Admin": 1,
    "DataOperator": 2,
    "Manager": 3,
    "Traveler": 4,
};

export default class UserController {
    private readonly userService: UserService;
    private readonly models: any;

    constructor(dependencies:any){
        this.userService = new UserService(dependencies)
        this.models = dependencies?.models ?? null
    }

    private async hasPermission(actor: { rolename?: string } | undefined, permissionName: string) {
        if (!actor) {
            return false
        }

        if (actor.rolename === "Admin") {
            return true
        }

        if (!this.models) {
            return false
        }

        const roleId = ROLE_ID_BY_NAME[actor.rolename ?? ""]
        if (roleId == null) {
            return false
        }

        const permission = await this.models.Permission.findOne({
            where: { PermissionName: permissionName },
        })

        if (!permission) {
            return false
        }

        const row = await this.models.RolePermission.findOne({
            where: {
                RoleID: roleId,
                PermissionID: permission.PermissionID,
            },
        })

        return Boolean(row)
    }

    private getRoleRank(roleName?: string) {
        switch (roleName) {
            case "Admin":
            case "Administrator":
                return 4;

            case "DataOperator":
            case "Data Operator":
                return 3;

            case "Manager":
            case "HotelManager":
                return 2;

            case "Traveler":
                return 1;

            default:
                return 0;
        }
    }

    private canManageTarget(
        actor: { id?: number; rolename?: string } | undefined,
        target: { UserID?: number; Role?: { RoleName?: string }; RoleID?: number }
    ) {
        if (!actor) {
            return false;
        }

        // You may edit yourself.
        if (actor.id != null && target.UserID === actor.id) {
            return true;
        }

        return this.getRoleRank(actor.rolename) > this.getRoleRank(
            target.Role?.RoleName
        );
    }

    private canChangePassword(
        actor: { id?: number; rolename?: string } | undefined,
        target: { UserID?: number; Role?: { RoleName?: string }; RoleID?: number }
    ) {
        if (!actor) {
            return false;
        }

        // Password management is reserved for Admin/DataOperator.
        const actorRank = this.getRoleRank(actor.rolename);

        return (
            actorRank >= 3 &&
            this.canManageTarget(actor, target)
        );
    }

    createUser = async (req:Request, res:Response) => {
        if (!(await this.hasPermission(res.locals.user, "USER_WRITE"))) {
            return res.status(403).json({ message: "Admin access required" })
        }

        if (!req.body) {
            return res.status(400).json({message : "Missing required field > 'JSON request body' required"})
        }

        try {
            const user = await this.userService.createUser(req.body)
            return res.json(user)
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to create user"
            return res.status(400).json({ message })
        }
    }

    readUser = async (req:Request, res:Response) => {
        if (!(await this.hasPermission(res.locals.user, "USER_READ"))) {
            return res.status(403).json({ message: "Admin access required" })
        }

        const user = await this.userService.readUser()
        return res.json(user)
    }

    findUser = async (req:Request, res:Response) => {
        if (typeof req.params.username !== 'string'){
            return res.status(400).json({message: "Parameter 'username' must be defined and as a string"})
        }

        if (!(await this.hasPermission(res.locals.user, "USER_READ"))) {
            return res.status(403).json({ message: "Admin access required" })
        }

        const user = await this.userService.findUser(req.params.username)
        return res.json(user)
    }

    updateUser = async (req: Request, res: Response) => {
        if (!(await this.hasPermission(res.locals.user, "USER_WRITE"))) {
            return res.status(403).json({ message: "Admin access required" });
        }

        if (typeof req.params.id !== "string") {
            return res.status(400).json({
                message: "Missing required field > 'parameter id' required",
            });
        }

        if (isNaN(Number(req.params.id))) {
            return res.status(400).json({
                message: "Parameter 'id' must be a number",
            });
        }

        const id = Number(req.params.id);

        if (!req.body) {
            return res.status(400).json({
                message: "Missing required field > 'JSON request body' required",
            });
        }

        try {
            const users = await this.userService.readUser();
            const targetUser = users.find((user: any) => user.UserID === id);

            if (!targetUser) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            const actor = res.locals.user as {
                id?: number;
                rolename?: string;
            };

            if (!this.canManageTarget(actor, targetUser)) {
                return res.status(403).json({
                    message: "You do not have permission to manage this user",
                });
            }

            const requestedRoleId = Number(req.body.RoleID);

            if (!Number.isNaN(requestedRoleId)) {
                const requestedRole = Object.entries(ROLE_ID_BY_NAME)
                    .find(([, roleId]) => roleId === requestedRoleId)?.[0];

                if (
                    requestedRole &&
                    requestedRole !== actor.rolename &&
                    this.getRoleRank(requestedRole) >= this.getRoleRank(actor.rolename)
                ) {
                    return res.status(403).json({
                        message: "You cannot assign a role equal to or higher than your own",
                    });
                }

                // Even when editing yourself, you cannot promote yourself.
                if (
                    requestedRole &&
                    targetUser.UserID === actor.id &&
                    this.getRoleRank(requestedRole) > this.getRoleRank(actor.rolename)
                ) {
                    return res.status(403).json({
                        message: "You cannot promote yourself",
                    });
                }
            }

            const body = { ...req.body };

            if (body.Password) {
                if (!this.canChangePassword(actor, targetUser)) {
                    return res.status(403).json({
                        message: "You do not have permission to change this user's password",
                    });
                }
            }

            const user = await this.userService.updateUser(id, body);
            return res.json(user);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to update user";

            return res.status(400).json({ message });
        }
    };

    deleteUser = async (req: Request, res: Response) => {
        if (!(await this.hasPermission(res.locals.user, "USER_DELETE"))) {
            return res.status(403).json({ message: "Admin access required" });
        }

        if (typeof req.params.id !== "string") {
            return res.status(400).json({
                message: "Missing required field > 'parameter id' required",
            });
        }

        if (isNaN(Number(req.params.id))) {
            return res.status(400).json({
                message: "Parameter 'id' must be a number",
            });
        }

        const id = Number(req.params.id);

        try {
            const users = await this.userService.readUser();
            const targetUser = users.find((user: any) => user.UserID === id);

            if (!targetUser) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            const actor = res.locals.user as {
                id?: number;
                rolename?: string;
            };

            // Nobody can delete themselves.
            if (actor.id != null && targetUser.UserID === actor.id) {
                return res.status(403).json({
                    message: "You cannot delete your own account",
                });
            }

            // Hierarchy check.
            if (this.getRoleRank(actor.rolename) <= this.getRoleRank(targetUser.Role?.RoleName)) {
                return res.status(403).json({
                    message: "You do not have permission to delete this user",
                });
            }

            const user = await this.userService.deleteUser(id);
            return res.json(user);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to delete user";

            return res.status(400).json({ message });
        }
    };
}