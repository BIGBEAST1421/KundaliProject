import "server-only";
import { CITIES } from "./cities";

export interface Coordinates {
  lat: number;
  lon: number;
}

/**
 * The birthplace could not be turned into coordinates. Charts are never computed against a
 * guessed location — a wrong place means a wrong timezone and a wrong Lagna — so callers
 * surface this to the user instead. `field` says which person's place failed (match form).
 */
export class GeocodeError extends Error {
  constructor(readonly code: "not_found" | "unavailable", message: string, readonly field?: string) {
    super(message);
    this.name = "GeocodeError";
  }
}

async function nominatim(q: string): Promise<Coordinates | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "kundali-app/2.0 (birth chart lookup)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Nominatim responded ${res.status}`);
  const data = (await res.json()) as { lat: string; lon: string }[];
  return data[0] ? { lat: Number(data[0].lat), lon: Number(data[0].lon) } : null;
}

/**
 * Coordinates for a place: exact match from the curated list, otherwise OpenStreetMap
 * Nominatim. The form defaults the country to India, so a place typed as free text is tried
 * with that country first and then without it (e.g. "Houston" → Houston, USA). Throws
 * GeocodeError rather than falling back to a default city.
 */
export async function geocode(city: string, state = "", country = "India"): Promise<Coordinates> {
  const local = CITIES.find(
    (c) => c.c.toLowerCase() === city.toLowerCase().trim() && (!state || c.s.toLowerCase() === state.toLowerCase().trim()),
  );
  if (local) return { lat: local.lat, lon: local.lon };

  // "City, Region" typed by the user already says where it is; don't append the default country.
  const queries = city.includes(",")
    ? [city]
    : [...new Set([[city, state, country], [city, state]].map((parts) => parts.filter(Boolean).join(", ")))];

  try {
    for (const q of queries) {
      const hit = await nominatim(q);
      if (hit) return hit;
    }
  } catch (err) {
    console.warn("geocode failed", err);
    throw new GeocodeError("unavailable", "We couldn't look up that place right now. Please pick it from the suggestions.");
  }
  throw new GeocodeError("not_found", "We couldn't find that place. Try adding the state or country, e.g. \"Houston, USA\".");
}
