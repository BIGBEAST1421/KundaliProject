import "server-only";
import { CITIES } from "./cities";

export interface Coordinates {
  lat: number;
  lon: number;
  found: boolean;
}

const NEW_DELHI: Coordinates = { lat: 28.6139, lon: 77.209, found: false };

/**
 * Coordinates for a place: exact match from the curated list, otherwise OpenStreetMap
 * Nominatim, otherwise New Delhi (flagged `found: false`).
 */
export async function geocode(city: string, state = "", country = "India"): Promise<Coordinates> {
  const local = CITIES.find(
    (c) => c.c.toLowerCase() === city.toLowerCase().trim() && (!state || c.s.toLowerCase() === state.toLowerCase().trim()),
  );
  if (local) return { lat: local.lat, lon: local.lon, found: true };

  const q = [city, state, country].filter(Boolean).join(", ");
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "kundali-app/2.0 (birth chart lookup)" },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = (await res.json()) as { lat: string; lon: string }[];
      if (data[0]) return { lat: Number(data[0].lat), lon: Number(data[0].lon), found: true };
    }
  } catch (err) {
    console.warn("geocode failed", err);
  }
  return NEW_DELHI;
}
