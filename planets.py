"""
planets.py
Vedic astrology core data — signs, nakshatras, dasha calculations.
"""

SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

SIGN_SHORT = [
    "Ari", "Tau", "Gem", "Can", "Leo", "Vir",
    "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis"
]

SIGN_LORDS = {
    "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury",
    "Cancer": "Moon", "Leo": "Sun", "Virgo": "Mercury",
    "Libra": "Venus", "Scorpio": "Mars", "Sagittarius": "Jupiter",
    "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
}

NAKSHATRAS = [
    {"name": "Ashwini",         "lord": "Ketu",    "deity": "Ashwini Kumaras"},
    {"name": "Bharani",         "lord": "Venus",   "deity": "Yama"},
    {"name": "Krittika",        "lord": "Sun",     "deity": "Agni"},
    {"name": "Rohini",          "lord": "Moon",    "deity": "Brahma"},
    {"name": "Mrigashira",      "lord": "Mars",    "deity": "Soma"},
    {"name": "Ardra",           "lord": "Rahu",    "deity": "Rudra"},
    {"name": "Punarvasu",       "lord": "Jupiter", "deity": "Aditi"},
    {"name": "Pushya",          "lord": "Saturn",  "deity": "Brihaspati"},
    {"name": "Ashlesha",        "lord": "Mercury", "deity": "Nagas"},
    {"name": "Magha",           "lord": "Ketu",    "deity": "Pitrs"},
    {"name": "Purva Phalguni",  "lord": "Venus",   "deity": "Bhaga"},
    {"name": "Uttara Phalguni", "lord": "Sun",     "deity": "Aryaman"},
    {"name": "Hasta",           "lord": "Moon",    "deity": "Savitar"},
    {"name": "Chitra",          "lord": "Mars",    "deity": "Vishvakarma"},
    {"name": "Swati",           "lord": "Rahu",    "deity": "Vayu"},
    {"name": "Vishakha",        "lord": "Jupiter", "deity": "Indra-Agni"},
    {"name": "Anuradha",        "lord": "Saturn",  "deity": "Mitra"},
    {"name": "Jyeshtha",        "lord": "Mercury", "deity": "Indra"},
    {"name": "Mula",            "lord": "Ketu",    "deity": "Nirriti"},
    {"name": "Purva Ashadha",   "lord": "Venus",   "deity": "Apas"},
    {"name": "Uttara Ashadha",  "lord": "Sun",     "deity": "Vishvedevas"},
    {"name": "Shravana",        "lord": "Moon",    "deity": "Vishnu"},
    {"name": "Dhanishta",       "lord": "Mars",    "deity": "Eight Vasus"},
    {"name": "Shatabhisha",     "lord": "Rahu",    "deity": "Varuna"},
    {"name": "Purva Bhadrapada","lord": "Jupiter", "deity": "Aja Ekapada"},
    {"name": "Uttara Bhadrapada","lord":"Saturn",  "deity": "Ahir Budhanya"},
    {"name": "Revati",          "lord": "Mercury", "deity": "Pushan"},
]

# Vimshottari Dasha years
DASHA_YEARS = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7,
    "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17
}

# Order of dashas starting from Ketu
DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]

# Nakshatra to dasha lord (cycle of 9 repeating across 27 nakshatras)
NAKSHATRA_LORDS = [DASHA_ORDER[i % 9] for i in range(27)]


def get_sign(longitude: float) -> str:
    """Return zodiac sign name from sidereal longitude."""
    return SIGNS[int(longitude // 30)]


def get_sign_index(longitude: float) -> int:
    return int(longitude // 30)


def get_nakshatra(longitude: float) -> dict:
    """Return nakshatra details and pada from sidereal longitude."""
    nak_span = 360 / 27          # 13.333... degrees per nakshatra
    idx = int(longitude // nak_span)
    pos_in_nak = longitude % nak_span
    pada = int(pos_in_nak // (nak_span / 4)) + 1
    nak = NAKSHATRAS[idx].copy()
    nak["index"] = idx
    nak["pada"] = pada
    nak["degree"] = round(pos_in_nak, 4)
    return nak


def get_vimshottari_dasha(moon_longitude: float, birth_date) -> dict:
    """
    Calculate Vimshottari Mahadasha and all Antardashas
    from Moon nakshatra and birth date.
    Returns timeline of all Mahadashas and current period.
    """
    from datetime import datetime, timedelta

    nak_span = 360 / 27
    nak_idx = int(moon_longitude // nak_span)
    pos_in_nak = moon_longitude % nak_span
    fraction_elapsed = pos_in_nak / nak_span

    start_lord = NAKSHATRA_LORDS[nak_idx]
    start_idx = DASHA_ORDER.index(start_lord)

    balance_years = DASHA_YEARS[start_lord] * (1 - fraction_elapsed)

    # Build Mahadasha timeline
    timeline = []
    cur_date = birth_date
    for i in range(12):
        lord = DASHA_ORDER[(start_idx + i) % 9]
        dur = balance_years if i == 0 else DASHA_YEARS[lord]
        end_date = cur_date + timedelta(days=dur * 365.2425)
        timeline.append({
            "lord": lord,
            "start": cur_date,
            "end": end_date,
            "duration_years": round(dur, 2)
        })
        cur_date = end_date

    today = datetime.now()
    current_md = next((t for t in timeline if t["start"] <= today < t["end"]), timeline[0])

    # Build Antardasha within current Mahadasha
    md_lord = current_md["lord"]
    md_start = current_md["start"]
    md_dur = current_md["duration_years"]
    md_idx = DASHA_ORDER.index(md_lord)

    antardashas = []
    ad_cur = md_start
    for i in range(9):
        ad_lord = DASHA_ORDER[(md_idx + i) % 9]
        ad_dur_years = DASHA_YEARS[ad_lord] * md_dur / 120
        ad_end = ad_cur + timedelta(days=ad_dur_years * 365.2425)
        antardashas.append({
            "lord": ad_lord,
            "start": ad_cur,
            "end": ad_end,
        })
        ad_cur = ad_end

    current_ad = next((a for a in antardashas if a["start"] <= today < a["end"]), antardashas[0])

    return {
        "mahadasha": md_lord,
        "mahadasha_start": current_md["start"].strftime("%b %Y"),
        "mahadasha_end": current_md["end"].strftime("%b %Y"),
        "antardasha": current_ad["lord"],
        "antardasha_start": current_ad["start"].strftime("%b %Y"),
        "antardasha_end": current_ad["end"].strftime("%b %Y"),
        "all_mahadashas": [
            {
                "lord": t["lord"],
                "start": t["start"].strftime("%b %Y"),
                "end": t["end"].strftime("%b %Y"),
                "current": t["lord"] == md_lord
            }
            for t in timeline[:9]
        ],
        "antardashas": [
            {
                "lord": a["lord"],
                "start": a["start"].strftime("%b %Y"),
                "end": a["end"].strftime("%b %Y"),
                "current": a["lord"] == current_ad["lord"]
            }
            for a in antardashas
        ]
    }


def get_d10_sign(longitude: float) -> str:
    """Calculate Dashamsha (D10) sign from natal longitude."""
    sign_num = int(longitude // 30)
    deg_in_sign = longitude % 30
    part = int(deg_in_sign // 3)         # which 1/10th of sign (0-9)
    if sign_num % 2 == 0:                # even sign (0-indexed)
        start = sign_num
    else:                                # odd sign
        start = (sign_num + 8) % 12
    d10_idx = (start + part) % 12
    return SIGNS[d10_idx]


PLANET_ABBREVIATIONS = {
    "Sun": "Su", "Moon": "Mo", "Mars": "Ma", "Mercury": "Me",
    "Jupiter": "Ju", "Venus": "Ve", "Saturn": "Sa",
    "Rahu": "Ra", "Ketu": "Ke", "Ascendant": "Asc"
}

PLANET_KARAKAS = {
    "Sun":     "Soul, authority, father, government",
    "Moon":    "Mind, mother, emotions, public",
    "Mars":    "Energy, siblings, property, courage",
    "Mercury": "Intelligence, communication, business",
    "Jupiter": "Wisdom, children, wealth, dharma",
    "Venus":   "Love, luxury, spouse, arts",
    "Saturn":  "Karma, discipline, longevity, service",
    "Rahu":    "Ambition, foreigners, technology, illusion",
    "Ketu":    "Liberation, spirituality, past karma",
}

HOUSE_MEANINGS = {
    1: "Lagna — Self, personality, body, appearance",
    2: "Dhana — Wealth, family, speech, food",
    3: "Sahaja — Siblings, courage, short travel, communication",
    4: "Sukha — Home, mother, education, comfort",
    5: "Putra — Children, intelligence, creativity, romance",
    6: "Ripu — Enemies, disease, debt, service",
    7: "Kalatra — Marriage, partnership, business, public",
    8: "Mrityu — Transformation, secrets, longevity, inheritance",
    9: "Dharma — Luck, father, philosophy, higher learning",
    10: "Karma — Career, authority, reputation, government",
    11: "Labha — Gains, friends, elder siblings, desires",
    12: "Vyaya — Losses, foreign, isolation, liberation",
}
