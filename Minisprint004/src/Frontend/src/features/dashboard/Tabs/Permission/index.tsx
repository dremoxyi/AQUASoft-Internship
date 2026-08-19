import { useEffect, useMemo, useState } from "react";
import { DEFAULT_ROLE_PERMISSIONS, fetchRolePermissions, TAB_DEFINITIONS, ROLE_OPTIONS, updateRolePermissions, type RoleName, type TabKey, type RolePermissionConfig, type PermissionMode } from "../../permissions";
import parentStyles from "../../Dashboard.module.css";
import styles from "./index.module.css";

type PermissionsTabProps = {
    role: RoleName;
    user: {
        id?: number;
        username?: string;
        rolename?: string;
    };
};

export default function PermissionsTab({ user }: PermissionsTabProps) {
    const [permissions, setPermissions] = useState<RolePermissionConfig>(DEFAULT_ROLE_PERMISSIONS);
    const [_loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const next = await fetchRolePermissions();
                if (active) setPermissions(next);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    const editableRoles = useMemo(() => ROLE_OPTIONS.filter((roleName) => roleName !== "Admin"), []);

    function updateRoleDraft(roleName: Exclude<RoleName, "Admin">, nextMode: PermissionMode) {
        setPermissions((current) => ({
            ...current,
            [roleName]: {
                ...(current[roleName] ?? DEFAULT_ROLE_PERMISSIONS[roleName] ?? { accessMode: "Yours" }),
                accessMode: nextMode,
            },
        }));
    }

    function handleToggle(roleName: Exclude<RoleName, "Admin">, tabKey: TabKey) {
        setPermissions((currentConfig) => {
            const current = currentConfig[roleName] ?? DEFAULT_ROLE_PERMISSIONS[roleName] ?? { accessMode: "Yours" };
            return {
                ...currentConfig,
                [roleName]: { ...current, accessMode: current.accessMode ?? "Yours", [tabKey]: !(current[tabKey] ?? false) },
            };
        });
    }

    async function handleSave() {
        setSaving(true);
        try {
            const entries = editableRoles.map((roleName) => {
                const config = permissions[roleName] ?? DEFAULT_ROLE_PERMISSIONS[roleName] ?? { accessMode: "Yours" };
                return updateRolePermissions(roleName, {
                    accessMode: config.accessMode ?? "Yours",
                    hotels: Boolean(config.hotels),
                    groups: Boolean(config.groups),
                    users: Boolean(config.users),
                    permissions: Boolean(config.permissions),
                });
            });
            await Promise.all(entries);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className={styles.panel}>
            <div className={parentStyles.sectionHeader}>
                <h2>Permissions</h2>
                <div className={parentStyles.actions}>
                    <span className={styles.badge}>Admin-only</span>
                </div>
            </div>

            <div className={styles.summaryRow}>
                <div><p className={styles.kicker}>Current admin</p><strong>{user.username ?? "Administrator"}</strong></div>
                <div><p className={styles.kicker}>Scope</p><strong>Dashboard tab access</strong></div>
            </div>

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead><tr><th>Role</th><th>Access</th>{TAB_DEFINITIONS.map((tab) => <th key={tab.key}>{tab.label}</th>)}</tr></thead>
                    <tbody>
                        <tr className={styles.adminRow}>
                            <td>Admin</td>
                            <td><span className={styles.locked}>All</span></td>
                            {TAB_DEFINITIONS.map((tab) => <td key={`${tab.key}-admin`}><span className={styles.locked}>Always</span></td>)}
                        </tr>
                        {editableRoles.map((roleName) => {
                            const current = permissions[roleName] ?? DEFAULT_ROLE_PERMISSIONS[roleName] ?? { accessMode: "Yours" };
                            return (
                                <tr key={roleName}>
                                    <td>{roleName}</td>
                                    <td>
                                        <div className={styles.accessControl} role="group" aria-label={`${roleName} access scope`}>
                                            <button
                                                type="button"
                                                className={`${styles.accessOption} ${current.accessMode === "Every" ? styles.accessOptionActive : ""}`}
                                                onClick={() => updateRoleDraft(roleName, "Every")}
                                                disabled={saving}
                                                aria-pressed={current.accessMode === "Every"}
                                            >
                                                All
                                            </button>
                                            <button
                                                type="button"
                                                className={`${styles.accessOption} ${current.accessMode === "Yours" ? styles.accessOptionActive : ""}`}
                                                onClick={() => updateRoleDraft(roleName, "Yours")}
                                                disabled={saving}
                                                aria-pressed={current.accessMode === "Yours"}
                                            >
                                                Own
                                            </button>
                                        </div>
                                    </td>
                                    {TAB_DEFINITIONS.map((tab) => (
                                        <td key={`${roleName}-${tab.key}`}>
                                            <input type="checkbox" checked={Boolean(current[tab.key])} onChange={() => handleToggle(roleName, tab.key)} disabled={saving} aria-label={`${roleName} can access ${tab.label}`} />
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className={styles.saveActions}>
                <button type="button" className={styles.saveAction} onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                </button>
            </div>
        </div>
    );
}
