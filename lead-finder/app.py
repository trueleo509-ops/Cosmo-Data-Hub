"""Lead Finder - find and rank cold-outreach targets for a freelance data analyst.

Run with:  python app.py   then open http://localhost:5000

Data comes from OpenStreetMap (Nominatim for geocoding, Overpass for nearby
businesses) - free, no API keys. If those services are unreachable, the API
falls back to bundled sample data so the app still demos offline.
"""

import requests
from flask import Flask, jsonify, request, send_from_directory

import osm
import scoring
from sample_data import SAMPLE_ELEMENTS, SAMPLE_LOCATION

app = Flask(__name__, static_folder="static", static_url_path="")

RADIUS_CHOICES_M = {"2": 2000, "5": 5000, "10": 10000, "25": 25000}
MAX_RESULTS = 50


@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/api/leads")
def leads():
    location = (request.args.get("location") or "").strip()
    radius_m = RADIUS_CHOICES_M.get(request.args.get("radius", "5"), 5000)
    demo = request.args.get("demo") == "1"

    if not demo and not location:
        return jsonify({"error": "Please enter a location."}), 400

    if demo:
        return _respond(SAMPLE_ELEMENTS, SAMPLE_LOCATION, demo=True)

    try:
        lat, lon, display_name = osm.geocode(location)
        elements = osm.find_businesses(lat, lon, radius_m)
    except osm.LocationNotFound as exc:
        return jsonify({"error": str(exc)}), 404
    except requests.RequestException:
        # OSM unreachable (offline / restricted network): degrade to demo data
        # rather than a dead page, and tell the UI so it can show a banner.
        return _respond(SAMPLE_ELEMENTS, SAMPLE_LOCATION, demo=True,
                        notice="OpenStreetMap could not be reached, showing sample data instead.")

    return _respond(elements, display_name)


def _respond(elements, resolved_location, demo=False, notice=None):
    ranked = scoring.rank_leads(elements, limit=MAX_RESULTS)
    return jsonify({
        "resolved_location": resolved_location,
        "demo": demo,
        "notice": notice,
        "count": len(ranked),
        "leads": ranked,
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
