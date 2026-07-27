"""Lead scoring for freelance data-analyst outreach.

Each business found near the user's location gets a score out of 100 built
from three ingredients:

1. Category fit  (up to 50 pts) - how much a business of this type tends to
   sit on unused data (sales, bookings, patients, inventory, campaigns...).
2. Contactability (up to 35 pts) - cold outreach is only worth ranking if
   you can actually reach someone: email beats a contact form, a website
   beats nothing, a phone number helps.
3. Scale signals  (up to 15 pts) - chains/brands and businesses that keep
   their listing well-maintained tend to be bigger and more professional,
   which usually means more data and more budget.
"""

# ---------------------------------------------------------------------------
# Category fit: (score, pitch angle shown to the user)
# Keys are (osm_key, osm_value). A value of "*" matches any value of that key.
# ---------------------------------------------------------------------------

CATEGORY_FIT = {
    # Offices - the strongest fits: they live and die by numbers
    ("office", "marketing"): (50, "Marketing agencies juggle campaign data across clients and often lack an in-house analyst"),
    ("office", "advertising_agency"): (50, "Ad agencies need campaign performance reporting they rarely staff for"),
    ("office", "estate_agent"): (46, "Real-estate agencies sit on pricing, listing and market data ripe for analysis"),
    ("office", "insurance"): (42, "Insurance brokers handle risk and claims data but small offices rarely analyse it"),
    ("office", "financial"): (42, "Financial services firms need reporting and forecasting support"),
    ("office", "financial_advisor"): (42, "Financial advisors need client portfolio reporting and market analysis"),
    ("office", "accountant"): (40, "Accounting firms can upsell analytics to their own clients - a partner, not just a client"),
    ("office", "employment_agency"): (40, "Recruiters track placement funnels and time-to-hire metrics"),
    ("office", "it"): (36, "IT firms often get asked for analytics work they'd rather subcontract"),
    ("office", "consulting"): (36, "Consultancies subcontract data work during busy engagements"),
    ("office", "lawyer"): (28, "Law firms track billable hours and case loads but rarely analyse them"),
    ("office", "company"): (30, "A generic company office - worth a look, could be anything"),
    ("office", "coworking"): (26, "Coworking spaces are full of startups - one pitch, many potential clients"),
    ("office", "*"): (22, "An office-based business - may have operational data worth analysing"),

    # Health - appointment, patient-flow and billing data
    ("amenity", "clinic"): (44, "Clinics have appointment, no-show and billing data that drives real money"),
    ("amenity", "dentist"): (42, "Dental practices lose money to no-shows - an easy, concrete pitch"),
    ("amenity", "doctors"): (42, "Medical practices need patient-flow and scheduling analysis"),
    ("amenity", "veterinary"): (38, "Vet clinics track appointments and inventory like any clinic"),
    ("amenity", "pharmacy"): (34, "Pharmacies manage inventory and prescription volumes"),
    ("amenity", "hospital"): (30, "Hospitals have data teams, but departments often need extra hands"),

    # Fitness & leisure - membership churn is a classic freelance project
    ("leisure", "fitness_centre"): (44, "Gyms live on membership retention - churn analysis sells itself"),
    ("leisure", "sports_centre"): (36, "Sports centres juggle bookings, memberships and utilisation"),
    ("amenity", "gym"): (44, "Gyms live on membership retention - churn analysis sells itself"),

    # Hospitality - occupancy, pricing, reviews
    ("tourism", "hotel"): (42, "Hotels need occupancy, pricing and review analysis"),
    ("tourism", "guest_house"): (34, "Guest houses compete on pricing and reviews - small but real analytics needs"),
    ("amenity", "restaurant"): (30, "Restaurants sit on POS data - menu engineering and staffing analysis"),
    ("amenity", "cafe"): (24, "Cafes have POS data; chains especially benefit from sales analysis"),
    ("amenity", "bar"): (24, "Bars track sales by hour and product - staffing and stock insights"),
    ("amenity", "fast_food"): (26, "Fast-food outlets run on throughput metrics"),

    # Retail & trade - inventory, sales, foot traffic
    ("shop", "car"): (40, "Car dealerships track inventory turn and sales pipelines - high ticket, real budgets"),
    ("shop", "car_repair"): (32, "Garages manage job scheduling and parts inventory"),
    ("shop", "supermarket"): (36, "Supermarkets are pure inventory-and-margin analytics"),
    ("shop", "electronics"): (32, "Electronics retailers fight on margins and stock turns"),
    ("shop", "furniture"): (32, "Furniture stores have long sales cycles worth analysing"),
    ("shop", "clothes"): (30, "Fashion retail runs on seasonality and sell-through analysis"),
    ("shop", "jewelry"): (28, "High-ticket retail with inventory and customer analytics needs"),
    ("shop", "bicycle"): (26, "Specialty retail - inventory and seasonal demand analysis"),
    ("shop", "hardware"): (28, "Hardware stores manage deep inventories"),
    ("shop", "doityourself"): (28, "DIY stores manage deep inventories"),
    ("shop", "bakery"): (24, "Bakeries balance production planning against waste - a neat data problem"),
    ("shop", "convenience"): (20, "Convenience stores have POS data, though budgets are usually small"),
    ("shop", "*"): (22, "A retail business - POS and inventory data are usually present"),

    # Other services
    ("amenity", "driving_school"): (28, "Driving schools track bookings, pass rates and instructor utilisation"),
    ("amenity", "language_school"): (30, "Language schools track enrolment and retention"),
    ("amenity", "dancing_school"): (26, "Class-based businesses track enrolment and attendance"),
    ("amenity", "bank"): (24, "Bank branches rarely buy freelance work, but business bankers make referrals"),
    ("craft", "*"): (24, "A craft/trade business - job scheduling and quoting data"),
}

# Lowest category score that still makes the results list. Anything matched
# by a wildcard but scoring under this is noise for outreach purposes.
MIN_CATEGORY_SCORE = 20

# ---------------------------------------------------------------------------
# Contactability
# ---------------------------------------------------------------------------

EMAIL_PTS = 20    # a direct email is gold for cold outreach
WEBSITE_PTS = 10  # a website means you can find a contact form / person
PHONE_PTS = 5     # a phone number is a fallback channel

# ---------------------------------------------------------------------------
# Scale / professionalism signals
# ---------------------------------------------------------------------------

BRAND_PTS = 8          # part of a chain: more locations, more data, more budget
OPENING_HOURS_PTS = 4  # a maintained listing suggests an organised business
OPERATOR_PTS = 3       # an operator tag often indicates a larger organisation


def category_fit(tags):
    """Return (points, reason) for the best-matching category, or None."""
    best = None
    for key in ("office", "amenity", "shop", "leisure", "tourism", "craft"):
        value = tags.get(key)
        if not value:
            continue
        hit = CATEGORY_FIT.get((key, value)) or CATEGORY_FIT.get((key, "*"))
        if hit and (best is None or hit[0] > best[0]):
            best = hit
    return best


def extract_contact(tags):
    """Pull contact channels out of OSM tags (both plain and contact: forms)."""
    def first(*names):
        for n in names:
            v = tags.get(n)
            if v:
                return v.split(";")[0].strip()
        return None

    return {
        "email": first("email", "contact:email"),
        "website": first("website", "contact:website", "url"),
        "phone": first("phone", "contact:phone"),
    }


def score_business(tags):
    """Score one business from its OSM tags.

    Returns a dict with score, contact info and human-readable reasons,
    or None if the business isn't a plausible lead (no name, or a category
    with no realistic need for a data analyst).
    """
    name = tags.get("name")
    if not name:
        return None  # unnamed map objects aren't outreach targets

    fit = category_fit(tags)
    if not fit or fit[0] < MIN_CATEGORY_SCORE:
        return None

    fit_pts, fit_reason = fit
    contact = extract_contact(tags)
    reasons = [fit_reason]
    score = fit_pts

    if contact["email"]:
        score += EMAIL_PTS
        reasons.append("Direct email listed - you can reach a real inbox")
    if contact["website"]:
        score += WEBSITE_PTS
        reasons.append("Has a website - research them and find the right contact")
    if contact["phone"]:
        score += PHONE_PTS
        reasons.append("Phone number available as a fallback channel")
    if not (contact["email"] or contact["website"] or contact["phone"]):
        reasons.append("No contact info listed - you'd need to research or visit")

    if tags.get("brand"):
        score += BRAND_PTS
        reasons.append("Part of a chain/brand - likely more locations and more data")
    if tags.get("opening_hours"):
        score += OPENING_HOURS_PTS
    if tags.get("operator"):
        score += OPERATOR_PTS

    category_key = None
    for key in ("office", "amenity", "shop", "leisure", "tourism", "craft"):
        if tags.get(key):
            category_key = f"{key}={tags[key]}"
            break

    return {
        "name": name,
        "category": category_key,
        "category_label": _pretty_category(tags),
        "score": min(score, 100),
        "email": contact["email"],
        "website": contact["website"],
        "phone": contact["phone"],
        "address": _format_address(tags),
        "reasons": reasons,
    }


def rank_leads(elements, limit=50):
    """Score raw Overpass elements and return the top leads, best first."""
    seen = set()
    leads = []
    for el in elements:
        tags = el.get("tags", {})
        lead = score_business(tags)
        if not lead:
            continue
        # Overpass returns nodes AND the ways/relations that contain them;
        # de-duplicate on (name, category) so a business appears once.
        dedup_key = (lead["name"].lower(), lead["category"])
        if dedup_key in seen:
            continue
        seen.add(dedup_key)

        lat = el.get("lat") or el.get("center", {}).get("lat")
        lon = el.get("lon") or el.get("center", {}).get("lon")
        lead["lat"], lead["lon"] = lat, lon
        leads.append(lead)

    leads.sort(key=lambda l: l["score"], reverse=True)
    return leads[:limit]


def _pretty_category(tags):
    for key in ("office", "amenity", "shop", "leisure", "tourism", "craft"):
        value = tags.get(key)
        if value:
            label = "IT" if value == "it" else value.replace("_", " ").title()
            prefix = {"shop": "Shop: ", "office": "Office: ", "craft": "Craft: "}.get(key, "")
            return f"{prefix}{label}"
    return "Business"


def _format_address(tags):
    parts = [
        " ".join(filter(None, [tags.get("addr:housenumber"), tags.get("addr:street")])),
        tags.get("addr:city"),
        tags.get("addr:postcode"),
    ]
    return ", ".join(p for p in parts if p) or None
