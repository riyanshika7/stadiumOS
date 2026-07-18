import json
import logging
from google import genai
from google.genai import types
from backend.app.config import GEMINI_API_KEY, USE_SIMULATOR

logger = logging.getLogger(__name__)

# System instructions for the Explainable AI (XAI) Crowd Agent
SYSTEM_INSTRUCTION = """
You are the Senior Crowd Operations Architect for the FIFA World Cup 2026.
Your job is to provide Explainable AI (XAI) recommendations to stadium volunteers when a specific gate or zone crosses an 80% capacity threshold.

You MUST perform deep Generative AI reasoning to produce a JSON object that strictly contains these three fields:
1. "intent_and_context": An object representing the parameters of the alert:
   - "zone_name": (Name of the congested zone)
   - "capacity_percentage": (e.g. "85%")
   - "urgency": ("medium", "high", or "critical" based on crowd density severity)
2. "xai_reasoning": A plain English explanation for the volunteer of why this bottleneck is critical and why the redirection is recommended (e.g., explaining how many minutes it will save and how it prevents safety stampedes/blockages).
3. "actionable_script": A clear, tone-adapted directive or spoken/written script that the volunteer can announce or display on screen to redirect incoming traffic to alternative zones.

You MUST return a JSON object matching this schema:
{
  "intent_and_context": {
    "zone_name": "string",
    "capacity_percentage": "string",
    "urgency": "string"
  },
  "xai_reasoning": "string",
  "actionable_script": "string"
}

Do not include markdown formatting or ```json wrapper, return ONLY the raw JSON text.
"""

def generate_crowd_recommendation_genai(zone_name: str, capacity: int, count: int, density: float, alternatives: list) -> dict:
    """Invokes Gemini to create a reasoning-based crowd control alert and recommendation."""
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    prompt = f"""
    Zone: {zone_name}
    Capacity: {capacity}
    Current Count: {count}
    Current Density: {density * 100:.1f}%
    Available Alternatives: {", ".join(alternatives)}
    """
    
    response = client.models.generate_content(
        model='gemini-3.1-pro',
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            temperature=0.2
        )
    )
    
    result = json.loads(response.text.strip())
    # Backwards compatibility enrichment
    if "explanation" not in result:
        result["explanation"] = result.get("xai_reasoning", "")
    if "recommended_action" not in result:
        result["recommended_action"] = result.get("actionable_script", "")
    return result

def generate_crowd_recommendation_simulator(zone_name: str, capacity: int, count: int, density: float, alternatives: list) -> dict:
    """Local fallback engine for Explainable AI (XAI) recommendations returning three-field schema."""
    density_pct = density * 100
    alt_str = alternatives[0] if alternatives else "nearby open exits"
    
    intent_and_context = {
        "zone_name": zone_name,
        "capacity_percentage": f"{density_pct:.1f}%",
        "urgency": "critical" if density > 0.9 else ("high" if density > 0.8 else "medium")
    }
    
    # Calculate simulated travel minutes saved dynamically
    time_saved = 2 if "gate" in zone_name.lower() else 4
    
    xai_reasoning = (
        f"{zone_name} is nearing a critical bottleneck at {density_pct:.1f}% capacity ({count}/{capacity} fans). "
        f"Redirecting incoming fans to {alt_str} will save approximately {time_saved} minutes in passenger transit time "
        f"and prevent a severe localized safety blockage risk at the entrance plaza."
    )
    
    actionable_script = (
        f"Notice: {zone_name} is heavily congested. Please bypass and enter through {alt_str} "
        f"for a much faster, step-free access queue."
    )
    
    return {
        "intent_and_context": intent_and_context,
        "xai_reasoning": xai_reasoning,
        "actionable_script": actionable_script,
        # Flat fields compatibility
        "explanation": xai_reasoning,
        "recommended_action": actionable_script
    }

def handle_crowd_recommendation(zone_name: str, capacity: int, count: int, alternatives: list) -> dict:
    """Core entrypoint that manages the crowd recommendation pipeline."""
    density = count / capacity if capacity > 0 else 0.0
    
    if USE_SIMULATOR:
        logger.info("Using Local Crowd Advisor Simulator (No API Key)")
        return generate_crowd_recommendation_simulator(zone_name, capacity, count, density, alternatives)
        
    try:
        raw = generate_crowd_recommendation_genai(zone_name, capacity, count, density, alternatives)
        # Ensure flat compat fields are added
        if "explanation" not in raw:
            raw["explanation"] = raw.get("xai_reasoning", "")
        if "recommended_action" not in raw:
            raw["recommended_action"] = raw.get("actionable_script", "")
        return raw
    except Exception as e:
        logger.error(f"GenAI Crowd Recommendation failed, falling back to simulator: {e}")
        return generate_crowd_recommendation_simulator(zone_name, capacity, count, density, alternatives)
