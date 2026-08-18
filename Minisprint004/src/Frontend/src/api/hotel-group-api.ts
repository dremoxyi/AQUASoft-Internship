import { apiClient } from "./API-client";

export type HotelGroupInput = {
	GroupName: string;
};

	export type GroupMembershipStatus = "PENDING" | "ACTIVE";

	export type GroupManagerRole = "MAIN" | "MANAGER";

	export type GroupMemberInput = {
		UserID?: number;
		UserName?: string;
		ManagerRole?: GroupManagerRole;
	};

	export type GroupInvitationPayload = {
		UserIDs: number[];
	};

	export type GroupInvitationResult = {
		UserID?: number;
		UserName?: string;
		Email?: string;
		ManagerRole?: string;
		MembershipStatus?: GroupMembershipStatus;
		InviteToken?: string;
		InviteTokenExpiresAt?: string;
		ActivatedAt?: string;
	};

export function getHotelGroups() {
	return apiClient("/hotel/hgroup", {
		method: "GET",
	});
}

export function createHotelGroup(payload: HotelGroupInput) {
	return apiClient("/hotel/hgroup", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export function updateHotelGroup(id: number, payload: HotelGroupInput) {
	return apiClient(`/hotel/hgroup/${id}`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
}

export function deleteHotelGroup(id: number) {
	return apiClient(`/hotel/hgroup/${id}`, {
		method: "DELETE",
	});
}

export function addHotelGroupUser(id: number, payload: GroupMemberInput) {
	return apiClient(`/hotel/hgroup/${id}/users`, {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export function addHotelGroupMember(username: string, payload: GroupMemberInput) {
	return apiClient(`/hotel/hgroup/${username}/users`, {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export function updateHotelGroupUserRole(id: number, userId: number, payload: GroupMemberInput) {
	return apiClient(`/hotel/hgroup/${id}/users/${userId}`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
}

export function removeHotelGroupUser(id: number, userId: number) {
	return apiClient(`/hotel/hgroup/${id}/users/${userId}`, {
		method: "DELETE",
	});
}

export function sendHotelGroupInvitations(id: number, payload: GroupInvitationPayload) {
	return apiClient(`/hotel/hgroup/${id}/invitations`, {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export function activateHotelGroupMembership(token: string) {
	const params = new URLSearchParams({ token });
	return apiClient(`/hotel/hgroup/invitations/activate?${params.toString()}`, {
		method: "GET",
	});
}