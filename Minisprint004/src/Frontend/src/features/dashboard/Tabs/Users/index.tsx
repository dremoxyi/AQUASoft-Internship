import { forwardRef,useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { VirtuosoGrid, type VirtuosoGridProps } from "react-virtuoso";
import { type AuthUser, type DashboardUserRecord } from "../../../../api/auth-api";
import { createUser, deleteUser, getUsers, updateUser, type UserInput } from "../../../../api/user-api";
import type { RoleName, RolePermissionConfig } from "../../permissions";
import parentStyles from "../../Dashboard.module.css";
import styles from "./index.module.css";

type Props = {
	role: RoleName;
	user: AuthUser;
	rolePermissions: RolePermissionConfig;
};

type UserFormState = {
	UserName: string;
	Email: string;
	Password: string;
	RoleID: string;
};

const ROLE_OPTIONS = [
	{ value: "1", label: "Admin", rank: 4 },
	{ value: "2", label: "Data Operator", rank: 3 },
	{ value: "3", label: "Manager", rank: 2 },
	{ value: "4", label: "Traveler", rank: 1 },
];

const ROLE_RANK: Record<RoleName, number> = {
	Admin: 4,
	DataOperator: 3,
	Manager: 2,
	Traveler: 1,
};

function getRoleRank(record: DashboardUserRecord) {
	const roleName = record.Role?.RoleName;
	if (roleName === "Administrator" || roleName === "Admin") {
		return 4;
	}
	if (roleName === "DataOperator" || roleName === "Data Operator") {
		return 3;
	}
	if (roleName === "HotelManager" || roleName === "Manager") {
		return 2;
	}
	if (roleName === "Traveler") {
		return 1;
	}
	return ROLE_OPTIONS.find(
		(option) => option.value === String(record.RoleID)
	)?.rank ?? 0;
}

function getRoleRankFromRoleName(role: RoleName) {
	return ROLE_RANK[role] ?? 0;
}

const EMPTY_FORM: UserFormState = {
	UserName: "",
	Email: "",
	Password: "",
	RoleID: "4",
};

function roleLabel(record: DashboardUserRecord) {
	return record.Role?.RoleName ?? ROLE_OPTIONS.find((option) => option.value === String(record.RoleID))?.label ?? `Role ${record.RoleID ?? "?"}`;
}

const GridList = forwardRef<HTMLDivElement,React.ComponentPropsWithoutRef<"div">>(({ style, children, ...props }, ref) => (
	<div
		{...props}
		ref={ref}
		style={{
			...style,
			display: "flex",
			flexWrap: "wrap",
			alignContent: "flex-start",
		}}
	>
		{children}
	</div>
));

const GridItem = ({children,style,...props}: React.ComponentPropsWithoutRef<"div">) => (
	<div
		{...props}
		style={{
			...style,
			width: "33.333333%",
			display: "flex",
			flex: "none",
			boxSizing: "border-box",
			padding: "0.5rem",
		}}
	>
		{children}
	</div>
);

const gridComponents: VirtuosoGridProps<DashboardUserRecord>["components"] = {
	List: GridList,
	Item: GridItem,
};

export default function UsersTab({ role, user, rolePermissions }: Props) {
	const editFormRef = useRef<HTMLFormElement | null>(null);
	const [users, setUsers] = useState<DashboardUserRecord[]>([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [mode, setMode] = useState<"view" | "create" | "edit">("view");
	const [editingId, setEditingId] = useState<number | null>(null);
	const [form, setForm] = useState<UserFormState>(EMPTY_FORM);

	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				setLoading(true);
				const data = await getUsers();
				if (mounted) {
					setUsers(Array.isArray(data) ? data : []);
				}
			} catch (err) {
				if (mounted) {
					setError(err instanceof Error ? err.message : "Unable to load users");
				}
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);

	const currentUserRank = getRoleRankFromRoleName(role);
	const rolePermission = rolePermissions[role];

	const canViewUsersTab =
		role === "Admin" || Boolean(rolePermission?.users);

	const canEditUsers =
		canViewUsersTab &&
		(role === "Admin" || rolePermission?.accessMode === "Every");

	const canCreateUsers = canEditUsers && currentUserRank > 1;
	const visibleUsers = useMemo(() => {
		if (!canViewUsersTab) {
			return [];
		}

		if (rolePermission?.accessMode === "Yours") {
			return users.filter((record) => record.UserID === user.id);
		}

		return users;
	}, [users,user.id,rolePermission?.accessMode,canViewUsersTab,]);

	const filteredUsers = useMemo(() => {
		const query = search.trim().toLowerCase();

		if (!query) {
			return visibleUsers;
		}

		return visibleUsers.filter((user) => {
			const userId = String(user.UserID);
			const userName = user.UserName?.toLowerCase() ?? "";
			const email = user.Email?.toLowerCase() ?? "";
			const roleId = user.RoleID != null ? String(user.RoleID) : "";
			const roleName = user.Role?.RoleName?.toLowerCase() ?? "";

			return (
				userId.includes(query) ||
				userName.includes(query) ||
				email.includes(query) ||
				roleId.includes(query) ||
				roleName.includes(query)
			);
		});
	}, [visibleUsers, search]);

	function canManageUser(record: DashboardUserRecord) {
		return (
			canEditUsers &&
			(record.UserID === user.id || currentUserRank > getRoleRank(record))
		);
	}

	function canChangePassword(record: DashboardUserRecord) {
		return (
			canManageUser(record) &&
			currentUserRank >= 3
		);
	}

	function resetForm() {
		setForm(EMPTY_FORM);
		setEditingId(null);
	}

	function openCreate() {
		if (!canCreateUsers) {
			return;
		}

		resetForm();
		setMode("create");
	}

	function openEdit(record: DashboardUserRecord) {
		if (!canManageUser(record)) {
			return;
		}

		setEditingId(record.UserID);
		setForm({
			UserName: record.UserName ?? "",
			Email: record.Email ?? "",
			Password: "",
			RoleID: String(record.RoleID ?? 4),
		});
		setMode("edit");

		requestAnimationFrame(() => {
			const element = editFormRef.current;
			if (!element) {
				return;
			}
			const y = element.getBoundingClientRect().top + window.scrollY - 50;
			window.scrollTo({
				top: y,
				behavior: "smooth",
			});
		});
	}

	function handleChange(field: keyof UserFormState, value: string) {
		setForm((current) => ({
			...current,
			[field]: value,
		}));
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		const targetUser =
			mode === "edit" && editingId != null
				? users.find((record) => record.UserID === editingId)
				: null;

		if (mode === "edit") {
			if (!targetUser || !canManageUser(targetUser)) {
				setError("You do not have permission to manage this user.");
				return;
			}
		}

		const newRoleRank =
			ROLE_OPTIONS.find((option) => option.value === form.RoleID)?.rank ?? 0;

		if (newRoleRank >= currentUserRank) {
			setError("You cannot assign a role equal to or higher than your own.");
			return;
		}

		const payload: UserInput = {
			UserName: form.UserName.trim(),
			Email: form.Email.trim(),
			RoleID: Number(form.RoleID),
			Password: form.Password.trim() || undefined,
		};

		if (!payload.UserName || !payload.Email || Number.isNaN(payload.RoleID)) {
			setError("Username, email, and role are required.");
			return;
		}

		if (mode === "create" && !payload.Password) {
			setError("Password is required when creating a user.");
			return;
		}

		if (mode === "edit" && targetUser && form.Password.trim()) {
			if (!canChangePassword(targetUser)) {
				setError("You do not have permission to change this user's password.");
				return;
			}
		}

		try {
			setSaving(true);

			if (mode === "edit" && editingId != null) {
				await updateUser(editingId, payload);
			} else {
				await createUser(payload);
			}

			const refreshed = await getUsers();

			setUsers(Array.isArray(refreshed) ? refreshed : []);
			resetForm();
			setMode("view");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to save user");
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete(record: DashboardUserRecord) {
		if (!canManageUser(record)) {
			setError("You do not have permission to delete this user.");
			return;
		}

		const confirmed = window.confirm(
			`Delete ${record.UserName ?? `user #${record.UserID}`}?`
		);
		if (!confirmed) return;

		try {
			setSaving(true);
			await deleteUser(record.UserID);
			const refreshed = await getUsers();
			setUsers(Array.isArray(refreshed) ? refreshed : []);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to delete user");
		} finally {
			setSaving(false);
		}
	}

	const targetUser =
	mode === "edit" && editingId != null
		? users.find((record) => record.UserID === editingId) ?? null
		: null;
		
	return (
		<div className={styles.panel}>
			<div className={parentStyles.sectionHeader}>
				<h2>Users</h2>
				<div className={parentStyles.actions}>
					{canCreateUsers && (
						<button type="button" onClick={openCreate} disabled={saving}>
							Create User
						</button>
					)}

					<button
						type="button"
						onClick={() => {
							resetForm();
							setMode("view");
						}}
						disabled={saving}
					>
						View Users
					</button>
				</div>
			</div>
			<div className={styles.summaryRow}>
				<div>
					<p className={styles.kicker}>Total users</p>
					<strong>{visibleUsers.length}</strong>
				</div>

				<div>
					<p className={styles.kicker}>Signed in as</p>
					<strong>{user.username ?? ""}</strong>
				</div>
			</div>

			{mode !== "view" && canEditUsers && (
				<form ref={editFormRef} className={styles.form} onSubmit={handleSubmit}>
					<div className={styles.formHead}>
						<div>
							<p className={styles.kicker}>{mode === "edit" ? "Edit user" : "Create user"}</p>
							<h3>{editingId ? `User #${editingId}` : "New user record"}</h3>
						</div>

						<button type="button" className={styles.ghostButton} onClick={() => { resetForm(); setMode("view"); }}>
							Cancel
						</button>
					</div>

					<div className={styles.formGrid}>
						<label>
							<span>Username</span>
							<input value={form.UserName} onChange={(e) => handleChange("UserName", e.target.value)} />
						</label>
						<label>
							<span>Email</span>
							<input type="email" value={form.Email} onChange={(e) => handleChange("Email", e.target.value)} />
						</label>
						{(mode === "create" || (targetUser && canChangePassword(targetUser))) && (
							<label>
								<span>
									Password{mode === "edit" ? " (leave blank to keep)" : ""}
								</span>

								<input
									type="password"
									value={form.Password}
									onChange={(e) => handleChange("Password", e.target.value)}
								/>
							</label>
						)}
						<label>
							<span>Role</span>
							<select value={form.RoleID} onChange={(e) => handleChange("RoleID", e.target.value)}>
								{ROLE_OPTIONS
									.filter((option) => option.rank < currentUserRank)
									.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
							</select>
						</label>
					</div>

					{error && <p className={styles.error}>{error}</p>}
					<div className={styles.formActions}>
						<button type="submit" disabled={saving}>
							{saving
								? mode === "edit"
									? "Saving Changes..."
									: "Creating User..."
								: mode === "edit"
									? "Save Changes"
									: "Create User"}
						</button>
					</div>
				</form>
			)}

			<section className={styles.listArea}>
				<div className={styles.listHead}>
					<h3>{mode === "view" ? "User list" : "Manage users"}</h3>
					<p>
						{role === "Admin"
							? "Admins can manage Data Operators, Managers, and Travelers."
							: canEditUsers
								? "You can manage users below your role."
								: "You can view users according to your permissions."}
					</p>
				</div>

				{loading ? (
					<div className={styles.emptyState}>Loading users...</div>
				) : error ? (
					<div className={styles.emptyState}>{error}</div>
				) : visibleUsers.length === 0 ? (
					<div className={styles.emptyState}>No users available.</div>
				) : (
					<>
						<div className={styles.searchBar}>
							<input
								type="search"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
								placeholder="Search users..."
								aria-label="Search users"
							/>
						</div>
						<VirtuosoGrid
							data={filteredUsers}
							className={styles.cards}
							components={gridComponents}
							computeItemKey={(_, record) => record.UserID}
							itemContent={(_, record) => (
								<article className={styles.card}>
									<div className={styles.cardTop}>
										<div>
											<p className={styles.kicker}>User #{record.UserID}</p>
											<h4>{record.UserName}</h4>
										</div>

										<div className={styles.rolePill}>
											{roleLabel(record)}
										</div>
									</div>

									<p className={styles.location}>{record.Email}</p>

									<div className={styles.metaGrid}>
										<span>{record.Role?.RoleName ?? "Unknown role"}</span>
									</div>
									<div className={styles.cardActions}>
										{canManageUser(record) ? (
											<>
												<button
													type="button"
													onClick={() => openEdit(record)}
													disabled={saving}
												>
													Edit
												</button>

												<button
													type="button"
													className={styles.dangerButton}
													onClick={() => handleDelete(record)}
													disabled={saving}
												>
													{saving ? "Working..." : "Delete"}
												</button>
											</>
										) : (
											<button type="button" disabled>
												Locked
											</button>
										)}
									</div>
								</article>
							)}
						/>
					</>
				)}
			</section>
		</div>
	);
}