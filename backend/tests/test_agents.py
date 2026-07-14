import pytest
from backend.app.agents.translator import handle_translation
from backend.app.agents.incident import handle_incident_parsing
from backend.app.agents.navigation import handle_navigation

def test_translation_agent_fallback_spanish():
    """Verify that the translation agent correctly maps Spanish inputs in simulator mode."""
    res = handle_translation("¿Dónde puedo encontrar el ascensor?")
    assert res["detected_language"] == "Spanish"
    assert "elevator" in res["translated_query"].lower()
    assert "suggested_reply_english" in res
    assert "suggested_reply_native" in res

def test_translation_agent_fallback_french():
    """Verify that the translation agent correctly maps French inputs in simulator mode."""
    res = handle_translation("Où se trouve la toilette?")
    assert res["detected_language"] == "French"
    assert "restroom" in res["translated_query"].lower() or "toilet" in res["translated_query"].lower()

def test_incident_agent_medical():
    """Verify that the incident parser correctly detects a medical category and assigns high urgency."""
    report = "A fan has fainted near Section 102 Row G, please send medical help."
    res = handle_incident_parsing(report)
    assert res["category"] == "medical"
    assert res["urgency"] == "high"
    assert "medical" in res["required_action"].lower() or "stretcher" in res["required_action"].lower()

def test_incident_agent_hazard():
    """Verify that the incident parser correctly identifies a hazard spill."""
    report = "There is a massive beer spill near Concession Stand North, people are slipping."
    res = handle_incident_parsing(report)
    assert res["category"] == "hazard"
    assert "cleaning" in res["required_action"].lower() or "crew" in res["required_action"].lower()

def test_navigation_agent_wheelchair():
    """Verify that navigation directions adapt when wheelchair access is flagged."""
    res = handle_navigation(
        start="Gate B",
        end="Section 204",
        crowd_level="low",
        accessibility={"wheelchair": True, "visual": False, "stroller": False}
    )
    assert "route_description" in res
    # Accessibility routing should bypass the stairs-only Gate B and highlight step-free nodes
    assert "Elevator 1" in res["key_locations_passed"]
    assert "Step-free access" in res["accessibility_features_highlighted"]
