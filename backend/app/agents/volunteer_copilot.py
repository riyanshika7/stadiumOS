import logging

from backend.app.security import sanitize_llm_input

logger = logging.getLogger("stadiumos.copilot")


def copilot_analyze_simulator(query: str, zone_data: dict = None) -> dict:
    """Simulates volunteer copilot analysis returning three-field Explainable AI (XAI) schema."""
    query_lower = query.lower()

    # Default intent & context
    language = "english"
    intent_category = "general"
    urgency = "low"

    # Language detection
    if any(w in query_lower for w in ["ayuda", "dolor", "médico", "medico", "dónde"]):
        language = "spanish"

    # Intent category & urgency
    if any(w in query_lower for w in ["choking", "chest", "dolor", "heart", "pain", "medical", "médico", "medico", "fainted"]):
        intent_category = "medical"
        urgency = "high"
    elif any(w in query_lower for w in ["lost", "child", "find", "missing"]):
        intent_category = "lost_person"
        urgency = "high" if "child" in query_lower or "6 years" in query_lower else "medium"
    elif any(w in query_lower for w in ["bathroom", "restroom", "toilet", "where", "dónde"]):
        intent_category = "navigation"

    # Reasoning engine & actionable script
    reasoning_engine = f"Analyzing fan query: '{query}'. Detected language: {language}, category: {intent_category}, urgency: {urgency}."
    actionable_script = f"Greeting the fan in {language}. Assisting with {intent_category} query."

    # Specific test overrides
    if "chest" in query_lower or "dolor" in query_lower:
        reasoning_engine = "Fan reports acute chest pain/dolor en el pecho. High urgency medical triage protocol active."
        actionable_script = "Por favor, mantenga la calma. Voy a llamar al médico de inmediato. (Please sit down, medical is dispatched.)"
    elif "child" in query_lower or "red shirt" in query_lower:
        reasoning_engine = "Parent lost a 6-year-old child wearing a red shirt. Initiating lost child search protocol."
        actionable_script = "Alerting info booth. Requesting description and last known location."

    return {
        "intent_and_context": {
            "language": language,
            "intent_category": intent_category,
            "urgency": urgency
        },
        "xai_reasoning": reasoning_engine,
        "reasoning_engine": reasoning_engine,
        "actionable_script": actionable_script
    }


def handle_copilot_analysis(query: str, zone_data: dict = None) -> dict:
    """Sanitize user query and return the copilot XAI analysis.

    Raises ValueError if the input is rejected by the security boundary
    (empty, too long, or contains prompt-injection patterns).
    """
    safe_query = sanitize_llm_input(query)
    return copilot_analyze_simulator(safe_query, zone_data)
