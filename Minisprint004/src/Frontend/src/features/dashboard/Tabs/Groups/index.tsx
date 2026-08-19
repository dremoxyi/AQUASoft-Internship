import { forwardRef, useEffect, useMemo, useState, useRef, type FormEvent } from "react";
import { VirtuosoGrid, type VirtuosoGridProps } from "react-virtuoso";
import { type AuthUser, type DashboardHotelGroupRecord } from "../../../../api/auth-api";
import {
	addHotelGroupUser,
	createHotelGroup,
	deleteHotelGroup,
	getHotelGroups,
	removeHotelGroupUser,
	sendHotelGroupInvitations,
	updateHotelGroup,
	updateHotelGroupUserRole,
	type GroupInvitationResult,
	type GroupManagerRole,
	type GroupMemberInput,
	type HotelGroupInput,
} from "../../../../api/hotel-group-api";
import type { RoleName, RolePermissionConfig } from "../../permissions";
import parentStyles from "../../Dashboard.module.css";
import styles from "./index.module.css";

type Props = {
	role: RoleName;
	user: AuthUser;
	rolePermissions: RolePermissionConfig;
};	

type GroupFormState = {
	GroupName: string;
};

type MemberFormState = {
	UserName: string;
	ManagerRole: GroupManagerRole;
};

type GroupMember = NonNullable<DashboardHotelGroupRecord["Users"]>[number] & {
	HotelGroupManagers?: {
		ManagerRole?: string;
		MembershipStatus?: "PENDING" | "ACTIVE";
		InviteTokenExpiresAt?: string;
		ActivatedAt?: string;
	};
	MembershipStatus?: "PENDING" | "ACTIVE";
	InviteToken?: string;
	InviteTokenExpiresAt?: string;
	ActivatedAt?: string;
	ManagerRole?: string;
};

type InvitePreview = {
	userId: number;
	userName: string | undefined;
	email: string | undefined;
	token: string;
	link: string;
};

const EMPTY_FORM: GroupFormState = {
	GroupName: "",
};

const EMPTY_MEMBER_FORM: MemberFormState = {
	UserName: "",
	ManagerRole: "MANAGER",
};

const MANAGER_ROLE_OPTIONS: GroupManagerRole[] = ["MAIN", "MANAGER"];

function getMemberRole(member: GroupMember) {
	return member.HotelGroupManagers?.ManagerRole ?? member.ManagerRole ?? "MANAGER";
}

function getMemberStatus(member: GroupMember) {
	return member.HotelGroupManagers?.MembershipStatus ?? member.MembershipStatus ?? "PENDING";
}

function isActiveMember(member: GroupMember) {
	return getMemberStatus(member) === "ACTIVE";
}

function getActorGroupRole(group: DashboardHotelGroupRecord | undefined, actorId?: number) {
	if (!group || actorId == null) return null;

	const member = (group.Users ?? []).find((entry) => Number(entry.UserID) === actorId) as GroupMember | undefined;
	if (!member || !isActiveMember(member)) return null;

	return member?.HotelGroupManagers?.ManagerRole ?? member?.ManagerRole ?? null;
}

function canEditGroup(role: RoleName, groupRole: string | null, rolePermissions: RolePermissionConfig) {
	return role === "Admin" || groupRole === "OWNER" || rolePermissions[role]?.accessMode === "Every";
}

function canManageMembers(role: RoleName, groupRole: string | null, rolePermissions: RolePermissionConfig) {
	return role === "Admin" || groupRole === "OWNER" || groupRole === "MAIN" || rolePermissions[role]?.accessMode === "Every";
}

function canEditMemberPerms(role: RoleName, groupRole: string | null, rolePermissions: RolePermissionConfig) {
	return role === "Admin" || groupRole === "OWNER" || rolePermissions[role]?.accessMode === "Every";
}

const GridList = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({ style, children, ...props }, ref) => (
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

const GridItem = ({children, style, ...props}: React.ComponentPropsWithoutRef<"div">) => (
	<div
		{...props}
		style={{
			...style,
			width: "33.333333%",
			display:"flex",
			flex: "none",
			boxSizing: "border-box",
			padding: "0.5rem",
		}}	
	>
		{children}
	</div>
)

const gridComponents: VirtuosoGridProps<DashboardHotelGroupRecord>["components"] = {
	List: GridList,
	Item: GridItem,
};

export default function GroupsTab({ role, user, rolePermissions }: Props) {
	const editFormRef = useRef<HTMLFormElement | null>(null);
	const viewPanelRef = useRef<HTMLElement | null>(null);

	const [groups, setGroups] = useState<DashboardHotelGroupRecord[]>([]);
	const [search,setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [listError, setListError] = useState<string | null>(null);
	const [mode, setMode] = useState<"view" | "create" | "edit">("view");
	const [editingId, setEditingId] = useState<number | null>(null);
	const [form, setForm] = useState<GroupFormState>(EMPTY_FORM);
	const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
	const [memberForm, setMemberForm] = useState<MemberFormState>(EMPTY_MEMBER_FORM);
	const [memberActionBusy, setMemberActionBusy] = useState(false);
	const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
	const [invitePreviews, setInvitePreviews] = useState<InvitePreview[]>([]);

	const userId = user.id != null ? Number(user.id) : undefined;

	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				setLoading(true);
				setListError(null);

				const data = await getHotelGroups();
				if (mounted) {
					setGroups(Array.isArray(data) ? data : []);
				}
			} catch (err) {
				if (mounted) {
					setListError(err instanceof Error ? err.message : "Unable to load hotel groups");
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

	const visibleGroups = useMemo(() => {
		if (role === "Admin" || rolePermissions[role]?.accessMode === "Every") {
			return groups;
		}

		if (!userId) {
			return [];
		}

		return groups.filter((group) =>
			(group.Users ?? []).some((member) => {
				const groupMember = member as GroupMember;
				return Number(member.UserID) === userId && isActiveMember(groupMember);
			})
		);
	}, [groups, role, rolePermissions,userId]);

	const filteredGroups = useMemo(() => {
		const query = search.trim().toLowerCase();

		if (!query) {
			return visibleGroups;
		}

		return visibleGroups.filter((group) => {
			const groupName = group.GroupName?.toLowerCase() ?? "";
			const groupId = String(group.HGroupId);

			const memberNames = (group.Users ?? [])
				.map((member) => member.UserName?.toLowerCase() ?? "")
				.join(" ");

			const memberEmails = (group.Users ?? [])
				.map((member) => member.Email?.toLowerCase() ?? "")
				.join(" ");

			const hotelNames = (group.Hotels ?? [])
				.map((hotel) => hotel.HotelName?.toLowerCase() ?? "")
				.join(" ");

			return (
				groupName.includes(query) ||
				groupId.includes(query) ||
				memberNames.includes(query) ||
				memberEmails.includes(query) ||
				hotelNames.includes(query)
			);
		});
	}, [visibleGroups, search]);

	const selectedGroup = useMemo(
		() => visibleGroups.find((group) => group.HGroupId === selectedGroupId) ?? null,
		[visibleGroups, selectedGroupId],
	);

	const selectedGroupRole = getActorGroupRole(selectedGroup ?? undefined, userId);
	const selectedCanManageMembers = canManageMembers(role, selectedGroupRole, rolePermissions);
	const selectedCanEditPerms = canEditMemberPerms(role, selectedGroupRole, rolePermissions);
	const selectedPendingMembers = useMemo(
		() => (selectedGroup?.Users ?? []).filter((member) => !isActiveMember(member as GroupMember)) as GroupMember[],
		[selectedGroup],
	);

	function resetForm() {
		setForm(EMPTY_FORM);
		setEditingId(null);
	}

	function openCreate() {
		resetForm();
		setMode("create");
		setSelectedGroupId(null);
		setError(null);
	}

	function openEdit(group: DashboardHotelGroupRecord) {
		setEditingId(group.HGroupId);
		setForm({
			GroupName: group.GroupName ?? "",
		});

		setSelectedGroupId(null);
		setMemberForm(EMPTY_MEMBER_FORM);
		setSelectedMemberIds([]);
		setInvitePreviews([]);

		setMode("edit");
		setError(null);

		requestAnimationFrame(() => {
			const element = editFormRef.current;
			if (!element) return;
			const y = element.getBoundingClientRect().top + window.scrollY - 20;
			window.scrollTo({
				top: y,
				behavior: "smooth",
			});
		});
	}


	function openView(group: DashboardHotelGroupRecord) {
		setEditingId(null);
		setForm(EMPTY_FORM);

		setSelectedGroupId(group.HGroupId);
		setMode("view");
		setError(null);
		setMemberForm(EMPTY_MEMBER_FORM);
		setSelectedMemberIds([]);
		setInvitePreviews([]);

		requestAnimationFrame(() => {
			const element = viewPanelRef.current;

			if (!element) return;

			const y = element.getBoundingClientRect().top + window.scrollY - 20;

			window.scrollTo({
				top: y,
				behavior: "smooth",
			});
		});
	}

	function handleChange(value: string) {
		setForm({ GroupName: value });
	}

	function handleMemberFormChange(field: keyof MemberFormState, value: string) {
		setMemberForm((current) => ({
			...current,
			[field]: value,
		}));
	}

	async function refreshGroups(nextSelectedId?: number | null) {
		const refreshed = await getHotelGroups();
		const nextGroups = Array.isArray(refreshed) ? refreshed : [];
		setGroups(nextGroups);

		const candidateSelectedId = nextSelectedId ?? selectedGroupId;
		if (candidateSelectedId != null && !nextGroups.some((group) => group.HGroupId === candidateSelectedId)) {
			setSelectedGroupId(null);
			setSelectedMemberIds([]);
			setInvitePreviews([]);
		}
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		const payload: HotelGroupInput = {
			GroupName: form.GroupName.trim(),
		};

		if (!payload.GroupName) {
			setError("Group name is required.");
			return;
		}

		try {
			setSaving(true);
			if (mode === "edit" && editingId != null) {
				await updateHotelGroup(editingId, payload);
			} else {
				await createHotelGroup(payload);
			}

			await refreshGroups();
			resetForm();
			setMode("view");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to save hotel group");
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete(group: DashboardHotelGroupRecord) {
		const confirmed = window.confirm(`Delete ${group.GroupName ?? `group #${group.HGroupId}`}?`);
		if (!confirmed) return;

		try {
			setSaving(true);
			await deleteHotelGroup(group.HGroupId);
			await refreshGroups(selectedGroupId === group.HGroupId ? null : selectedGroupId);
			if (selectedGroupId === group.HGroupId) {
				setSelectedGroupId(null);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to delete hotel group");
		} finally {
			setSaving(false);
		}
	}

	async function handleAddMember(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!selectedGroup || !selectedCanManageMembers) return;

		setError(null);

		const userName = memberForm.UserName.trim();
		if (!userName) {
			setError("Username is required.");
			return;
		}

		const payload: GroupMemberInput = {
			UserName: userName,
			ManagerRole: selectedCanEditPerms ? memberForm.ManagerRole : "MANAGER",
		};

		try {
			setMemberActionBusy(true);
			await addHotelGroupUser(selectedGroup.HGroupId, payload);
			setMemberForm(EMPTY_MEMBER_FORM);
			setSelectedMemberIds([]);
			setInvitePreviews([]);
			await refreshGroups(selectedGroup.HGroupId);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to add user to group");
		} finally {
			setMemberActionBusy(false);
		}
	}

	function toggleSelectedMember(memberId: number, checked: boolean) {
		setSelectedMemberIds((current) => {
			if (checked) {
				return current.includes(memberId) ? current : [...current, memberId];
			}

			return current.filter((value) => value !== memberId);
		});
	}

	function copyInviteLink(link: string) {
		void navigator.clipboard?.writeText(link);
	}

	async function handleSendMagicLinks() {
		if (!selectedGroup || !selectedCanManageMembers || selectedMemberIds.length === 0) return;

		setError(null);

		try {
			setMemberActionBusy(true);
			const invited = (await sendHotelGroupInvitations(selectedGroup.HGroupId, {
				UserIDs: selectedMemberIds,
			})) as GroupInvitationResult[];

			const previews = invited
				.map((member) => {
					const token = member.InviteToken;

					if (!token || !member.UserID) {
						return null;
					}

					return {
						userId: member.UserID,
						userName: member.UserName,
						email: member.Email,
						token,
						link: `${window.location.origin}/group-invite?token=${encodeURIComponent(token)}`,
					};
				})
				.filter((value): value is InvitePreview => value !== null);

			setInvitePreviews(previews);
			setSelectedMemberIds([]);
			await refreshGroups(selectedGroup.HGroupId);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to send magic links");
		} finally {
			setMemberActionBusy(false);
		}
	}

	async function handleUpdateMemberRole(member: GroupMember, roleValue: GroupManagerRole) {
		if (!selectedGroup || !selectedCanEditPerms) return;

		try {
			setMemberActionBusy(true);
			await updateHotelGroupUserRole(selectedGroup.HGroupId, Number(member.UserID), {
				UserID: Number(member.UserID),
				ManagerRole: roleValue,
			});
			await refreshGroups(selectedGroup.HGroupId);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to update user role");
		} finally {
			setMemberActionBusy(false);
		}
	}

	async function handleRemoveMember(member: GroupMember) {
		if (!selectedGroup || !selectedCanManageMembers) return;

		const confirmed = window.confirm(`Remove ${member.UserName ?? `user #${member.UserID}`} from the group?`);
		if (!confirmed) return;

		try {
			setMemberActionBusy(true);
			await removeHotelGroupUser(selectedGroup.HGroupId, Number(member.UserID));
			await refreshGroups(selectedGroup.HGroupId);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unable to remove user from group");
		} finally {
			setMemberActionBusy(false);
		}
	}

	return (
		<div className={styles.panel}>
			<div className={parentStyles.sectionHeader}>
				<h2>Hotel Groups</h2>

				<div className={parentStyles.actions}>
					<button type="button" onClick={openCreate}>
						Create Group
					</button>

					<button type="button" onClick={() => setMode("view")}>
						View Groups
					</button>
				</div>
			</div>

			<div className={styles.summaryRow}>
				<div>
					<p className={styles.kicker}>Visible groups</p>
					<strong>{visibleGroups.length}</strong>
				</div>

				<div>
					<p className={styles.kicker}>Role</p>
					<strong>{role}</strong>
				</div>
			</div>

			{mode !== "view" && (
				<form ref={editFormRef} className={styles.form} onSubmit={handleSubmit}>
					<div className={styles.formHead}>
						<div>
							<p className={styles.kicker}>{mode === "edit" ? "Edit group" : "Create group"}</p>
							<h3>{editingId ? `Group #${editingId}` : "New hotel group"}</h3>
						</div>
					</div>

					<div className={styles.formGrid}>
						<label>
							<span>Group name</span>
							<input value={form.GroupName} onChange={(e) => handleChange(e.target.value)} />
						</label>
					</div>

					{error && <p className={styles.error}>{error}</p>}

					<div className={styles.formActions}>
						<button
							type="button"
							className={styles.cancelButton}
							onClick={() => {
								resetForm();
								setMode("view");
							}}
						>
							Cancel
						</button>

						<button type="submit" disabled={saving}>
							{saving ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Group"}
						</button>
					</div>
				</form>
			)}

			{selectedGroup && (
				<section ref={viewPanelRef} className={styles.memberPanel}>
					<div className={styles.memberPanelHead}>
						<div>
							<p className={styles.kicker}>Group members</p>
							<h3>{selectedGroup.GroupName}</h3>
						</div>
						<div className={styles.memberPanelBadge}>
							Your role: {selectedGroupRole ?? "None"}
						</div>
					</div>

					{selectedCanManageMembers ? (
						<form className={styles.memberForm} onSubmit={handleAddMember}>
							<div className={styles.memberFormGrid}>
								<label>
									<span>Username</span>
									<input
										type="text"
										value={memberForm.UserName}
										onChange={(e) => handleMemberFormChange("UserName", e.target.value)}
									/>
								</label>

								<label>
									<span>Group role</span>
									<select
										value={memberForm.ManagerRole}
										onChange={(e) => handleMemberFormChange("ManagerRole", e.target.value as GroupManagerRole)}
										disabled={!selectedCanEditPerms}
									>
										{MANAGER_ROLE_OPTIONS.map((option) => (
											<option key={option} value={option}>
												{option}
											</option>
										))}
									</select>
								</label>
							</div>

							<div className={styles.memberFormActions}>
								<button type="submit" disabled={memberActionBusy}>
									{memberActionBusy ? "Saving..." : "Add pending member"}
								</button>
							</div>
						</form>
					) : (
						<div className={styles.emptyState}>
							Managers with the MANAGER role cannot edit this group.
						</div>
					)}

					<div className={styles.memberListActions}>
						<div className={styles.memberCountPill}>
							{selectedMemberIds.length} selected from {selectedPendingMembers.length} pending members
						</div>

						<button
							type="button"
							className={styles.sendLinksButton}
							onClick={handleSendMagicLinks}
							disabled={!selectedCanManageMembers || selectedMemberIds.length === 0 || memberActionBusy}
						>
							{memberActionBusy ? "Sending..." : "Send magic links"}
						</button>
					</div>

					{invitePreviews.length > 0 && (
						<div className={styles.invitePanel}>
							<div className={styles.invitePanelHead}>
								<div>
									<p className={styles.kicker}>Magic links ready</p>
									<h4>Copy and share these activation links</h4>
								</div>
							</div>

							<div className={styles.inviteList}>
								{invitePreviews.map((invite) => (
									<div key={`${invite.userId}-${invite.token}`} className={styles.inviteRow}>
										<div>
											<p className={styles.kicker}>User #{invite.userId}</p>
											<strong>{invite.userName ?? invite.email ?? `User ${invite.userId}`}</strong>
											<p className={styles.inviteLink}>{invite.link}</p>
										</div>
										<div className={styles.inviteActions}>
											<button type="button" className={styles.viewButton} onClick={() => copyInviteLink(invite.link)}>
												Copy link
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					<div className={styles.memberList}>
						{(selectedGroup.Users ?? []).map((member) => {
							const groupMember = member as GroupMember;
							const memberRole = getMemberRole(groupMember);
							const memberStatus = getMemberStatus(groupMember);
							const canEditMember = selectedCanEditPerms && memberRole !== "OWNER";
							const canRemoveMember = selectedCanManageMembers && memberRole !== "OWNER";
							const canSelectForInvite = selectedCanManageMembers && memberStatus !== "ACTIVE";

							return (
								<article key={member.UserID} className={styles.memberCard}>
									<div className={styles.memberCardTop}>
										<div>
											<p className={styles.kicker}>User #{member.UserID}</p>
											<h4>{member.UserName}</h4>
											<p className={styles.memberEmail}>{member.Email}</p>
										</div>

										{canSelectForInvite && (
											<label className={styles.memberSelectLabel}>
												<input
													type="checkbox"
													checked={selectedMemberIds.includes(Number(member.UserID))}
													onChange={(e) => toggleSelectedMember(Number(member.UserID), e.target.checked)}
												/>
												<span>Select</span>
											</label>
										)}
									</div>

									<div className={styles.memberRoleRow}>
										<div className={styles.memberStatusGroup}>
											<span className={styles.memberRoleTag}>{memberRole}</span>
											<span className={styles.memberStatusTag}>{memberStatus}</span>
										</div>
										{canEditMember ? (
											<select
												value={memberRole}
												onChange={(e) => handleUpdateMemberRole(groupMember, e.target.value as GroupManagerRole)}
												disabled={memberActionBusy}
											>
												{MANAGER_ROLE_OPTIONS.map((option) => (
													<option key={option} value={option}>
														{option}
													</option>
												))}
											</select>
										) : null}
									</div>

									<div className={styles.memberActions}>
										{canRemoveMember && (
											<button type="button" className={styles.dangerButton} onClick={() => handleRemoveMember(groupMember)} disabled={memberActionBusy}>
												Delete
											</button>
										)}
									</div>
								</article>
							);
						})}
					</div>

					<div className={styles.formActions}>
						<button
							type="button"
							className={styles.cancelButton}
							onClick={() => {
								setSelectedGroupId(null);
								setSelectedMemberIds([]);
								setInvitePreviews([]);
								setMemberForm(EMPTY_MEMBER_FORM);
							}}
						>
							Cancel
						</button>
					</div>
				</section>
			)}

			<section className={styles.listArea}>
				<div className={styles.listHead}>
					<h3>{mode === "view" ? "Group list" : "Manage groups"}</h3>
					<p>
						{role === "Admin"
							? "Admins can inspect and edit all hotel groups."
							: "Managers can only see groups they belong to."}
					</p>
				</div>

				{loading ? (
					<div className={styles.emptyState}>Loading groups...</div>
				) : listError ? (
					<div className={styles.emptyState}>{listError}</div>
				) : visibleGroups.length === 0 ? (
					<div className={styles.emptyState}>No hotel groups available.</div>
				) : (
					<>
						<div className={styles.searchBar}>
							<input
								type="search"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
								placeholder="Search groups..."
								aria-label="Search groups"
							/>
						</div>
						<VirtuosoGrid
							data={filteredGroups}
							className={styles.cards}
							components={gridComponents}
							computeItemKey={(_, group)=> group.HGroupId}
							itemContent={(_, group) => {
								const groupRole = getActorGroupRole(group, userId);
								const groupCanEdit = canEditGroup(role, groupRole, rolePermissions);

								return (
									<article className={styles.card}>
										<div className={styles.cardTop}>
											<div>
												<p className={styles.kicker}>Group #{group.HGroupId}</p>
												<h4>{group.GroupName}</h4>
											</div>

											<div className={styles.rolePill}>
												{(group.Users ?? []).length} members
											</div>
										</div>

										<div className={styles.metaGrid}>
											<span>Hotels {(group.Hotels ?? []).length}</span>
											<span>Members {(group.Users ?? []).length}</span>
											<span>{groupRole ?? "None"}</span>
										</div>

										<div className={styles.ownerList}>
											{(group.Users ?? []).slice(0, 3).map((member) => (
												<span key={member.UserID} className={styles.ownerChip}>
													{member.UserName ?? `User ${member.UserID}`}
												</span>
											))}
										</div>

										<div className={styles.cardActions}>
											<button
												type="button"
												className={styles.viewButton}
												onClick={() => openView(group)}
											>
												View
											</button>

											{groupCanEdit && (
												<>
													<button type="button" onClick={() => openEdit(group)}>
														Edit
													</button>

													<button
														type="button"
														className={styles.dangerButton}
														onClick={() => handleDelete(group)}
													>
														Delete
													</button>
												</>
											)}
										</div>
									</article>
								);
							}}
						/>
					</>
				)}
			</section>
		</div>
	);
}