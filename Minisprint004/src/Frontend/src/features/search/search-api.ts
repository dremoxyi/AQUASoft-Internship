import { apiClient } from "../../api/API-client";

interface SearchOptions {
    limit?: number,
    offset?: number
}

export function search(text: string, options: SearchOptions) {
    const params = new URLSearchParams({
        q:text ?? "",
        limit: String(options.limit ?? 100),
        offset: String(options.offset ?? 0),
    })
    // expecting backend to support a `search` or `q` query param; adjust if different
    return apiClient(`/search?${params.toString()}`, {
        method: "GET",
    });
}