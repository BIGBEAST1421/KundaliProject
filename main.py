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
gemini_model = genai.GenerativeModel("gemini-3.6-flash")


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
            chart=chart
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


def _gemini_json(prompt: str, system_prompt: str, max_tokens: int = 4096) -> dict:
    """Call Gemini and parse its reply as JSON, tolerating minor formatting noise."""
    response = gemini_model.generate_content(
        f"{system_prompt}\n\n{prompt}",
        generation_config={"max_output_tokens": max_tokens},
    )
    raw = response.text.strip().replace("```json", "").replace("```", "")
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        import re
        match = re.search(r'\{[\s\S]*\}', raw)
        if match:
            return json.loads(match.group())
        return {"error": "Analysis parse failed", "raw": raw[:500]}


def get_ai_analysis(name, dob, time_, time_known, location, gender, focus,
                     occupation, marital_status, chart_text, chart) -> dict:
    """
    Send computed chart to Gemini for deep, expressive Jyotish analysis.
    Returns structured JSON analysis.
    """
    nak = chart["nakshatra"]
    dasha = chart["dasha"]
    is_married = marital_status.strip().lower() == "married"

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

    life_stage_note = (
        f"\nThis person's current occupation/life-stage is: {occupation or 'unspecified'}. "
        "Tailor career language accordingly — e.g. for a Student, talk about streams/exams/higher "
        "study timing rather than job switches; for Unemployed, focus on when doors open and what "
        "to prepare during the wait; for Army/Government personnel, talk about postings, discipline "
        "houses (Saturn/Mars/10th) and promotion timing rather than generic 'switch jobs' advice; "
        "for Employed/Business, give concrete switch/growth timing; adapt naturally for any other "
        "occupation given."
    )

    if is_married:
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

    prompt = f"""You are a master Vedic Jyotishi (5th-generation classical astrologer) known for warm,
expressive, narrative readings — never flat one-liners. Write like you're speaking to the person, with
texture and specific reasoning drawn from their actual placements, not generic textbook filler.

I have computed this person's birth chart using Swiss Ephemeris with Lahiri ayanamsa.

Person: {name} | DOB: {dob} | Time: {time_ or "unknown"}{"" if time_known else " (approximate)"} | Location: {location} | Gender: {gender or "unspecified"} | Marital status: {marital_status}
{life_stage_note}

COMPUTED CHART (verified by ephemeris):
{chart_text}
{time_caveat}

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
for job/career switch, financial investment, and business launch/major purchase — every one tied to an
actual upcoming or current dasha/antardasha period from THIS chart's timeline (not vague "next few years"
language), with a one-line reason grounded in the 2nd/11th house lords or the dasha lord's nature.

Return ONLY a raw JSON object (no markdown, no backticks):

{{"soul_purpose":"Esoteric soul mission of {nak['name']} nakshatra for this specific chart, 30-40 words, expressive",
"overview":["expressive chart insight 1 specific to placements, 2 sentences","insight 2, 2 sentences","insight 3, 2 sentences"],
"dasha_analysis":"3-4 expressive sentences on the {dasha['mahadasha']}-{dasha['antardasha']} combination as described above",
"career":{{"summary":"2-3 expressive sentences using 10th house {chart['d1'].get('Sun','?')} and D10 lagna {chart['d10_lagna']}","strengths":["s1, 1 sentence","s2, 1 sentence"],"switch_timing":"2 sentence dasha-based timing advice, adapted to their occupation/life-stage","sectors":[{{"sector":"name","reason":"1 sentence reason tied to 10th house/D10"}},{{"sector":"name","reason":"1 sentence reason"}},{{"sector":"name","reason":"1 sentence reason"}}],"timeline":[{{"period":"label","desc":"2 sentence description"}},{{"period":"label","desc":"2 sentence description"}}]}},
{love_schema},
"health":{{"constitution":"Ayurvedic dosha based on lagna {chart['lagna']}, 1-2 sentences","vulnerabilities":["v1, 1 sentence","v2, 1 sentence"],"strengths":["s1, 1 sentence"],"watch":["dasha watch item 1, 1 sentence","item 2, 1 sentence"]}},
"wealth":{{"pattern":"one or two word trajectory","insights":["wealth insight 1 using 2nd/11th house, 2 sentences","insight 2, 2 sentences"],"timeline":[{{"period":"label","desc":"2 sentence description"}},{{"period":"label","desc":"2 sentence description"}}],"muhurta":[{{"type":"Career switch","window":"dasha/antardasha label with rough dates","reason":"1 sentence reason"}},{{"type":"Investment","window":"dasha/antardasha label with rough dates","reason":"1 sentence reason"}},{{"type":"Business launch / major purchase","window":"dasha/antardasha label with rough dates","reason":"1 sentence reason"}}]}},
"remedies":[{{"icon":"🪬","title":"Mantra","desc":"specific mantra for {dasha['mahadasha']} mahadasha, with why it applies to this chart"}},{{"icon":"💎","title":"Gemstone","desc":"gemstone tied to a specific weak/afflicted placement in this chart, with wearing instructions and why"}},{{"icon":"📿","title":"Practice","desc":"behavioral remedy tied to {nak['name']} nakshatra and this person's specific challenge"}},{{"icon":"🌙","title":"Moon remedy","desc":"Moon pacification for {chart['rashi']} rashi, explained for this chart"}}]}}"""

    system_prompt = ("You are a classical Vedic astrologer who writes warm, specific, expressive readings — "
                      "never generic one-liners. Return ONLY raw JSON. No markdown, no backticks, no text outside the JSON.")

    return _gemini_json(prompt, system_prompt, max_tokens=8192)


def get_match_analysis(boy_name, girl_name, boy_chart, girl_chart, guna, mangal_note) -> dict:
    """
    Send both computed charts + the Ashta Koota score to Gemini for an expressive
    compatibility narrative (synastry-style), grounded in the actual numbers.
    """
    koota_lines = "\n".join(
        f"  {k['name']}: {k['points']}/{k['max']} — {k['note']}" for k in guna["kootas"]
    )
    dosha_lines = "\n".join(f"  - {d}" for d in guna["doshas"]) or "  None"

    prompt = f"""You are a master Vedic Jyotishi specialising in marriage compatibility (Ashta Koota / synastry).
Write an expressive, warm, honest compatibility reading — never flat one-liners.

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

    system_prompt = ("You are a classical Vedic astrologer specialising in marriage synastry, writing warm, "
                      "specific, expressive readings grounded in the exact computed data given. Return ONLY "
                      "raw JSON. No markdown, no backticks, no text outside the JSON.")

    return _gemini_json(prompt, system_prompt, max_tokens=4096)


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
