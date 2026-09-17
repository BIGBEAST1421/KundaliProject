"""
matching.py
Ashta Koota (36-guna) Vedic marriage compatibility engine, plus Mangal Dosha check.
Simplified classical implementation — whole-rashi Vashya/Varna assignment
(no degree-level Sagittarius/Capricorn splitting).
"""

from planets import SIGNS, SIGN_LORDS, NAKSHATRAS

NAK_NAMES = [n["name"] for n in NAKSHATRAS]

# ── 1. Varna (max 1) ─────────────────────────────────────────────────
VARNA_RANK = {
    "Cancer": 4, "Scorpio": 4, "Pisces": 4,               # Brahmin
    "Aries": 3, "Leo": 3, "Sagittarius": 3,                # Kshatriya
    "Taurus": 2, "Virgo": 2, "Capricorn": 2,               # Vaishya
    "Gemini": 1, "Libra": 1, "Aquarius": 1,                # Shudra
}
VARNA_NAME = {4: "Brahmin", 3: "Kshatriya", 2: "Vaishya", 1: "Shudra"}

# ── 2. Vashya (max 2) ────────────────────────────────────────────────
VASHYA_GROUP = {
    "Aries": "Chatushpada", "Taurus": "Chatushpada", "Leo": "Vanachara",
    "Gemini": "Manava", "Virgo": "Manava", "Libra": "Manava", "Aquarius": "Manava",
    "Cancer": "Jalachara", "Pisces": "Jalachara", "Capricorn": "Jalachara",
    "Scorpio": "Keeta", "Sagittarius": "Chatushpada",
}
VASHYA_SCORE = {
    frozenset(["Chatushpada"]): 2, frozenset(["Manava"]): 2,
    frozenset(["Jalachara"]): 2, frozenset(["Vanachara"]): 2, frozenset(["Keeta"]): 2,
    frozenset(["Chatushpada", "Manava"]): 1, frozenset(["Chatushpada", "Jalachara"]): 1,
    frozenset(["Chatushpada", "Vanachara"]): 0, frozenset(["Chatushpada", "Keeta"]): 1,
    frozenset(["Manava", "Jalachara"]): 1, frozenset(["Manava", "Vanachara"]): 0,
    frozenset(["Manava", "Keeta"]): 1, frozenset(["Jalachara", "Vanachara"]): 1,
    frozenset(["Jalachara", "Keeta"]): 1, frozenset(["Vanachara", "Keeta"]): 1,
}

# ── 4. Yoni (max 4) ──────────────────────────────────────────────────
YONI = [
    ("Horse", "M"), ("Elephant", "M"), ("Sheep", "F"), ("Serpent", "M"), ("Serpent", "F"),
    ("Dog", "F"), ("Cat", "F"), ("Sheep", "M"), ("Cat", "M"), ("Rat", "M"),
    ("Rat", "F"), ("Cow", "F"), ("Buffalo", "F"), ("Tiger", "F"), ("Buffalo", "M"),
    ("Tiger", "M"), ("Deer", "F"), ("Deer", "M"), ("Dog", "M"), ("Monkey", "F"),
    ("Mongoose", "F"), ("Monkey", "M"), ("Lion", "F"), ("Horse", "F"), ("Lion", "M"),
    ("Cow", "M"), ("Elephant", "F"),
]
YONI_ENEMIES = {
    frozenset(["Horse", "Buffalo"]), frozenset(["Elephant", "Lion"]),
    frozenset(["Sheep", "Monkey"]), frozenset(["Dog", "Deer"]),
    frozenset(["Rat", "Cat"]), frozenset(["Cow", "Tiger"]),
    frozenset(["Serpent", "Mongoose"]),
}

# ── 5. Graha Maitri (max 5) ──────────────────────────────────────────
FRIENDS = {
    "Sun": {"Moon", "Mars", "Jupiter"}, "Moon": {"Sun", "Mercury"},
    "Mars": {"Sun", "Moon", "Jupiter"}, "Mercury": {"Sun", "Venus"},
    "Jupiter": {"Sun", "Moon", "Mars"}, "Venus": {"Mercury", "Saturn"},
    "Saturn": {"Mercury", "Venus"},
}
ENEMIES = {
    "Sun": {"Venus", "Saturn"}, "Moon": set(),
    "Mars": {"Mercury"}, "Mercury": {"Moon"},
    "Jupiter": {"Mercury", "Venus"}, "Venus": {"Sun", "Moon"},
    "Saturn": {"Sun", "Moon", "Mars"},
}

def _leaning(a, b):
    if b in FRIENDS.get(a, set()):
        return 1
    if b in ENEMIES.get(a, set()):
        return -1
    return 0

# ── 6. Gana (max 6) ──────────────────────────────────────────────────
GANA = {
    "Ashwini": "Deva", "Mrigashira": "Deva", "Punarvasu": "Deva", "Pushya": "Deva",
    "Hasta": "Deva", "Swati": "Deva", "Anuradha": "Deva", "Shravana": "Deva", "Revati": "Deva",
    "Bharani": "Manushya", "Rohini": "Manushya", "Ardra": "Manushya",
    "Purva Phalguni": "Manushya", "Uttara Phalguni": "Manushya", "Purva Ashadha": "Manushya",
    "Uttara Ashadha": "Manushya", "Purva Bhadrapada": "Manushya", "Uttara Bhadrapada": "Manushya",
    "Krittika": "Rakshasa", "Ashlesha": "Rakshasa", "Magha": "Rakshasa", "Chitra": "Rakshasa",
    "Vishakha": "Rakshasa", "Jyeshtha": "Rakshasa", "Mula": "Rakshasa",
    "Dhanishta": "Rakshasa", "Shatabhisha": "Rakshasa",
}
GANA_SCORE = {
    frozenset(["Deva"]): 6, frozenset(["Manushya"]): 6, frozenset(["Rakshasa"]): 6,
    frozenset(["Deva", "Manushya"]): 5, frozenset(["Deva", "Rakshasa"]): 1,
    frozenset(["Manushya", "Rakshasa"]): 0,
}

# ── 8. Nadi (max 8) ──────────────────────────────────────────────────
NADI = {}
_NADI_AADI = {"Ashwini", "Ardra", "Punarvasu", "Uttara Phalguni", "Hasta", "Jyeshtha",
              "Mula", "Shatabhisha", "Purva Bhadrapada"}
_NADI_MADHYA = {"Bharani", "Mrigashira", "Pushya", "Purva Phalguni", "Chitra", "Anuradha",
                "Purva Ashadha", "Dhanishta", "Uttara Bhadrapada"}
_NADI_ANTYA = {"Krittika", "Rohini", "Ashlesha", "Magha", "Swati", "Vishakha",
               "Uttara Ashadha", "Shravana", "Revati"}
for _n in NAK_NAMES:
    if _n in _NADI_AADI:
        NADI[_n] = "Aadi"
    elif _n in _NADI_MADHYA:
        NADI[_n] = "Madhya"
    else:
        NADI[_n] = "Antya"

BAD_BHAKOOT_DIFFS = {2, 5, 6, 8, 9, 12}

SCORE_INTERPRETATION = [
    (32, "Excellent match — highly compatible on classical Ashta Koota grounds."),
    (24, "Good match — compatible, minor points to keep in mind."),
    (18, "Average match — workable, but review the doshas below with a priest/astrologer."),
    (0,  "Not recommended by classical Ashta Koota scoring alone — significant work needed."),
]


def _koota(name, max_pts, pts, note):
    return {"name": name, "max": max_pts, "points": round(pts, 2), "note": note}


def compute_guna_milan(boy_chart: dict, girl_chart: dict) -> dict:
    """
    Compute the 8-koota (Ashta Koota) compatibility score between two charts.
    Uses each chart's Moon sign (rashi) and Moon nakshatra.
    """
    b_rashi, g_rashi = boy_chart["rashi"], girl_chart["rashi"]
    b_nak, g_nak = boy_chart["nakshatra"]["name"], girl_chart["nakshatra"]["name"]
    b_nak_idx, g_nak_idx = NAK_NAMES.index(b_nak), NAK_NAMES.index(g_nak)
    b_rashi_idx, g_rashi_idx = SIGNS.index(b_rashi), SIGNS.index(g_rashi)

    kootas = []

    # 1. Varna
    bv, gv = VARNA_RANK[b_rashi], VARNA_RANK[g_rashi]
    pts = 1 if bv >= gv else 0
    kootas.append(_koota("Varna", 1, pts,
        f"Groom: {VARNA_NAME[bv]} · Bride: {VARNA_NAME[gv]}"))

    # 2. Vashya
    bg, gg = VASHYA_GROUP[b_rashi], VASHYA_GROUP[g_rashi]
    pts = VASHYA_SCORE.get(frozenset([bg, gg]), 1)
    kootas.append(_koota("Vashya", 2, pts, f"Groom: {bg} · Bride: {gg}"))

    # 3. Tara
    def tara_good(diff):
        t = diff % 9
        if t == 0:
            t = 9
        return t in (2, 4, 6, 8, 9)
    diff1 = ((g_nak_idx - b_nak_idx) % 27) + 1
    diff2 = ((b_nak_idx - g_nak_idx) % 27) + 1
    pts = (1.5 if tara_good(diff1) else 0) + (1.5 if tara_good(diff2) else 0)
    kootas.append(_koota("Tara", 3, pts, "Birth-star counting cycle both ways"))

    # 4. Yoni
    b_animal, b_sex = YONI[b_nak_idx]
    g_animal, g_sex = YONI[g_nak_idx]
    if b_animal == g_animal:
        pts = 4 if b_sex == g_sex else 3
    elif frozenset([b_animal, g_animal]) in YONI_ENEMIES:
        pts = 0
    else:
        pts = 2
    kootas.append(_koota("Yoni", 4, pts, f"Groom: {b_animal} · Bride: {g_animal}"))

    # 5. Graha Maitri
    b_lord, g_lord = SIGN_LORDS[b_rashi], SIGN_LORDS[g_rashi]
    if b_lord == g_lord:
        pts = 5
    else:
        lean = _leaning(b_lord, g_lord) + _leaning(g_lord, b_lord)
        pts = {2: 5, 1: 4, 0: 3, -1: 1, -2: 0}[lean]
    kootas.append(_koota("Graha Maitri", 5, pts, f"Groom's Moon lord: {b_lord} · Bride's Moon lord: {g_lord}"))

    # 6. Gana
    b_gana, g_gana = GANA[b_nak], GANA[g_nak]
    pts = GANA_SCORE.get(frozenset([b_gana, g_gana]), 6)
    kootas.append(_koota("Gana", 6, pts, f"Groom: {b_gana} · Bride: {g_gana}"))

    # 7. Bhakoot
    bhakoot_diff = ((g_rashi_idx - b_rashi_idx) % 12) + 1
    bhakoot_dosha = bhakoot_diff in BAD_BHAKOOT_DIFFS
    pts = 0 if bhakoot_dosha else 7
    kootas.append(_koota("Bhakoot", 7, pts,
        "Bhakoot Dosha — rashi distance is inauspicious (2/12, 5/9 or 6/8)" if bhakoot_dosha
        else "Rashi distance is favourable"))

    # 8. Nadi
    b_nadi, g_nadi = NADI[b_nak], NADI[g_nak]
    nadi_dosha = b_nadi == g_nadi
    pts = 0 if nadi_dosha else 8
    kootas.append(_koota("Nadi", 8, pts,
        f"Nadi Dosha — both are {b_nadi} Nadi" if nadi_dosha else f"Groom: {b_nadi} · Bride: {g_nadi}"))

    total = round(sum(k["points"] for k in kootas), 2)
    verdict = next(msg for threshold, msg in SCORE_INTERPRETATION if total >= threshold)

    doshas = []
    if nadi_dosha:
        doshas.append("Nadi Dosha (same Nadi) — classically considered the most significant dosha; "
                       "traditionally reviewed carefully as it relates to health/progeny compatibility.")
    if bhakoot_dosha:
        doshas.append("Bhakoot Dosha (2-12/5-9/6-8 rashi distance) — can indicate friction in "
                       "financial or emotional harmony; often mitigated if Graha Maitri and Gana score well.")

    return {
        "total": total,
        "max": 36,
        "verdict": verdict,
        "kootas": kootas,
        "doshas": doshas,
    }


MANGAL_HOUSES = {1, 2, 4, 7, 8, 12}


def check_mangal_dosha(chart: dict) -> dict:
    """Basic Mangal (Manglik) Dosha check: Mars in houses 1,2,4,7,8,12 from Lagna."""
    mars_house = chart["house_of"].get("Mars")
    is_manglik = mars_house in MANGAL_HOUSES
    return {"is_manglik": is_manglik, "mars_house": mars_house}
