import json
import logging
from google import genai
from google.genai import types
from backend.app.config import GEMINI_API_KEY, USE_SIMULATOR

logger = logging.getLogger(__name__)

# System instructions and schema
SYSTEM_INSTRUCTION = """
You are the Accessibility Navigation Agent for StadiumOS.
Your job is to generate step-by-step, highly clear navigation instructions for a fan, given a start location, end location, current crowd congestion level, and specific accessibility requirements.

Inputs to consider:
- Start Location (e.g., Gate A)
- Destination (e.g., Seat Section 212)
- Accessibility Flags:
  - Wheelchair / Mobility Aid (Must avoid stairs; must prioritize elevators and ramps)
  - Visual Impairment (Must note braille signs, tactile paving, and audio help desks)
  - Stroller / Family (Must note family elevators and wide corridors)
- Crowd Congestion level: "low", "moderate", "high" (If high, suggest routes avoiding bottlenecks).

Your output must be a JSON object containing:
{
  "route_description": "string (step-by-step description of the path)",
  "key_locations_passed": ["list of strings representing locations passed"],
  "accessibility_features_highlighted": ["list of accessibility aids available on this route"],
  "estimated_time_minutes": int
}

Guidelines:
- Ensure the routing instructions are simple and reassuring.
- When mobility access is required, explicitly state: "Take Elevator X instead of Stairs Y".
"""

def navigate_genai(start: str, end: str, crowd_level: str, accessibility: dict, locations_context: str) -> dict:
    """Invokes Gemini to construct a step-by-step accessible path."""
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    prompt = f"""
    Find a route:
    - Start: {start}
    - Destination: {end}
    - Crowd Level: {crowd_level}
    - Accessibility Needs: {json.dumps(accessibility)}
    
    Available Venue Nodes:
    {locations_context}
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            temperature=0.1
        )
    )
    
    result = json.loads(response.text.strip())
    return result

def navigate_simulator(start: str, end: str, crowd_level: str, accessibility: dict) -> dict:
    """Rule-based local fallback navigation engine."""
    # Determine base travel time
    base_time = 5
    if crowd_level == "moderate":
        base_time = 8
    elif crowd_level == "high":
        base_time = 15
        
    is_wheelchair = accessibility.get("wheelchair", False)
    is_visual = accessibility.get("visual", False)
    is_stroller = accessibility.get("stroller", False)
    
    route_steps = []
    key_nodes = [start]
    features = []
    
    route_steps.append(f"Start at {start}.")
    
    if is_wheelchair or is_stroller:
        features.append("Step-free access")
        features.append("Wide corridors")
        
        if "Gate B" in start or "Gate B" in end:
            route_steps.append("Caution: Gate B is stairs-only. Rerouting via Gate A / West Concourse.")
            key_nodes.append("Gate A")
            
        route_steps.append("Proceed through the West Concourse corridor towards Elevator 1.")
        key_nodes.append("Elevator 1")
        features.append("Elevator 1 (Accessible)")
        route_steps.append("Take Elevator 1 up to Concourse Level 2.")
        
        if "Ramp" in start or "Ramp" in end or "Section 204" in end:
            route_steps.append("Head north along the wide, gradual Ramp North instead of the stairs.")
            key_nodes.append("Ramp North")
            features.append("Wheelchair Ramp (Gradual Slope)")
    else:
        route_steps.append("Walk along the main concourse path.")
        if crowd_level == "high":
            route_steps.append("Crowd is dense here; proceed slowly and watch for directional overhead signs.")
            
    if is_visual:
        features.append("Tactile paving")
        features.append("Braille signs")
        route_steps.append("Follow the tactile paving strips on the floor. Braille maps are located at the West Info desk.")
        key_nodes.append("West Info Desk")
        
    route_steps.append(f"Arrive safely at your destination: {end}.")
    key_nodes.append(end)
    
    return {
        "route_description": " ".join(route_steps),
        "key_locations_passed": key_nodes,
        "accessibility_features_highlighted": list(set(features)) if features else ["Standard signs"],
        "estimated_time_minutes": base_time
    }

def handle_navigation(start: str, end: str, crowd_level: str, accessibility: dict, db_locations: list = None) -> dict:
    """Core entrypoint for accessibility navigation with simulator fallback."""
    if USE_SIMULATOR or not db_locations:
        logger.info("Using Local Navigation Simulator (No API Key)")
        return navigate_simulator(start, end, crowd_level, accessibility)
        
    try:
        # Create a string representation of database locations to pass as context
        loc_strings = []
        for loc in db_locations:
            loc_strings.append(f"- Name: {loc.name}, Type: {loc.type}, Accessibility Features: {loc.accessibility_features}, Crowd Level: {loc.crowd_level}, Description: {loc.description}")
        context = "\n".join(loc_strings)
        
        return navigate_genai(start, end, crowd_level, accessibility, context)
    except Exception as e:
        logger.error(f"GenAI Navigation failed, falling back to simulator: {e}")
        return navigate_simulator(start, end, crowd_level, accessibility)
