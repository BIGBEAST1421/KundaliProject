"""
main.py
Vedic Kundali App — Flask backend
Run: python main.py
Open: http://localhost:5000
"""

import os
import json
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import google.generativeai as genai

from chart import compute_chart, get_coordinates, build_chart_summary
from planets import HOUSE_MEANINGS, PLANET_KARAKAS
from matching import compute_guna_milan, check_mangal_dosha

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "kundali-dev-secret-2024")

# Gemini client
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))
gemini_model = genai.GenerativeModel("gemini-3.5-flash-lite")


# ── Routes ──────────────────────────────────────────────────────────
#temporary

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/geocode", methods=["POST"])
def geocode():
    """Look up coordinates for a city."""
    data = request.json
    city    = data.get("city", "")
    state   = data.get("state", "")
    country = data.get("country", "India")
    coords  = get_coordinates(city, state, country)
    return jsonify(coords)


@app.route("/api/chart", methods=["POST"])
def generate_chart():
    """
    Main endpoint: compute chart + get AI analysis.
    Expects JSON: { name, dob, time, city, state, country, lat, lon, gender, focus }
    """
    data = request.json

    name           = data.get("name", "").strip()
    dob            = data.get("dob", "")          # YYYY-MM-DD
    time_          = data.get("time", "")         # HH:MM
    time_known     = bool(data.get("time_known", False))
    city    = data.get("city", "")
    state   = data.get("state", "")
    country = data.get("country", "India")
    lat     = data.get("lat")
    lon     = data.get("lon")
    gender  = data.get("gender", "")
    focus   = data.get("focus", "All pillars")
    occupation      = data.get("occupation", "")
    marital_status  = data.get("marital_status", "Unmarried")
    language        = data.get("language", "English")

    if not name or not dob or not city:
        return jsonify({"error": "Name, date of birth and city are required."}), 400

    # Get coordinates if not provided
    if not lat or not lon:
        coords = get_coordinates(city, state, country)
        lat, lon = coords["lat"], coords["lon"]

    try:
        # Step 1: Compute chart using Swiss Ephemeris
        chart = compute_chart(dob, time_, float(lat), float(lon))

        # Step 2: Build chart summary for Claude
        chart_text = build_chart_summary(chart)

        # Step 3: Get AI analysis from Gemini
        analysis = get_ai_analysis(
            name=name, dob=dob, time_=time_, time_known=time_known,
            location=f"{city}, {state}, {country}",
            gender=gender, focus=focus,
            occupation=occupation, marital_status=marital_status,
            chart_text=chart_text,
            chart=chart,
            language=language
        )

        mangal = check_mangal_dosha(chart)

        return jsonify({
            "chart": {
                "time_known":      time_known,
                "occupation":      occupation,
                "marital_status":  marital_status,
                "mangal_dosha":    mangal["is_manglik"],
                "lagna":           chart["lagna"],
                "lagna_degree":    chart["lagna_degree"],
                "rashi":           chart["rashi"],
                "sun_sign":        chart["sun_sign"],
                "nakshatra":       chart["nakshatra"]["name"],
                "nakshatra_pada":  chart["nakshatra"]["pada"],
                "nakshatra_lord":  chart["nakshatra"]["lord"],
                "nakshatra_deity": chart["nakshatra"]["deity"],
                "d1":              chart["d1"],
                "d10_lagna":       chart["d10_lagna"],
                "house_of":        chart["house_of"],
                "dasha":           chart["dasha"],
                "utc_time":        chart["utc_time"],
                "ayanamsa":        chart["ayanamsa"],
            },
            "analysis": analysis,
            "location": {"lat": lat, "lon": lon, "city": city, "state": state}
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


def _person_chart(p: dict) -> dict:
    """Compute a chart dict from a {name,dob,time,time_known,city,state,country,lat,lon} sub-payload."""
    dob  = p.get("dob", "")
    time_ = p.get("time", "")
    lat, lon = p.get("lat"), p.get("lon")
    if not lat or not lon:
        coords = get_coordinates(p.get("city", ""), p.get("state", ""), p.get("country", "India"))
        lat, lon = coords["lat"], coords["lon"]
    return compute_chart(dob, time_, float(lat), float(lon))


@app.route("/api/match", methods=["POST"])
def generate_match():
    """
    Kundali Matching endpoint: compute both charts, run Ashta Koota guna milan,
    check Mangal Dosha for both, and get an AI compatibility narrative.
    Expects JSON: { boy: {name,dob,time,time_known,city,state,country,lat,lon},
                     girl: {same shape} }
    """
    data = request.json
    boy_in, girl_in = data.get("boy", {}), data.get("girl", {})
    language = data.get("language", "English")

    boy_name  = boy_in.get("name", "").strip()
    girl_name = girl_in.get("name", "").strip()

    if not boy_name or not boy_in.get("dob") or not boy_in.get("city"):
        return jsonify({"error": "Groom's name, date of birth and place of birth are required."}), 400
    if not girl_name or not girl_in.get("dob") or not girl_in.get("city"):
        return jsonify({"error": "Bride's name, date of birth and place of birth are required."}), 400

    try:
        boy_chart = _person_chart(boy_in)
        girl_chart = _person_chart(girl_in)

        guna = compute_guna_milan(boy_chart, girl_chart)
        boy_mangal = check_mangal_dosha(boy_chart)
        girl_mangal = check_mangal_dosha(girl_chart)
        mangal_note = (
            "Both are Manglik — classically this cancels the dosha between them."
            if boy_mangal["is_manglik"] and girl_mangal["is_manglik"] else
            "Neither is Manglik — no Mangal Dosha concern."
            if not boy_mangal["is_manglik"] and not girl_mangal["is_manglik"] else
            f"Only the {'groom' if boy_mangal['is_manglik'] else 'bride'} is Manglik — "
            "worth reviewing remedies or a Kumbh Vivah with an astrologer."
        )

        analysis = get_match_analysis(
            boy_name=boy_name, girl_name=girl_name,
            boy_chart=boy_chart, girl_chart=girl_chart,
            guna=guna, mangal_note=mangal_note,
            language=language,
        )

        def chart_summary(c):
            return {
                "lagna": c["lagna"], "rashi": c["rashi"], "sun_sign": c["sun_sign"],
                "nakshatra": c["nakshatra"]["name"], "nakshatra_pada": c["nakshatra"]["pada"],
                "d1": c["d1"],
            }

        return jsonify({
            "boy": {"name": boy_name, "chart": chart_summary(boy_chart), "mangal_dosha": boy_mangal["is_manglik"]},
            "girl": {"name": girl_name, "chart": chart_summary(girl_chart), "mangal_dosha": girl_mangal["is_manglik"]},
            "guna_milan": guna,
            "mangal_note": mangal_note,
            "analysis": analysis,
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


def _gemini_json(prompt: str, system_prompt: str, max_tokens: int = 4096, response_schema: dict = None) -> dict:
    """
    Call Gemini in JSON mode at temperature 0 (for consistent, reproducible output
    across requests), constrained to response_schema when given (this is what actually
    guarantees nested objects stay nested — a model can ignore a schema described only
    in prose, but not one enforced via response_schema). Retries once on malformed
    output before degrading gracefully instead of raising.
    """
    import re
    from google.api_core.exceptions import ResourceExhausted

    def _attempt():
        gen_config = {
            "max_output_tokens": max_tokens,
            "temperature": 0,
            "response_mime_type": "application/json",
        }
        if response_schema is not None:
            gen_config["response_schema"] = response_schema
        response = gemini_model.generate_content(
            f"{system_prompt}\n\n{prompt}",
            generation_config=gen_config,
        )
        raw = response.text.strip().replace("```json", "").replace("```", "")
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            match = re.search(r'\{[\s\S]*\}', raw)
            if match:
                return json.loads(match.group())
            raise

    try:
        return _attempt()
    except ResourceExhausted:
        raise
    except Exception:
        try:
            return _attempt()
        except ResourceExhausted:
            raise
        except Exception as e:
            return {"error": "Analysis parse failed", "raw": str(e)[:500]}


def _s_str():
    return {"type": "STRING"}


def _s_arr(items):
    return {"type": "ARRAY", "items": items}


def _s_obj(properties, required=None):
    return {"type": "OBJECT", "properties": properties, "required": required or list(properties.keys())}


_SECTOR_SCHEMA = _s_obj({"sector": _s_str(), "reason": _s_str()})
_TIMELINE_ITEM_SCHEMA = _s_obj({"period": _s_str(), "desc": _s_str()})
_MUHURTA_SCHEMA = _s_obj({"type": _s_str(), "window": _s_str(), "reason": _s_str()})
_REMEDY_SCHEMA = _s_obj({"icon": _s_str(), "title": _s_str(), "desc": _s_str()})

_CAREER_SCHEMA = _s_obj({
    "summary": _s_str(),
    "strengths": _s_arr(_s_str()),
    "switch_timing": _s_str(),
    "sectors": _s_arr(_SECTOR_SCHEMA),
    "timeline": _s_arr(_TIMELINE_ITEM_SCHEMA),
})
_HEALTH_SCHEMA = _s_obj({
    "constitution": _s_str(),
    "vulnerabilities": _s_arr(_s_str()),
    "strengths": _s_arr(_s_str()),
    "watch": _s_arr(_s_str()),
})
_WEALTH_SCHEMA = _s_obj({
    "pattern": _s_str(),
    "insights": _s_arr(_s_str()),
    "timeline": _s_arr(_TIMELINE_ITEM_SCHEMA),
    "muhurta": _s_arr(_MUHURTA_SCHEMA),
})


def _build_analysis_schema(relationship_status: str) -> dict:
    if relationship_status == "married":
        love_schema = _s_obj({
            "summary": _s_str(),
            "marital_outlook": _s_str(),
            "truths": _s_arr(_s_str()),
            "partner": _s_str(),
        })
    elif relationship_status == "separated":
        love_schema = _s_obj({
            "summary": _s_str(),
            "past_relationship_lessons": _s_str(),
            "moving_forward": _s_str(),
            "truths": _s_arr(_s_str()),
            "partner": _s_str(),
        })
    elif relationship_status == "widowed":
        love_schema = _s_obj({
            "summary": _s_str(),
            "grief_and_healing": _s_str(),
            "companionship_outlook": _s_str(),
            "truths": _s_arr(_s_str()),
            "partner": _s_str(),
        })
    else:
        love_schema = _s_obj({
            "summary": _s_str(),
            "marriage_windows": _s_arr(_s_obj({"period": _s_str(), "reason": _s_str()})),
            "truths": _s_arr(_s_str()),
            "partner": _s_str(),
        })
    return _s_obj({
        "soul_purpose": _s_str(),
        "overview": _s_arr(_s_str()),
        "dasha_analysis": _s_str(),
        "career": _CAREER_SCHEMA,
        "love": love_schema,
        "health": _HEALTH_SCHEMA,
        "wealth": _WEALTH_SCHEMA,
        "remedies": _s_arr(_REMEDY_SCHEMA),
    })


_MATCH_ANALYSIS_SCHEMA = _s_obj({
    "headline": _s_str(),
    "overall": _s_str(),
    "emotional_compatibility": _s_str(),
    "romantic_chemistry": _s_str(),
    "communication_values": _s_str(),
    "challenges": _s_arr(_s_str()),
    "strengths": _s_arr(_s_str()),
    "guidance": _s_arr(_s_str()),
    "remedies": _s_arr(_REMEDY_SCHEMA),
})


def get_ai_analysis(name, dob, time_, time_known, location, gender, focus,
                     occupation, marital_status, chart_text, chart, language="English") -> dict:
    """
    Send computed chart to Gemini for deep, expressive Jyotish analysis.
    Returns structured JSON analysis.
    """
    nak = chart["nakshatra"]
    dasha = chart["dasha"]
    _ms = marital_status.strip().lower()
    if _ms == "married":
        relationship_status = "married"
    elif _ms in ("separated/divorced", "separated", "divorced"):
        relationship_status = "separated"
    elif _ms == "widowed":
        relationship_status = "widowed"
    else:
        relationship_status = "unmarried"

    language_note = (
        f"\nWrite your ENTIRE response — every text value, every sentence — in {language}. "
        + (
            "Use warm, natural, everyday spoken Hindi (Devanagari script) — the way a well-read Indian "
            "astrologer would actually talk to a client, not stiff textbook Hindi and not Hinglish. "
            "Well-known Jyotish/Sanskrit words that Hindi speakers already use as-is (Mahadasha, "
            "Antardasha, Nakshatra, Lagna, Rashi, Dasha, etc.) may stay in their common form. "
            "IMPORTANT: only the string VALUES should be in Hindi — every JSON key must remain exactly "
            "as given in the schema below, in English, unchanged."
            if language.strip().lower().startswith("hin") else
            "Keep JSON keys exactly as given in the schema below, in English — only the string values "
            "change with the requested language."
        )
    )

    time_caveat = (
        ""
        if time_known else
        "\nIMPORTANT: The exact birth time is NOT known — the chart above uses an approximate "
        "time, so the Lagna (ascendant), house placements and D10 chart may shift with the true "
        "time and should be treated as indicative, not exact. Base soul_purpose, love, health and "
        "wealth insights primarily on the Moon sign, Nakshatra and Sun sign (which don't depend on "
        "exact time), and where you do use Lagna/house-based points, phrase them as tendencies "
        "rather than certainties. Do not claim precise Lagna-degree certainty anywhere."
    )

    mahadasha_block = "\n".join(
        f"  {'-> ' if m['current'] else '   '}{m['lord']} Mahadasha: {m['start']} - {m['end']}"
        for m in dasha["all_mahadashas"]
    )
    antardasha_block = "\n".join(
        f"  {'-> ' if a['current'] else '   '}{a['lord']} Antardasha: {a['start']} - {a['end']}"
        for a in dasha["antardashas"]
    )
    dasha_scaffold = (
        f"\nEXACT COMPUTED DASHA PERIODS for this chart (these are precise ephemeris-based dates, not "
        "estimates). EVERY date range you mention anywhere in your response — career.timeline, "
        "career.switch_timing, wealth.timeline, wealth.muhurta windows, marriage_windows, dasha_analysis — "
        "MUST be built ONLY from these exact periods or sub-ranges within them. Never invent a date range "
        "that falls outside this scaffold; this ensures the same chart always produces the same timeline "
        "windows.\n\nMahadasha timeline:\n{mahadasha_block}\n\nAntardasha sub-periods within the current "
        "{dasha_mahadasha} Mahadasha:\n{antardasha_block}"
    ).format(mahadasha_block=mahadasha_block, antardasha_block=antardasha_block, dasha_mahadasha=dasha["mahadasha"])

    life_stage_note = (
        f"\nThis person's current occupation/life-stage is: {occupation or 'unspecified'}. "
        "Tailor career language accordingly — e.g. for a Student, talk about streams/exams/higher "
        "study timing rather than job switches; for Unemployed, focus on when doors open and what "
        "to prepare during the wait; for Army/Government personnel, talk about postings, discipline "
        "houses (Saturn/Mars/10th) and promotion timing rather than generic 'switch jobs' advice; "
        "for Employed/Business, give concrete switch/growth timing; adapt naturally for any other "
        "occupation given."
    )

    if relationship_status == "married":
        love_instruction = (
            "This person is MARRIED. Do NOT predict a marriage timing/window — instead give a "
            "'marital_outlook' describing the current quality/phase of the marriage/partnership under "
            "the present Mahadasha-Antardasha (harmony, friction points, what nurtures the bond right now), "
            "written as 2-3 flowing sentences, not a one-liner."
        )
        love_schema = (
            '"love":{"summary":"2-3 sentence expressive read of the 7th house and Venus placement and what it says '
            'about this person\'s partnership style","marital_outlook":"2-3 sentence description of the current '
            'phase of the marriage under the active dasha — harmony/friction/growth, written expressively, no '
            'marriage-timing language","truths":["grounded hard truth 1, 1-2 sentences","hard truth 2, 1-2 sentences"],'
            '"partner":"reflection on the existing partner dynamic in 25-30 words"}'
        )
    elif relationship_status == "separated":
        love_instruction = (
            "This person is SEPARATED OR DIVORCED. Handle this with real sensitivity — do NOT predict a fresh "
            "marriage window as if this were their first marriage, and do not moralise about what went wrong. "
            "Give 'past_relationship_lessons': a compassionate, non-presumptuous 2-3 sentence reflection on "
            "what the dasha/house dynamics around a partnership like this tend to teach (framed as insight, "
            "not a diagnosis of their specific ex-spouse or blame). Then give 'moving_forward': 2-3 warm "
            "sentences on what the CURRENT dasha supports right now — whether it favours healing and rebuilding "
            "alone, or is opening toward new connection — phrased as an open possibility they can choose, never "
            "as a certainty or a push toward remarriage."
        )
        love_schema = (
            '"love":{"summary":"2-3 sentence expressive read of the 7th house and Venus placement and what it says '
            'about this person\'s partnership style","past_relationship_lessons":"2-3 sentence compassionate '
            'reflection as described above","moving_forward":"2-3 sentence warm read on the current dasha\'s '
            'openness to healing or new connection, framed as their choice","truths":["grounded hard truth 1, 1-2 '
            'sentences","hard truth 2, 1-2 sentences"],"partner":"what to look for if/when open to connection '
            'again, in 25-30 words"}'
        )
    elif relationship_status == "widowed":
        love_instruction = (
            "This person has LOST THEIR SPOUSE. Handle this with genuine warmth and care — this is not a dating "
            "or marriage-timing request. Give 'grief_and_healing': a gentle, grounding 2-3 sentence reflection "
            "tied to the current dasha on processing this loss and honouring the bond that was (never clinical "
            "or detached). Then give 'companionship_outlook': 2-3 sentences that GENTLY and OPTIONALLY note "
            "whether the current chart/dasha suggests openness to companionship again someday — framed entirely "
            "as their own choice and timeline, never presumptuous, never a hard prediction, and it is completely "
            "fine for this to say that this is not something to think about right now."
        )
        love_schema = (
            '"love":{"summary":"2-3 sentence expressive read of the 7th house and Venus placement and what it says '
            'about this person\'s capacity for partnership","grief_and_healing":"2-3 sentence compassionate '
            'reflection as described above","companionship_outlook":"2-3 gentle sentences as described above",'
            '"truths":["grounded, gentle truth 1, 1-2 sentences","gentle truth 2, 1-2 sentences"],'
            '"partner":"what genuine companionship could look like for them, in 25-30 words, gently framed"}'
        )
    else:
        love_instruction = (
            "This person is UNMARRIED. Provide TWO distinct plausible marriage windows (not just one), each "
            "tied to a specific dasha/antardasha period with reasoning for why that window is favourable "
            "(e.g. Venus/7th-lord dasha or transit alignment), as an array."
        )
        love_schema = (
            '"love":{"summary":"2-3 sentence expressive read of the 7th house and Venus placement and what it says '
            'about this person\'s partnership style","marriage_windows":[{"period":"dasha/age-range label","reason":'
            '"2 sentence reasoning tied to the actual dasha lords and houses"},{"period":"second window label",'
            '"reason":"2 sentence reasoning for this second window"}],"truths":["grounded hard truth 1, 1-2 '
            'sentences","hard truth 2, 1-2 sentences"],"partner":"ideal partner archetype in 25-30 words"}'
        )

    prompt = f"""You are a master Vedic Jyotishi (5th-generation classical astrologer) who is also a
genuinely warm human being — the kind of astrologer people go back to because talking to them feels like
a caring conversation, not a technical report. Speak directly to the person as "you". Never stack more
than one technical term in a single sentence — when you mention a placement (10th house, D10 lagna,
Antardasha, etc.), first say what it MEANS for their life in plain, relatable words, and only then, briefly,
name the technical reasoning behind it. Keep the poetic, mystical charm of classical Jyotish, but make sure
someone with zero astrology background walks away understanding exactly what you meant — no jargon-soup
sentences, no dry textbook phrasing.
{language_note}

I have computed this person's birth chart using Swiss Ephemeris with Lahiri ayanamsa.

Person: {name} | DOB: {dob} | Time: {time_ or "unknown"}{"" if time_known else " (approximate)"} | Location: {location} | Gender: {gender or "unspecified"} | Marital status: {marital_status}
{life_stage_note}

COMPUTED CHART (verified by ephemeris):
{chart_text}
{time_caveat}
{dasha_scaffold}

Nakshatra deity: {nak['deity']}
Focus area requested: {focus}

{love_instruction}

For "dasha_analysis": explain in 3-4 expressive sentences how the CURRENT {dasha['mahadasha']} Mahadasha
combined with the {dasha['antardasha']} Antardasha interact — are these two lords natural friends, neutral,
or enemies (reason briefly from their relationship), which houses they own/occupy in this chart, and
therefore whether this specific period leans favourable, mixed, or challenging, and in what area of life
it shows up most. Be specific to these two actual planets, not generic.

For "career.sectors": do NOT give generic sectors like "Technology, Finance, Consulting" — instead derive
2-3 sectors/roles specifically justified by the 10th house sign/lord, D10 lagna, and any planets placed
there in THIS chart, with a short reason for each.

For "remedies": avoid generic filler remedies. Each remedy must name the specific planet/dasha lord it
addresses in this chart and explain briefly WHY it's relevant to this person's specific placement/dosha,
not a one-size-fits-all suggestion.

For "wealth.muhurta": give 3 specific auspicious-window recommendations for money decisions — one each
for job/career switch, financial investment, and business launch/major purchase — every window MUST be
one of the exact periods from the dasha scaffold above (not vague "next few years" language), with a
one-line reason grounded in the 2nd/11th house lords or the dasha lord's nature.

For "career.timeline" and "wealth.timeline": every "period" label MUST be one of the exact Mahadasha or
Antardasha periods from the dasha scaffold above (e.g. "Jupiter Antardasha (May 2026 - Dec 2026)"), not a
freely invented date range. This guarantees the same chart always produces the same timeline windows.

Return ONLY a raw JSON object (no markdown, no backticks):

{{"soul_purpose":"Esoteric soul mission of {nak['name']} nakshatra for this specific chart, 30-40 words, expressive",
"overview":["expressive chart insight 1 specific to placements, 2 sentences","insight 2, 2 sentences","insight 3, 2 sentences"],
"dasha_analysis":"3-4 expressive sentences on the {dasha['mahadasha']}-{dasha['antardasha']} combination as described above",
"career":{{"summary":"2-3 expressive sentences using 10th house {chart['d1'].get('Sun','?')} and D10 lagna {chart['d10_lagna']}","strengths":["s1, 1 sentence","s2, 1 sentence"],"switch_timing":"2 sentence dasha-based timing advice, adapted to their occupation/life-stage","sectors":[{{"sector":"name","reason":"1 sentence reason tied to 10th house/D10"}},{{"sector":"name","reason":"1 sentence reason"}},{{"sector":"name","reason":"1 sentence reason"}}],"timeline":[{{"period":"label","desc":"2 sentence description"}},{{"period":"label","desc":"2 sentence description"}}]}},
{love_schema},
"health":{{"constitution":"Ayurvedic dosha based on lagna {chart['lagna']}, 1-2 sentences","vulnerabilities":["v1, 1 sentence","v2, 1 sentence"],"strengths":["s1, 1 sentence"],"watch":["dasha watch item 1, 1 sentence","item 2, 1 sentence"]}},
"wealth":{{"pattern":"one or two word trajectory","insights":["wealth insight 1 using 2nd/11th house, 2 sentences","insight 2, 2 sentences"],"timeline":[{{"period":"label","desc":"2 sentence description"}},{{"period":"label","desc":"2 sentence description"}}],"muhurta":[{{"type":"Career switch","window":"dasha/antardasha label with rough dates","reason":"1 sentence reason"}},{{"type":"Investment","window":"dasha/antardasha label with rough dates","reason":"1 sentence reason"}},{{"type":"Business launch / major purchase","window":"dasha/antardasha label with rough dates","reason":"1 sentence reason"}}]}},
"remedies":[{{"icon":"🪬","title":"Mantra","desc":"specific mantra for {dasha['mahadasha']} mahadasha, with why it applies to this chart"}},{{"icon":"💎","title":"Gemstone","desc":"gemstone tied to a specific weak/afflicted placement in this chart, with wearing instructions and why"}},{{"icon":"📿","title":"Practice","desc":"behavioral remedy tied to {nak['name']} nakshatra and this person's specific challenge"}},{{"icon":"🌙","title":"Moon remedy","desc":"Moon pacification for {chart['rashi']} rashi, explained for this chart"}}]}}"""

    system_prompt = ("You are a warm, down-to-earth Vedic astrologer who talks to people like a trusted "
                      "friend, never like a textbook. Every sentence should be immediately understandable "
                      "to someone with zero astrology background, while keeping the mystical charm of "
                      "classical Jyotish. Return ONLY raw JSON. No markdown, no backticks, no text outside "
                      "the JSON.")

    return _gemini_json(prompt, system_prompt, max_tokens=8192,
                         response_schema=_build_analysis_schema(relationship_status))


def get_match_analysis(boy_name, girl_name, boy_chart, girl_chart, guna, mangal_note, language="English") -> dict:
    """
    Send both computed charts + the Ashta Koota score to Gemini for an expressive
    compatibility narrative (synastry-style), grounded in the actual numbers.
    """
    koota_lines = "\n".join(
        f"  {k['name']}: {k['points']}/{k['max']} — {k['note']}" for k in guna["kootas"]
    )
    dosha_lines = "\n".join(f"  - {d}" for d in guna["doshas"]) or "  None"

    language_note = (
        f"Write your ENTIRE response — every text value — in {language}. "
        + (
            "Use warm, natural, everyday spoken Hindi (Devanagari script), not stiff textbook Hindi and "
            "not Hinglish. Well-known Jyotish/Sanskrit words already used in everyday Hindi (Mahadasha, "
            "Nakshatra, Lagna, Rashi, Guna Milan, etc.) may stay as-is. Only the string VALUES change "
            "language — every JSON key must remain exactly as given in the schema below, in English."
            if language.strip().lower().startswith("hin") else
            "Keep JSON keys exactly as given in the schema below, in English — only the string values "
            "change with the requested language."
        )
    )

    prompt = f"""You are a master Vedic Jyotishi specialising in marriage compatibility (Ashta Koota / synastry),
and also a warm human being — the reading should feel like a caring conversation with someone who wants this
couple to genuinely understand each other, not a dry technical scorecard. Speak in plain, relatable language;
when you cite a technical term (koota name, dosha, planet), briefly say what it MEANS for the couple before
or after naming it, never several technical terms stacked with no plain-language anchor. Keep the warmth and
honesty — never flat one-liners.
{language_note}

GROOM: {boy_name} — Lagna {boy_chart['lagna']}, Moon sign (Rashi) {boy_chart['rashi']}, Moon Nakshatra {boy_chart['nakshatra']['name']} pada {boy_chart['nakshatra']['pada']}, Sun sign {boy_chart['sun_sign']}, 7th house sign {boy_chart['d1'].get('Venus','?')}, Venus in {boy_chart['d1'].get('Venus','?')}, Mars in {boy_chart['d1'].get('Mars','?')} (house {boy_chart['house_of'].get('Mars','?')}), current Mahadasha {boy_chart['dasha']['mahadasha']}.

BRIDE: {girl_name} — Lagna {girl_chart['lagna']}, Moon sign (Rashi) {girl_chart['rashi']}, Moon Nakshatra {girl_chart['nakshatra']['name']} pada {girl_chart['nakshatra']['pada']}, Sun sign {girl_chart['sun_sign']}, 7th house sign {girl_chart['d1'].get('Venus','?')}, Venus in {girl_chart['d1'].get('Venus','?')}, Mars in {girl_chart['d1'].get('Mars','?')} (house {girl_chart['house_of'].get('Mars','?')}), current Mahadasha {girl_chart['dasha']['mahadasha']}.

COMPUTED ASHTA KOOTA GUNA MILAN (verified arithmetic, do not recompute or contradict these numbers):
Total: {guna['total']}/{guna['max']}
{koota_lines}
Doshas found:
{dosha_lines}

Mangal Dosha check: {mangal_note}

Using this EXACT computed data, write a compatibility analysis. Ground every claim in the actual placements
and guna score above — do not invent different numbers. Return ONLY a raw JSON object (no markdown, no backticks):

{{"headline":"1 punchy sentence overall verdict, warm but honest, referencing the {guna['total']}/36 score",
"overall":"3-4 expressive sentences synthesising the guna score, doshas and both Moon signs/nakshatras into an overall relationship read",
"emotional_compatibility":"2-3 sentences on Moon-sign/nakshatra emotional temperament match between them",
"romantic_chemistry":"2-3 sentences on Venus-Mars synastry between the two charts — attraction, chemistry, physical/romantic dynamic",
"communication_values":"2-3 sentences on Graha Maitri/Varna results and what that says about shared values, worldview and how they'll communicate day to day",
"challenges":["specific friction point 1 tied to a dosha or weak koota above, 1-2 sentences","specific friction point 2, 1-2 sentences"],
"strengths":["specific strength 1 tied to a strong koota above, 1-2 sentences","specific strength 2, 1-2 sentences"],
"guidance":["practical guidance item 1 for this specific pairing, 1-2 sentences","practical guidance item 2, 1-2 sentences","practical guidance item 3, 1-2 sentences"],
"remedies":[{{"icon":"🪬","title":"remedy title","desc":"remedy tied to the specific dosha found above (Nadi/Bhakoot/Mangal), or 'None needed' framing if no dosha exists"}}]}}"""

    system_prompt = ("You are a warm, down-to-earth Vedic astrologer specialising in marriage synastry. "
                      "Every sentence should be immediately understandable to someone with zero astrology "
                      "background, grounded in the exact computed data given, while keeping genuine warmth "
                      "and honesty. Return ONLY raw JSON. No markdown, no backticks, no text outside the JSON.")

    return _gemini_json(prompt, system_prompt, max_tokens=4096, response_schema=_MATCH_ANALYSIS_SCHEMA)


# ── Dev server ────────────────────────────────────────────────────

if __name__ == "__main__":
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        print("\n⚠️  WARNING: GEMINI_API_KEY not set in .env file")
        print("   Chart calculations will work but AI analysis will fail.\n")
    else:
        print(f"\n✓ API key loaded ({api_key[:12]}...)")

    print("🔭 Starting Vedic Kundali App...")
    print("📡 Open your browser at: http://localhost:5000\n")
    app.run(debug=True, port=5000, host="0.0.0.0")
