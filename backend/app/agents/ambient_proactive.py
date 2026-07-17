import json
import logging
from sqlalchemy.orm import Session
from backend.app.models import StadiumLocation, Incident, Alert
from google import genai
from google.genai import types
from backend.app.config import GEMINI_API_KEY, USE_SIMULATOR

logger = logging.getLogger(__name__)

# System instructions for the Ambient Proactivity Engine
SYSTEM_INSTRUCTION = """
You are the Senior Predictive Intelligence Agent for FIFA Stadium Command Center.
Your task is to analyze real-time stadium metrics (zone densities, reported incidents, weather) and generate proactive, predictive insights to resolve issues before they escalate.

You MUST produce a JSON object with:
1. "predicted_problems": List of problems likely to occur in the next 15-30 minutes based on current trends.
2. "recommended_actions": Exact, preventive instructions for volunteers on the ground (e.g. staffing re-allocations, early gate openings).
3. "automated_workflows": Actions the system has automatically triggered in the background (e.g., dispatching medical, alerting transit).

You MUST return a JSON object matching this schema:
{
  "predicted_problems": ["string"],
  "recommended_actions": ["string"],
  "automated_workflows": ["string"]
}

Do not include markdown code block characters like ```json, return ONLY the raw JSON text.
"""

def generate_insights_genai(locations_data: list, incidents_data: list, weather_warnings: list) -> dict:
    """Invokes Gemini to analyze current state and predict future operations bottlenecks."""
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    prompt = f"""
    Real-time Stadium Locations & Densities:
    {json.dumps(locations_data)}
    
    Active Incidents List:
    {json.dumps(incidents_data)}
    
    Weather Advisories:
    {json.dumps(weather_warnings)}
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
    return result

def generate_insights_simulator(locations_data: list, incidents_data: list, weather_warnings: list) -> dict:
    """Local fallback simulator for predictive crowd bottlenecks and staffing."""
    problems = []
    actions = []
    workflows = []
    
    # 1. Check for high density zones (Predictive Bottlenecks)
    high_density_zones = [loc["name"] for loc in locations_data if loc["crowd_level"] == "high"]
    if high_density_zones:
        problems.append(f"Imminent gridlock warning at {', '.join(high_density_zones)}. Inflow rate exceeds exit corridor capacity.")
        actions.append(f"Deploy volunteer teams immediately to pre-routing checkpoints 50m upstream of {', '.join(high_density_zones)} to divert fans.")
        workflows.append(f"Automated System Action: Diverted transit bus drop-offs from West Gate to East Gate hubs.")

    # 2. Check for active medical/security incidents
    active_meds = [inc["location"] for inc in incidents_data if inc["category"] == "medical" and inc["status"] == "open"]
    if active_meds:
        problems.append(f"Elevated stress and crowd slowdowns near Section {', '.join(active_meds)} due to active medical triaging.")
        actions.append(f"Direct standby volunteers to form a safety perimeter around the medical zone in Section {', '.join(active_meds)} to keep corridors clear.")
        workflows.append(f"Automated System Action: Dispatched emergency response vehicle to VIP access gate near Section {', '.join(active_meds)}.")

    # 3. Check for weather alerts
    if weather_warnings:
        problems.append("Increased slip hazard at outdoor concourse ramps due to active precipitation.")
        actions.append("Instruct ramp volunteers to direct fans to dry elevator lines and hand out rain ponchos.")
        workflows.append("Automated System Action: Requested facilities cleanup crew to deploy high-traction mats on all external exit ramps.")

    # Default fallbacks if everything is calm
    if not problems:
        problems.append("None detected. Operations running within normal parameters.")
        actions.append("Maintain standard sector patrols and monitor accessibility gate queues.")
        workflows.append("Automated System Action: Running routine database synchronization checks.")
        
    return {
        "predicted_problems": problems,
        "recommended_actions": actions,
        "automated_workflows": workflows
    }

def handle_ambient_insights(db: Session) -> dict:
    """Collects database metrics and calls the predictive engine with simulator fallback."""
    # 1. Fetch locations
    locations = db.query(StadiumLocation).all()
    loc_list = [{"name": loc.name, "crowd_level": loc.crowd_level, "crowd_factor": loc.crowd_factor} for loc in locations]
    
    # 2. Fetch active incidents
    incidents = db.query(Incident).filter(Incident.status == "open").all()
    inc_list = [{"category": inc.category, "location": inc.location, "urgency": inc.urgency, "status": inc.status} for inc in incidents]
    
    # 3. Fetch active weather alerts
    alerts = db.query(Alert).filter(Alert.active == True, Alert.title.like("%Weather%")).all()
    weather_list = [al.message for al in alerts]
    
    if USE_SIMULATOR:
        return generate_insights_simulator(loc_list, inc_list, weather_list)
        
    try:
        return generate_insights_genai(loc_list, inc_list, weather_list)
    except Exception as e:
        logger.error(f"GenAI Ambient Insights failed: {e}")
        return generate_insights_simulator(loc_list, inc_list, weather_list)
