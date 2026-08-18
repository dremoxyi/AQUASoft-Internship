import { apiClient } from "./API-client";

export type UserInput = {
	UserName: string;
	Email: string;
	Password?: string;
	RoleID: number;
};

export function getUsers() {
	return apiClient("/user", {
		method: "GET",
	});
}

export function createUser(payload: UserInput) {
	return apiClient("/user", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export function updateUser(id: number, payload: UserInput) {
	return apiClient(`/user/${id}`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
}

export function deleteUser(id: number) {
	return apiClient(`/user/${id}`, {
		method: "DELETE",
	});
}