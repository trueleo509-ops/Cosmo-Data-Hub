"""Unit tests for the lead-scoring engine.  Run with:  python -m pytest"""

import scoring
from sample_data import SAMPLE_ELEMENTS


def test_unnamed_business_is_skipped():
    assert scoring.score_business({"shop": "clothes"}) is None


def test_irrelevant_object_is_skipped():
    assert scoring.score_business({"name": "Old Oak", "natural": "tree"}) is None


def test_marketing_agency_with_email_outscores_cafe_without():
    agency = scoring.score_business({
        "name": "Acme Marketing", "office": "marketing",
        "email": "hi@acme.test", "website": "https://acme.test",
    })
    cafe = scoring.score_business({"name": "Tiny Cafe", "amenity": "cafe"})
    assert agency["score"] > cafe["score"]


def test_email_adds_points_and_reason():
    base = scoring.score_business({"name": "Gym A", "leisure": "fitness_centre"})
    with_email = scoring.score_business({
        "name": "Gym B", "leisure": "fitness_centre", "email": "gm@gymb.test",
    })
    assert with_email["score"] == base["score"] + scoring.EMAIL_PTS
    assert any("email" in r.lower() for r in with_email["reasons"])


def test_contact_prefix_tags_are_recognised():
    lead = scoring.score_business({
        "name": "Clinic X", "amenity": "clinic",
        "contact:email": "desk@clinicx.test", "contact:phone": "+1 555 1234",
    })
    assert lead["email"] == "desk@clinicx.test"
    assert lead["phone"] == "+1 555 1234"


def test_score_is_capped_at_100():
    lead = scoring.score_business({
        "name": "Max Corp", "office": "marketing", "email": "a@b.test",
        "website": "https://b.test", "phone": "1", "brand": "Max",
        "opening_hours": "24/7", "operator": "Max Group",
    })
    assert lead["score"] <= 100


def test_wildcard_office_matches_unknown_value():
    lead = scoring.score_business({"name": "Mystery Office", "office": "surveyor"})
    assert lead is not None
    assert lead["score"] >= scoring.MIN_CATEGORY_SCORE


def test_rank_leads_sorted_and_deduplicated():
    duplicated = SAMPLE_ELEMENTS + [dict(SAMPLE_ELEMENTS[0], id=999)]
    leads = scoring.rank_leads(duplicated)
    scores = [l["score"] for l in leads]
    assert scores == sorted(scores, reverse=True)
    names = [(l["name"].lower(), l["category"]) for l in leads]
    assert len(names) == len(set(names))


def test_rank_leads_respects_limit():
    assert len(scoring.rank_leads(SAMPLE_ELEMENTS, limit=5)) == 5


def test_sample_data_all_scoreable():
    leads = scoring.rank_leads(SAMPLE_ELEMENTS)
    assert len(leads) == len(SAMPLE_ELEMENTS)
    assert all(0 < l["score"] <= 100 for l in leads)
