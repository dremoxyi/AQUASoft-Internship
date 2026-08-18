import bcrypt from "bcrypt";
import { Sequelize } from "sequelize";

export default async function seedDatabase(sequelize: Sequelize): Promise<Array<[string, number]>> {

    const Role = sequelize.models.Role;
    const Permission = sequelize.models.Permission;
    const RolePermission = sequelize.models.RolePermission;
    const User = sequelize.models.User;

    if (typeof Role == 'undefined'){
        throw new Error("ERROR, Role UNDEFINED")
    }
    if (typeof Permission == 'undefined'){
        throw new Error("ERROR, Permission UNDEFINED")
    }
    if (typeof RolePermission == 'undefined'){
        throw new Error("ERROR, RolePermission UNDEFINED")
    }
    if (typeof User == 'undefined'){
        throw new Error("ERROR, User UNDEFINED")
    }


    // ================= ROLES =================
    const roles=
    [
        { RoleID: 1, RoleName: "Administrator" },
        { RoleID: 2, RoleName: "DataOperator" },
        { RoleID: 3, RoleName: "HotelManager" },
        { RoleID: 4, RoleName: "Traveler" }
    ]

    await Role.bulkCreate(roles, { ignoreDuplicates: true });


    // ================= PERMISSIONS =================

    await Permission.bulkCreate([
        { PermissionID: 1, PermissionName: "HOTEL_READ" },
        { PermissionID: 2, PermissionName: "HOTEL_WRITE" },
        { PermissionID: 3, PermissionName: "HOTEL_DELETE" },

        { PermissionID: 4, PermissionName: "HOTELGROUP_READ" },
        { PermissionID: 5, PermissionName: "HOTELGROUP_WRITE" },
        { PermissionID: 6, PermissionName: "HOTELGROUP_DELETE" },

        { PermissionID: 7, PermissionName: "REVIEW_READ" },
        { PermissionID: 8, PermissionName: "REVIEW_WRITE" },
        { PermissionID: 9, PermissionName: "REVIEW_DELETE" },

        { PermissionID: 10, PermissionName: "USER_READ" },
        { PermissionID: 11, PermissionName: "USER_WRITE" },
        { PermissionID: 12, PermissionName: "USER_DELETE" },

    ], {
        ignoreDuplicates: true
    });


    // ================= ROLE PERMISSIONS =================

    const rolePermissions = [

        // Administrator - Everything
        ...Array.from({ length: 12 }, (_, i) => ({
            RoleID: 1,
            PermissionID: i + 1
        })),

        // DataOperator
        { RoleID: 2, PermissionID: 1 },
        { RoleID: 2, PermissionID: 2 },
        { RoleID: 2, PermissionID: 3 },
        { RoleID: 2, PermissionID: 4 },
        { RoleID: 2, PermissionID: 5 },
        { RoleID: 2, PermissionID: 6 },
        { RoleID: 2, PermissionID: 7 },
        { RoleID: 2, PermissionID: 8 },
        { RoleID: 2, PermissionID: 9 },
        { RoleID: 2, PermissionID: 10 },
        { RoleID: 2, PermissionID: 11 },
        { RoleID: 2, PermissionID: 12 },

        // HotelManager
        { RoleID: 3, PermissionID: 1 },
        { RoleID: 3, PermissionID: 2 },
        { RoleID: 3, PermissionID: 4 },
        { RoleID: 3, PermissionID: 5 },
        { RoleID: 3, PermissionID: 7 },
        { RoleID: 3, PermissionID: 8 },

        // Traveler
        { RoleID: 4, PermissionID: 7 },
        { RoleID: 4, PermissionID: 8 },
        { RoleID: 4, PermissionID: 9 },
    ];


    await RolePermission.bulkCreate(rolePermissions, {
        ignoreDuplicates: true
    });

    const adminPassword = await bcrypt.hash("admin", 10);
    const Users = [
        {
            UserID:"-1",
            UserName: "dremoxyi",
            Email: "admin@seed.local",
            Password: adminPassword,
            RoleID: 1,
        },
        {
            UserID: "-2",
            UserName: "dataoperator",
            Email: "dataoperator@seed.local",
            Password: adminPassword,
            RoleID: 2,
        },
        {
            UserID: "-3",
            UserName: "manager",
            Email: "test@seed.local",
            Password: adminPassword,
            RoleID: 3,
        },
        {
            UserID: "-4",
            UserName: "manager2",
            Email: "manager2@seed.local",
            Password: adminPassword,
            RoleID: 3,
        },
        {
            UserID: "-5",
            UserName: "traveler",
            Email: "traveler@seed.local",
            Password: adminPassword,
            RoleID: 4,
        },
        {
            UserID:"-6",
            UserName: "dremblack",
            Email: "admin@seed.local",
            Password: adminPassword,
            RoleID: 1,
        },
    ];

    await User.bulkCreate(Users, {
        ignoreDuplicates: true
    });

    return [["Users",Users.length],["Roles",roles.length],["Role-Permissions",rolePermissions.length]]
}