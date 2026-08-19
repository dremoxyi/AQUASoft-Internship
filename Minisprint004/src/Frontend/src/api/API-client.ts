const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'


export async function apiClient(endpoint: string, options?: RequestInit) {
	const response = await fetch(`${API_URL}${endpoint}`, {
		...options,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
	});

	const data = await response.json();

	if (response.status === 401) {
		window.dispatchEvent(
			new Event("auth-expired")
		);

		throw new Error(
			data.message ?? "Session expired"
		);
	}

	if (!response.ok) {
		throw new Error(data.message ?? "API error");
	}

	return data;
}