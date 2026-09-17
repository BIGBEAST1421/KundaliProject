import { DateTime } from "luxon";
import { find as findTimezone } from "geo-tz";

const FALLBACK_ZONE = "Asia/Kolkata";

/** IANA timezone for a coordinate; defaults to India when lookup fails (e.g. open sea). */
export function timezoneFor(lat: number, lon: number): string {
  try {
    return findTimezone(lat, lon)[0] ?? FALLBACK_ZONE;
  } catch {
    return FALLBACK_ZONE;
  }
}

/**
 * Convert a local birth date ("YYYY-MM-DD") and time ("HH:MM", may be empty) at a place
 * into a UTC DateTime. Unknown time falls back to 12:00 local (solar noon).
 */
export function localToUtc(dob: string, time: string, lat: number, lon: number): DateTime {
  const zone = timezoneFor(lat, lon);
  const [year, month, day] = dob.split("-").map(Number);
  let hour = 12;
  let minute = 0;
  if (time && time.includes(":")) {
    const [h, m] = time.split(":").map(Number);
    if (Number.isFinite(h) && Number.isFinite(m)) {
      hour = h;
      minute = m;
    }
  }
  const local = DateTime.fromObject({ year, month, day, hour, minute }, { zone });
  if (!local.isValid) {
    throw new Error(`Invalid birth date/time: ${dob} ${time}`);
  }
  return local.toUTC();
}
