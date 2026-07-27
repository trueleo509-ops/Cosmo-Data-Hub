# Lead Finder

A web app that finds **cold-outreach targets for a freelance data analyst**.
Enter your location, get back a ranked list of nearby businesses most likely
to need (and pay for) data analysis work — with contact info, a score out of
100, the reasoning behind each score, and one-click CSV export.

No API keys required: business data comes from OpenStreetMap
([Nominatim](https://nominatim.org/) for geocoding,
[Overpass API](https://overpass-api.de/) for business search).

## Quick start

```bash
cd lead-finder
pip install -r requirements.txt
python app.py
```

Then open <http://localhost:5000>, type a location (e.g. `Austin, TX`),
pick a radius, and hit **Find leads**.

No internet? Click **Try demo** to explore the app with bundled sample data.
The API also falls back to sample data automatically if OpenStreetMap can't
be reached, so the app never dead-ends.

## How leads are ranked

Every nearby business gets a score out of 100:

| Ingredient | Max pts | What it measures |
|---|---|---|
| **Category fit** | 50 | How much this type of business tends to sit on unused data. Marketing agencies, real-estate offices, clinics, gyms and car dealerships rank high; a corner cafe ranks low. |
| **Contactability** | 35 | Cold outreach needs a channel: a listed email is worth the most (20), then a website (10), then a phone number (5). |
| **Scale signals** | 15 | Chain/brand membership, an operator tag, and a maintained listing suggest a bigger, more organised business — more data, more budget. |

Each lead card explains *why* it scored what it did, so the ranking doubles
as a pitch-angle cheat sheet (e.g. *"Gyms live on membership retention —
churn analysis sells itself"*).

## Project layout

| File | Purpose |
|---|---|
| `app.py` | Flask server + `/api/leads` endpoint |
| `scoring.py` | The ranking engine (pure functions, unit-tested) |
| `osm.py` | Nominatim + Overpass API clients |
| `sample_data.py` | Bundled businesses for demo/offline mode |
| `static/` | Frontend (HTML/CSS/JS, no build step) |
| `test_scoring.py` | Unit tests — run `python -m pytest` |

## Notes & etiquette

- Nominatim and Overpass are free community services: keep request volume
  low (the app sends a descriptive User-Agent and one request per search).
- OSM contact data can be incomplete — treat the list as a starting point
  for research, not a finished outreach list.
- Business data © OpenStreetMap contributors.
