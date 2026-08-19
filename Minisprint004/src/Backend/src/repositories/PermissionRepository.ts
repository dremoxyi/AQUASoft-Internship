import { Transaction } from "sequelize";

class RolePermissionRepository {
    private readonly models: any;

    constructor(models: any) {
        this.models = models;
    }

    async getRoles(transaction?: Transaction) {
        const roles = await this.models.Role.findAll({
            attributes: ["RoleID", "RoleName"],
            order: [["RoleID", "ASC"]],
            transaction,
        });

        return roles;
    }

    async getPermissions(transaction?: Transaction) {
        const permissions = await this.models.Permission.findAll({
            attributes: ["PermissionID", "PermissionName"],
            transaction,
        });

        return permissions;
    }

    async getRolePermissions(transaction?: Transaction) {
        const rolePermissions = await this.models.RolePermission.findAll({
            attributes: ["RoleID", "PermissionID"],
            transaction,
        });

        return rolePermissions;
    }

    async findRoleById(ID: number, transaction?: Transaction) {
        const role = await this.models.Role.findByPk(ID, {
            transaction,
        });

        return role;
    }

    async findPermissionsByNames(names: string[], transaction?: Transaction) {
        const permissions = await this.models.Permission.findAll({
            where: {
                PermissionName: names,
            },
            transaction,
        });

        return permissions;
    }

    async grantPermission(roleId: number, permissionId: number, transaction?: Transaction) {
        const rolePermission = await this.models.RolePermission.findOrCreate({
            where: {
                RoleID: roleId,
                PermissionID: permissionId,
            },
            defaults: {
                RoleID: roleId,
                PermissionID: permissionId,
            },
            transaction,
        });

        return rolePermission;
    }

    async revokePermission(roleId: number, permissionId: number, transaction?: Transaction) {
        const deleted = await this.models.RolePermission.destroy({
            where: {
                RoleID: roleId,
                PermissionID: permissionId,
            },
            transaction,
        });

        return deleted;
    }
}

export default RolePermissionRepository;