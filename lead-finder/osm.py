"""OpenStreetMap clients: Nominatim (geocoding) and Overpass (business search).

Both services are free and need no API key. Be a good citizen: send a real
User-Agent and keep request volume low (Nominatim asks for max 1 req/sec).
"""

import requests

USER_AGENT = "cosmo-lead-finder/1.0 (freelance data-analyst lead finder; educational project)"

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OVERPASS_URL = "https://overpass-api.de/api/interpreter"


class LocationNotFound(Exception):
    pass


def geocode(location):
    """Turn a free-text location into (lat, lon, display_name)."""
    resp = requests.get(
        NOMINATIM_URL,
        params={"q": location, "format": "json", "limit": 1},
        headers={"User-Agent": USER_AGENT},
        timeout=15,
    )
    resp.raise_for_status()
    results = resp.json()
    if not results:
        raise LocationNotFound(f"Could not find location: {location!r}")
    hit = results[0]
    return float(hit["lat"]), float(hit["lon"]), hit["display_name"]


def find_businesses(lat, lon, radius_m):
    """Fetch nearby businesses in analyst-relevant categories from Overpass."""
    around = f"(around:{int(radius_m)},{lat},{lon})"
    query = f"""
    [out:json][timeout:40];
    (
      nwr{around}[office][name];
      nwr{around}[shop][name];
      nwr{around}[craft][name];
      nwr{around}[leisure~"^(fitness_centre|sports_centre)$"][name];
      nwr{around}[tourism~"^(hotel|guest_house)$"][name];
      nwr{around}[amenity~"^(clinic|dentist|doctors|veterinary|pharmacy|hospital|restaurant|cafe|bar|fast_food|bank|driving_school|language_school|dancing_school|gym)$"][name];
    );
    out center tags 600;
    """
    resp = requests.post(
        OVERPASS_URL,
        data={"data": query},
        headers={"User-Agent": USER_AGENT},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json().get("elements", [])
