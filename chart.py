"""
chart.py
Precise D1 (Rashi) and D10 (Dashamsha) chart calculations
using Swiss Ephemeris with Lahiri ayanamsa.
"""

import swisseph as swe
from datetime import datetime, timezone
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
import pytz

from planets import (
    SIGNS, get_sign, get_nakshatra, get_vimshottari_dasha,
    get_d10_sign, PLANET_ABBREVIATIONS, SIGN_LORDS
)

# Use Lahiri ayanamsa (standard for Indian Jyotish)
swe.set_sid_mode(swe.SIDM_LAHIRI)

PLANET_IDS = {
    "Sun":     swe.SUN,
    "Moon":    swe.MOON,
    "Mars":    swe.MARS,
    "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER,
    "Venus":   swe.VENUS,
    "Saturn":  swe.SATURN,
    "Rahu":    swe.MEAN_NODE,
}

FLAG = swe.FLG_SIDEREAL | swe.FLG_MOSEPH


def get_coordinates(city: str, state: str = "", country: str = "India") -> dict:
    """Get lat/lon from city name using Nominatim."""
    geolocator = Nominatim(user_agent="kundali-app-v1")
    query = f"{city}, {state}, {country}".strip(", ")
    try:
        loc = geolocator.geocode(query, timeout=10)
        if loc:
            return {"lat": loc.latitude, "lon": loc.longitude, "found": True}
    except Exception as e:
        print(f"Geocode error: {e}")
    return {"lat": 28.6139, "lon": 77.2090, "found": False}  # default: New Delhi


def local_to_utc(date_str: str, time_str: str, lat: float, lon: float) -> datetime:
    """Convert local birth time to UTC using timezone from coordinates."""
    tf = TimezoneFinder()
    tz_name = tf.timezone_at(lat=lat, lng=lon) or "Asia/Kolkata"
    local_tz = pytz.timezone(tz_name)

    if time_str and ":" in time_str:
        hour, minute = map(int, time_str.split(":")[:2])
    else:
        hour, minute = 12, 0  # solar noon fallback

    year, month, day = map(int, date_str.split("-"))
    local_dt = local_tz.localize(datetime(year, month, day, hour, minute))
    utc_dt = local_dt.astimezone(pytz.utc)
    return utc_dt


def compute_chart(date_str: str, time_str: str, lat: float, lon: float) -> dict:
    """
    Compute full D1 and D10 chart.
    Returns lagna, all planet positions, nakshatra, dasha data.
    """
    utc_dt = local_to_utc(date_str, time_str, lat, lon)

    jd_ut = swe.julday(
        utc_dt.year, utc_dt.month, utc_dt.day,
        utc_dt.hour + utc_dt.minute / 60
    )

    # Ayanamsa
    ayanamsa = swe.get_ayanamsa_ut(jd_ut)

    # Ascendant (Lagna)
    cusps, ascmc = swe.houses_ex(jd_ut, lat, lon, b'P', flags=FLAG)
    asc_lon = ascmc[0]

    # Planet positions
    planets = {}
    for name, pid in PLANET_IDS.items():
        pos, _ = swe.calc_ut(jd_ut, pid, FLAG)
        planets[name] = round(pos[0], 6)

    # Ketu = Rahu + 180
    planets["Ketu"] = (planets["Rahu"] + 180) % 360

    # D1 signs
    d1 = {p: get_sign(lon_deg) for p, lon_deg in planets.items()}
    d1["Ascendant"] = get_sign(asc_lon)

    # D10 signs
    d10 = {p: get_d10_sign(lon_deg) for p, lon_deg in planets.items()}
    d10["Ascendant"] = get_d10_sign(asc_lon)

    # Nakshatra from Moon
    moon_nak = get_nakshatra(planets["Moon"])
    sun_nak  = get_nakshatra(planets["Sun"])
    asc_nak  = get_nakshatra(asc_lon)

    # Degrees in sign for each planet
    degrees_in_sign = {
        p: round(lon_deg % 30, 4) for p, lon_deg in planets.items()
    }
    degrees_in_sign["Ascendant"] = round(asc_lon % 30, 4)

    # House placements (from Lagna)
    lagna_sign_idx = int(asc_lon // 30)
    house_of = {}
    for p, lon_deg in planets.items():
        sign_idx = int(lon_deg // 30)
        house = (sign_idx - lagna_sign_idx) % 12 + 1
        house_of[p] = house
    house_of["Ascendant"] = 1

    # D10 house placements
    d10_lagna_idx = SIGNS.index(d10["Ascendant"])
    d10_house_of = {}
    for p, sign in d10.items():
        if p == "Ascendant":
            d10_house_of[p] = 1
            continue
        sign_idx = SIGNS.index(sign)
        house = (sign_idx - d10_lagna_idx) % 12 + 1
        d10_house_of[p] = house

    # Vimshottari Dasha
    from datetime import date
    birth_date = datetime.strptime(date_str, "%Y-%m-%d")
    dasha = get_vimshottari_dasha(planets["Moon"], birth_date)

    return {
        "ayanamsa": round(ayanamsa, 6),
        "julian_day": round(jd_ut, 6),
        "utc_time": utc_dt.strftime("%Y-%m-%d %H:%M UTC"),
        "lagna": get_sign(asc_lon),
        "lagna_degree": round(asc_lon % 30, 4),
        "lagna_sign_index": lagna_sign_idx,
        "rashi": d1["Moon"],           # Moon sign
        "sun_sign": d1["Sun"],
        "nakshatra": moon_nak,
        "sun_nakshatra": sun_nak,
        "lagna_nakshatra": asc_nak,
        "longitudes": {**planets, "Ascendant": round(asc_lon, 6)},
        "degrees_in_sign": degrees_in_sign,
        "d1": d1,
        "d10": d10,
        "house_of": house_of,
        "d10_house_of": d10_house_of,
        "d10_lagna": d10["Ascendant"],
        "dasha": dasha,
        "sign_lords": {p: SIGN_LORDS.get(s, "—") for p, s in d1.items()},
    }


def build_chart_summary(chart: dict) -> str:
    """
    Build a plain-text summary of the chart to pass to Claude for analysis.
    Keeps it compact to fit within token limits.
    """
    d = chart
    nak = d["nakshatra"]
    dasha = d["dasha"]

    lines = [
        f"Lagna (Ascendant): {d['lagna']} {d['lagna_degree']}°",
        f"Moon Sign (Rashi): {d['rashi']}",
        f"Sun Sign: {d['sun_sign']}",
        f"Moon Nakshatra: {nak['name']} Pada {nak['pada']} (Lord: {nak['lord']})",
        f"Lagna Nakshatra: {d['lagna_nakshatra']['name']} Pada {d['lagna_nakshatra']['pada']}",
        "",
        "D1 Planet Positions (sign | house):",
    ]
    for planet, sign in d["d1"].items():
        if planet == "Ascendant":
            continue
        h = d["house_of"].get(planet, "?")
        deg = d["degrees_in_sign"].get(planet, "?")
        lines.append(f"  {planet}: {sign} {deg}° | House {h}")

    lines += [
        "",
        f"D10 (Dashamsha) Lagna: {d['d10_lagna']}",
        "D10 Planet Placements (sign | house):",
    ]
    for planet, sign in d["d10"].items():
        if planet == "Ascendant":
            continue
        h = d["d10_house_of"].get(planet, "?")
        lines.append(f"  {planet}: {sign} | D10 House {h}")

    lines += [
        "",
        f"Current Mahadasha: {dasha['mahadasha']} ({dasha['mahadasha_start']} – {dasha['mahadasha_end']})",
        f"Current Antardasha: {dasha['antardasha']} ({dasha['antardasha_start']} – {dasha['antardasha_end']})",
    ]

    return "\n".join(lines)
