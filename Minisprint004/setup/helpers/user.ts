export function safeUserName(
    username: string,
    fallbackId: string
): string {

    const normalized = username
        .replace(/\s+/g, " ")
        .trim();

    if (!normalized) {
        return `reviewer-${fallbackId}`;
    }

    return normalized;
}

export function safeEmail(
    userName: string
): string {

    const localPart =
        userName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ".")
            .replace(/^\.+|\.+$/g, "")
        || "reviewer";

    return `${localPart}@seed.local`;
}
