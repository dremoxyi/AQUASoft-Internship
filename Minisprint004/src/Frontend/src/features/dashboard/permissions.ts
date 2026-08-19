import { apiClient } from "../../api/API-client";

export type RoleName = "Admin" | "DataOperator" | "Manager" | "Traveler";
export type TabKey = "hotels" | "groups" | "users" | "permissions";
export type PermissionMode = "Every" | "Yours";

export type TabDefinition = {
	key: TabKey;
	label: string;
};

export type RolePermissionMap = Partial<Record<TabKey, boolean>> & {
	accessMode?: PermissionMode;
};

export type RolePermissionSetting = RolePermissionMap & {
	accessMode: PermissionMode;
};

export type RolePermissionConfig = Partial<Record<RoleName, RolePermissionSetting>>;

export const ROLE_OPTIONS: RoleName[] = ["Admin", "DataOperator", "Manager", "Traveler"];

export const TAB_DEFINITIONS: TabDefinition[] = [
	{ key: "hotels", label: "Hotels" },
	{ key: "groups", label: "Hotel Groups" },
	{ key: "users", label: "Users" },
	{ key: "permissions", label: "Permissions" },
];

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionConfig = {
	Admin: {
		accessMode: "Every",
		hotels: true,
		groups: true,
		users: true,
		permissions: true,
	},
	DataOperator: {
		accessMode: "Every",
		hotels: true,
		groups: true,
		users: true,
		permissions: false,
	},
	Manager: {
		accessMode: "Yours",
		hotels: true,
		groups: true,
		users: false,
		permissions: false,
	},
	Traveler: {
		accessMode: "Yours",
		hotels: true,
		groups: false,
		users: false,
		permissions: false,
	},
};

export function applyAccessMode(mode: PermissionMode, roleName: RoleName = "Manager"): RolePermissionMap {
	const nonAdminDefaults = {
		accessMode: mode,
		hotels: true,
		groups: true,
		users: mode === "Every",
		permissions: false,
	};

	if (roleName === "Admin") {
		return {
			accessMode: "Every",
			hotels: true,
			groups: true,
			users: true,
			permissions: true,
		};
	}

	if (mode === "Yours") {
		return {
			accessMode: "Yours",
			hotels: true,
			groups: true,
			users: false,
			permissions: false,
		};
	}

	return nonAdminDefaults;
}

export function normalizeRolePermissions(input?: Record<string, any> | null): RolePermissionConfig {
	const source = input ?? {};
	const normalized: RolePermissionConfig = {};

	const roleSourceMap: Record<RoleName, string> = {
		Admin: "Administrator",
		DataOperator: "DataOperator",
		Manager: "HotelManager",
		Traveler: "Traveler",
	};

	for (const role of ROLE_OPTIONS) {
		const value = source[roleSourceMap[role]] ?? {};
		const base = role === "Admin"
			? applyAccessMode("Every", role)
			: applyAccessMode(value.accessMode === "Yours" ? "Yours" : "Every", role);

		const merged = {
			...base,
			...value,
			accessMode: value.accessMode === "Yours" ? "Yours" : "Every",
		};

		normalized[role] = {
			accessMode: merged.accessMode,
			hotels: Boolean(merged.hotels),
			groups: Boolean(merged.groups),
			users: Boolean(merged.users),
			permissions: Boolean(merged.permissions),
		};
	}

	return normalized;
}

export async function fetchRolePermissions(): Promise<RolePermissionConfig> {
	try {
		const data = (await apiClient("/role-permissions", { method: "GET" })) as { roles?: Record<string, any> };
		return normalizeRolePermissions(data.roles ?? {});
	} catch {
		return DEFAULT_ROLE_PERMISSIONS;
	}
}

export async function updateRolePermissions(roleName: RoleName, next: RolePermissionMap): Promise<RolePermissionConfig> {
	const roleIdMap: Record<RoleName, number> = {
		Admin: 1,
		DataOperator: 2,
		Manager: 3,
		Traveler: 4,
	};

	const data = (await apiClient(`/role-permissions/${roleIdMap[roleName]}`, {
		method: "PUT",
		body: JSON.stringify(next),
	})) as { roles?: Record<string, any> };

	return normalizeRolePermissions(data.roles ?? {});
}

export function canViewTab(role: RoleName, tabKey: TabKey, config: RolePermissionConfig = DEFAULT_ROLE_PERMISSIONS) {
	if (role === "Admin") {
		return true;
	}

	const permissions = config[role] ?? DEFAULT_ROLE_PERMISSIONS[role] ?? {
		accessMode: "Yours",
		hotels: false,
		groups: false,
		users: false,
		permissions: false,
	};

	return Boolean(permissions[tabKey]);
}
