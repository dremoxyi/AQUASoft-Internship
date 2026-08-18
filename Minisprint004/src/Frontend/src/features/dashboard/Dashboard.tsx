import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { whoami } from "../../api/auth-api";
import { Paths, authPaths } from "../../routes";
import { canViewTab, DEFAULT_ROLE_PERMISSIONS, fetchRolePermissions, TAB_DEFINITIONS, type RoleName, type TabKey, type RolePermissionConfig } from "./permissions";
import GroupsTab from "./Tabs/Groups";
import HotelsTab from "./Tabs/Hotels";
import PermissionTab from "./Tabs/Permission";
import UsersTab from "./Tabs/Users";
import styles from "./Dashboard.module.css";

type DashboardUser = {
	id?: number;
	username?: string;
	rolename?: string;
};

function toAllowedRole(role?: string): RoleName | null {
	if (
		role === "Admin" ||
		role === "DataOperator" ||
		role === "Manager" ||
		role === "Traveler"
	) {
		return role as RoleName;
	}

	return null;
}

export default function Dashboard() {
	const navigate = useNavigate();

	const [loading, setLoading] = useState(true);
	const [role, setRole] = useState<RoleName | null>(null);
	const [user, setUser] = useState<DashboardUser | null>(null);
	const [rolePermissions, setRolePermissions] = useState<RolePermissionConfig>(DEFAULT_ROLE_PERMISSIONS);

	const [activeTab, setActiveTab] =
		useState<TabKey>("hotels");

	useEffect(() => {
		async function checkSession() {
			try {
				const me = (await whoami()) as DashboardUser | null;

				if (!me) {
					navigate(authPaths.login);
					return;
				}

				const allowed = toAllowedRole(me.rolename);

				if (!allowed) {
					navigate(Paths.homepage);
					return;
				}

				setRole(allowed);
				setUser(me);

				const permissions = await fetchRolePermissions();
				setRolePermissions(permissions);
			} catch {
				navigate(authPaths.login);
			} finally {
				setLoading(false);
			}
		}

		checkSession();
	}, [navigate]);

	useEffect(() => {
		const handleAuthExpired = () => {
			setUser(null);
			setRole(null);
			navigate(authPaths.login);
		};

		window.addEventListener(
			"auth-expired",
			handleAuthExpired
		);

		return () => {
			window.removeEventListener(
				"auth-expired",
				handleAuthExpired
			);
		};
	}, [navigate]);

	const tabs = useMemo(
		() => (role ? TAB_DEFINITIONS.filter((tab) => canViewTab(role, tab.key, rolePermissions)) : []),
		[role, rolePermissions]
	);

	useEffect(() => {
		if (tabs.length > 0 && !tabs.some((tab) => tab.key === activeTab)) {
			setActiveTab(tabs[0].key);
		}
	}, [activeTab, tabs]);

	if (loading) {
		return (
			<main className={styles.loading}>
				Loading...
			</main>
		);
	}

	if (!user || !role)
		return null;

	if (tabs.length === 0) {
		return (
			<main className={styles.page}>
				<header className={styles.header}>
					<div>
						<h1>Dashboard</h1>

						<p>
							Signed in as{" "}
							<strong>{user.username}</strong>
						</p>
					</div>
				</header>

				<section className={styles.content}>
					<div className={styles.noAccess}>
						<h2>No dashboard access</h2>

						<p>
							You currently don't have access to any dashboard
							sections. Please contact an Admin or Data Operator
							if you need access.
						</p>

						<Link
							to={Paths.homepage}
							className={styles.homeButtonLarge}
						>
							← Back to Home
						</Link>
					</div>
				</section>
			</main>
		);
	}

	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<div>
					<h1>Dashboard</h1>

					<p>
						Signed in as{" "}
						<strong>
							{user.username}
						</strong>
					</p>
				</div>

				<Link
					to={Paths.homepage}
					className={
						styles.homeButton
					}
				>
					← Home
				</Link>
			</header>

			<nav className={styles.navigation}>
				{tabs.map((tab) => (
					<button
						key={tab.key}
						onClick={() =>
							setActiveTab(tab.key)
						}
						className={`${styles.navButton} ${
							activeTab === tab.key
								? styles.active
								: ""
						}`}
					>
						{tab.label}
					</button>
				))}
			</nav>

			<section className={styles.content}>
				{renderTab(activeTab, role, user, rolePermissions)}
			</section>
		</main>
	);
}

function renderTab(tab: TabKey, role: RoleName, user: DashboardUser, rolePermissions: RolePermissionConfig) {
	switch (tab) {
		case "hotels":
			return <HotelsTab role={role} user={user} rolePermissions={rolePermissions}/>;

		case "groups":
			return <GroupsTab role={role} user={user} rolePermissions={rolePermissions}/>;

		case "users":
			return <UsersTab role={role} user={user} rolePermissions={rolePermissions}/>;

		case "permissions":
			return <PermissionTab role={role} user={user} />;
	}
}