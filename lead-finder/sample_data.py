"""Sample businesses for demo mode.

Used when the OpenStreetMap APIs are unreachable (offline demos, restricted
networks) or when the app is launched with ?demo=1. The records mimic the
shape of Overpass API elements so the exact same scoring pipeline runs.
"""

SAMPLE_LOCATION = "Demo City (sample data)"

SAMPLE_ELEMENTS = [
    {"type": "node", "id": 1, "lat": 30.2672, "lon": -97.7431, "tags": {
        "name": "Brightline Marketing Group", "office": "marketing",
        "email": "hello@brightlinemkt.example", "website": "https://brightlinemkt.example",
        "phone": "+1 555 0101", "opening_hours": "Mo-Fr 09:00-17:00"}},
    {"type": "node", "id": 2, "lat": 30.2665, "lon": -97.7420, "tags": {
        "name": "Hilltop Realty Partners", "office": "estate_agent",
        "website": "https://hilltoprealty.example", "phone": "+1 555 0102",
        "opening_hours": "Mo-Sa 09:00-18:00", "operator": "Hilltop Group"}},
    {"type": "node", "id": 3, "lat": 30.2690, "lon": -97.7445, "tags": {
        "name": "Ironworks Fitness", "leisure": "fitness_centre",
        "email": "frontdesk@ironworksfit.example", "website": "https://ironworksfit.example",
        "phone": "+1 555 0103", "opening_hours": "24/7"}},
    {"type": "node", "id": 4, "lat": 30.2650, "lon": -97.7410, "tags": {
        "name": "Lakeview Dental Care", "amenity": "dentist",
        "website": "https://lakeviewdental.example", "phone": "+1 555 0104",
        "addr:street": "Main St", "addr:housenumber": "410", "addr:city": "Demo City"}},
    {"type": "node", "id": 5, "lat": 30.2701, "lon": -97.7460, "tags": {
        "name": "Summit Insurance Brokers", "office": "insurance",
        "email": "contact@summitins.example", "phone": "+1 555 0105"}},
    {"type": "node", "id": 6, "lat": 30.2640, "lon": -97.7400, "tags": {
        "name": "Cedar & Sage Bistro", "amenity": "restaurant",
        "website": "https://cedarsage.example", "phone": "+1 555 0106",
        "opening_hours": "Tu-Su 11:00-22:00"}},
    {"type": "node", "id": 7, "lat": 30.2710, "lon": -97.7470, "tags": {
        "name": "Precision Auto Group", "shop": "car",
        "website": "https://precisionauto.example", "phone": "+1 555 0107",
        "brand": "Precision", "opening_hours": "Mo-Sa 08:00-19:00"}},
    {"type": "node", "id": 8, "lat": 30.2630, "lon": -97.7390, "tags": {
        "name": "Beacon Accounting & Tax", "office": "accountant",
        "email": "info@beaconcpa.example", "website": "https://beaconcpa.example",
        "phone": "+1 555 0108"}},
    {"type": "node", "id": 9, "lat": 30.2685, "lon": -97.7455, "tags": {
        "name": "Nordic Sleep Hotel", "tourism": "hotel",
        "website": "https://nordicsleep.example", "phone": "+1 555 0109",
        "brand": "Nordic Sleep", "operator": "Nordic Hospitality"}},
    {"type": "node", "id": 10, "lat": 30.2655, "lon": -97.7425, "tags": {
        "name": "GreenCart Grocers", "shop": "supermarket",
        "website": "https://greencart.example", "opening_hours": "Mo-Su 07:00-22:00",
        "brand": "GreenCart"}},
    {"type": "node", "id": 11, "lat": 30.2695, "lon": -97.7440, "tags": {
        "name": "Riverbend Family Clinic", "amenity": "clinic",
        "email": "appointments@riverbendclinic.example",
        "website": "https://riverbendclinic.example", "phone": "+1 555 0111"}},
    {"type": "node", "id": 12, "lat": 30.2660, "lon": -97.7415, "tags": {
        "name": "Atlas Staffing Solutions", "office": "employment_agency",
        "website": "https://atlasstaffing.example", "phone": "+1 555 0112"}},
    {"type": "node", "id": 13, "lat": 30.2675, "lon": -97.7435, "tags": {
        "name": "Corner Bean Coffee", "amenity": "cafe",
        "phone": "+1 555 0113", "opening_hours": "Mo-Su 06:30-15:00"}},
    {"type": "node", "id": 14, "lat": 30.2645, "lon": -97.7405, "tags": {
        "name": "Vantage IT Services", "office": "it",
        "email": "sales@vantageit.example", "website": "https://vantageit.example",
        "phone": "+1 555 0114"}},
    {"type": "node", "id": 15, "lat": 30.2705, "lon": -97.7465, "tags": {
        "name": "Bloom & Thread Boutique", "shop": "clothes",
        "website": "https://bloomthread.example"}},
    {"type": "node", "id": 16, "lat": 30.2668, "lon": -97.7428, "tags": {
        "name": "First Meridian Bank", "amenity": "bank",
        "website": "https://firstmeridian.example", "phone": "+1 555 0116",
        "brand": "First Meridian", "opening_hours": "Mo-Fr 09:00-17:00"}},
    {"type": "node", "id": 17, "lat": 30.2688, "lon": -97.7448, "tags": {
        "name": "Oak Hill Veterinary Hospital", "amenity": "veterinary",
        "website": "https://oakhillvet.example", "phone": "+1 555 0117"}},
    {"type": "node", "id": 18, "lat": 30.2652, "lon": -97.7412, "tags": {
        "name": "Daily Rise Bakery", "shop": "bakery", "phone": "+1 555 0118",
        "opening_hours": "Tu-Su 07:00-14:00"}},
    {"type": "node", "id": 19, "lat": 30.2698, "lon": -97.7458, "tags": {
        "name": "Keystone Legal Group", "office": "lawyer",
        "website": "https://keystonelegal.example", "phone": "+1 555 0119"}},
    {"type": "node", "id": 20, "lat": 30.2662, "lon": -97.7422, "tags": {
        "name": "Velocity Language Academy", "amenity": "language_school",
        "email": "enroll@velocitylang.example", "website": "https://velocitylang.example"}},
]
