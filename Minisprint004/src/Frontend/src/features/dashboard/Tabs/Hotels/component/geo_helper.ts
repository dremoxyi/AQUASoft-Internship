export async function reverseGeocode(lat: number, lng: number) {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );

    if (!response.ok) {
        throw new Error("Failed to reverse geocode");
    }

    const data = await response.json();

    const houseNumber = data.address.house_number ?? "";
    const street = data.address.road ?? "";

    const address = [houseNumber, street]
        .filter(Boolean)
        .join(" ");

    return {
        city:
            data.address.city ??
            data.address.town ??
            data.address.village ??
            "",
        province:
            data.address.state ??
            data.address.county ??
            "",
        country:
            data.address.country ?? "",
        address,
    };
}

export async function forwardGeocode(address:string, city: string, province?: string, country?: string) {
    const query = [address ?? "", city ?? "", province ?? "", country ?? ""]
        .filter((part) => part.trim() !== "")
        .join(", ");

    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=1`
    );

    if (!response.ok) {
        throw new Error("Failed to geocode location");
    }

    const data = await response.json();

    if (!data.length) {
        throw new Error("Location not found");
    }

    return {
        latitude: Number(data[0].lat),
        longitude: Number(data[0].lon),
    };
}