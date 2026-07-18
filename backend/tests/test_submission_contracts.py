"""Regression tests for the evaluation-critical Volunteer Co-Pilot contracts."""

from backend.app.agents.translator import handle_translation
from backend.app.gcp import FirebaseSyncService, get_gcp_deployment_metadata
from backend.app.repositories.location_repository import SortedLocationIndex


def test_xai_response_has_required_explainability_fields():
    result = handle_translation("I have chest pain and need help")

    assert set(("intent_detection", "plain_english_reasoning", "actionable_script")) <= result.keys()
    assert result["intent_detection"]["intent"]
    assert result["plain_english_reasoning"]
    assert result["actionable_script"]


def test_location_index_uses_precomputed_binary_search_keys():
    index = SortedLocationIndex()
    index._pairs = [("gate a", 1), ("gate b", 2), ("gate c", 3)]
    index._keys = ["gate a", "gate b", "gate c"]

    assert index.find("Gate B") == 2
    assert index.find("Gate Z") is None


def test_firestore_sync_is_safe_without_cloud_credentials():
    metadata = get_gcp_deployment_metadata()

    assert "firestore_configured" in metadata
    assert FirebaseSyncService.sync_incident(1, {"status": "open"}) is False
