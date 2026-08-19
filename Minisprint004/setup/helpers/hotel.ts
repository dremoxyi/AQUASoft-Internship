import { hotelGroups } from "../config/hotelgroups.ts";

export function normalizeHotelName(hotelName: string): string {
  if (!hotelName) return "";

  let name = hotelName.toLowerCase();

  // Replace separators with spaces
  name = name.replace(/[-_/]/g, " ");

  // Normalize ampersand
  name = name.replace(/&/g, "and");

  // Remove content after commas
  name = name.replace(/,.*$/, "");

  // Remove common location connectors
  name = name.replace(/\s+(at|near|in|by)\s+.+$/g, "");

  // Remove extra spaces
  name = name.replace(/\s+/g, " ").trim();

  return name;
}

export function findHotelGroup(
  hotelName: string
): string | null {

  const normalized = normalizeHotelName(hotelName);

  for (const [group, brands] of Object.entries(hotelGroups)) {
    const sortedBrands = [...brands]
      .sort((a, b) => b.length - a.length);

    for (const brand of sortedBrands) {
      if (normalized.startsWith(brand)) {
        return group;
      }
    }
  }

  return null;
}

