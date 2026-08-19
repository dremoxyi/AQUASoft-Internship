import TransactionManager from "../managers/sequelizeManager.ts";
import RolePermissionRepository from "../repositories/PermissionRepository.ts";

type PermissionMode = "Every" | "Yours";

class RolePermissionService {
	private readonly transactionManager: TransactionManager;
	private readonly Repo: RolePermissionRepository;

	constructor({ sequelizeManager, permissionRepository }: { sequelizeManager: TransactionManager; permissionRepository: RolePermissionRepository }) {
		this.transactionManager = sequelizeManager;
		this.Repo = permissionRepository;
	}

	async getPermissions() {
		const roles = await this.Repo.getRoles();
		const permissions = await this.Repo.getPermissions();
		const rolePermissions = await this.Repo.getRolePermissions();

		const permissionIdsByRole = new Map<number, Set<number>>();

		for (const row of rolePermissions) {
			const roleId = Number(row.RoleID);

			if (!permissionIdsByRole.has(roleId)) {
				permissionIdsByRole.set(roleId, new Set<number>());
			}

			permissionIdsByRole.get(roleId)!.add(Number(row.PermissionID));
		}

		const response: Record<string, any> = {};

		for (const role of roles) {
			const roleId = Number(role.RoleID);
			const ids = permissionIdsByRole.get(roleId) ?? new Set<number>();

			const hotels = roleId === 1 || ids.has(1);
			const groups = roleId === 1 || ids.has(4);
			const users = roleId === 1 || ids.has(10);

			response[role.RoleName] = {
				accessMode: roleId === 1 || (hotels && groups && users) ? "Every" : "Yours",
				hotels,
				groups,
				users,
				permissions: roleId === 1,
			};
		}

		return {
			roles: response,
			permissions,
		};
	}

	async updatePermissions(roleId: number, incoming: any) {
		return this.transactionManager.runInTransaction(async (t) => {
			const role = await this.Repo.findRoleById(roleId, t);

			if (!role) {
				throw new Error("Role not found");
			}

			const accessMode: PermissionMode = incoming.accessMode === "Yours" ? "Yours" : "Every";

			const toggles = {
				hotels: Boolean(incoming.hotels),
				groups: Boolean(incoming.groups),
				users: Boolean(incoming.users),
				permissions: Boolean(incoming.permissions),
			};

			if (roleId === 1) {
				return {
					message: "Admin permissions are always enabled",
					roleId,
					permissions: {
						hotels: true,
						groups: true,
						users: true,
						permissions: true,
					},
					roles: {
						[role.RoleName]: {
							accessMode: "Every",
							hotels: true,
							groups: true,
							users: true,
							permissions: true,
						},
					},
				};
			}

			const permissionMap: Record<string, string> = {
				hotels: "HOTEL_READ",
				groups: "HOTELGROUP_READ",
				users: "USER_READ",
				permissions: "USER_WRITE",
			};

			const permissionRows = await this.Repo.findPermissionsByNames(Object.values(permissionMap), t);

			const idsByName = new Map<string, number>();

			for (const row of permissionRows) {
				idsByName.set(row.PermissionName, Number(row.PermissionID));
			}

			for (const [key, permissionName] of Object.entries(permissionMap)) {
				const permissionId = idsByName.get(permissionName);

				if (permissionId == null) {
					continue;
				}

				if (toggles[key as keyof typeof toggles]) {
					await this.Repo.grantPermission(roleId, permissionId, t);
				} else {
					await this.Repo.revokePermission(roleId, permissionId, t);
				}
			}

			return {
				message: "Role permissions updated",
				roleId,
				permissions: toggles,
				roles: {
					[role.RoleName]: {
						accessMode,
						...toggles,
					},
				},
			};
		});
	}
}

export default RolePermissionService;