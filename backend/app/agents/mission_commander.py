import json
import logging
from google import genai
from google.genai import types
from backend.app.config import GEMINI_API_KEY, USE_SIMULATOR

logger = logging.getLogger(__name__)

# System instructions for AI Mission Commander enforcing the 7-stage PromptWars Explanation schema
SYSTEM_INSTRUCTION = """
You are the AI Mission Commander for StadiumOS at the FIFA World Cup 2026.
Your job is to act as the primary operational coordinator. You analyze situations typed or spoken by organizers, perform multi-step tactical reasoning, and output a structured operational plan.

You MUST analyze the input situation and produce a JSON object matching this schema:
{
  "situation_summary": "Short, clear summary of the operational issue",
  "observation": "Detailed raw observations registered by sensors, cameras, or volunteers on the ground",
  "analysis": "Cognitive assessment of the immediate situation, identifying key operational and safety threats",
  "prediction": "AI forecast of downstream stadium bottlenecks, surge delays, or emergency developments if left unmitigated",
  "explanation": "High-fidelity dynamic explainable reasoning behind the recommended actions (this is also your 'ai_reasoning')",
  "ai_reasoning": "High-fidelity dynamic explainable reasoning behind the recommended actions (must match 'explanation')",
  "risk_level": "Low", "Medium", "High", or "Critical",
  "affected_zones": ["List of stadium zones/locations affected"],
  "fans_impacted": 1200, // estimated number of fans affected (integer)
  "accessibility_impact": "Assessment of how this affects disabled, wheelchair, stroller, or sensory-sensitive fans",
  "medical_impact": "Medical risks or requirements",
  "security_impact": "Security threat assessment or required measures",
  "transportation_impact": "Transit, parking, or egress shuttle implications",
  "predicted_resolution_time": "Estimated duration (e.g. 15 minutes)",
  "expected_impact": "Measurable operational goals and expected impact of taking action (e.g. reduce ingress wait times by 4 minutes)",
  "confidence_score": 95.5, // Float percentage representing prediction confidence (0 to 100)
  "recommendations": [
    {
      "action": "Checklist action item",
      "why": "Brief explanation of why this action was generated based on context"
    }
  ],
  "timeline": [
    "Chronological list of expected milestone steps (e.g., T+0: Event detected, T+5m: Rerouting...)"
  ]
}

Ensure all instructions in recommendations are highly actionable for stadium volunteers and security crews.
Return ONLY the raw JSON text, with NO markdown code block formatting (do not wrap in ```json).
"""
def handle_mission_command(situation: str) -> dict:
    """Invokes Gemini or fallback simulator to generate a futuristic command bridge operational plan with the 7-stage PromptWars explanation schema."""
    raw = {}
    if USE_SIMULATOR:
        logger.info("Using Local Mission Commander Simulator")
        raw = get_simulated_mission_plan(situation)
    else:
        try:
            client = genai.Client(api_key=GEMINI_API_KEY)
            response = client.models.generate_content(
                model='gemini-3.1-pro',
                contents=f"Generate an operational plan for: '{situation}'",
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )
            text = response.text.strip() if response.text else "{}"
            raw = json.loads(text)
        except Exception as e:
            logger.error(f"GenAI Mission Commander failed: {e}. Falling back to simulator.")
            raw = get_simulated_mission_plan(situation)

    # 7-Stage Explanation Heuristics mapping to prevent empty values:
    query = situation.lower()
    if "observation" not in raw:
        if "gate" in query or "overcrowd" in query or "crowd" in query:
            raw["observation"] = "Ticket scanners at Gate 4 registering average transaction time of 9.2 seconds per fan, causing queue spillback onto active shuttle bus unloading bays."
            raw["analysis"] = "Incoming shuttle arrivals are dumping 400+ fans every 3 minutes. High local density (3.5 people/m²) near Gate 4 plaza creates an ingress bottleneck."
            raw["prediction"] = "Ingress queues will exceed 25-minute wait times and spill over onto vehicle transit lanes, risking vehicle accidents and pedestrian injuries."
            raw["expected_impact"] = "Reduces local density to 1.2 people/m² and redirects flows to underutilized Gate 5 & 6."
        elif "rain" in query or "storm" in query or "weather" in query:
            raw["observation"] = "Meteorological radar tracks convective rainstorm cell with wind gusts approaching the stadium."
            raw["analysis"] = "Exposed concrete outer ramps will present immediate slippage hazards; spectators will rush to covered zones."
            raw["prediction"] = "Concourse bottlenecks and slip-and-fall physical trauma reports are expected to surge within 15 minutes."
            raw["expected_impact"] = "Evacuates exposed stairs, prevents physical slip injuries, and dries concourse thresholds."
        elif "child" in query or "lost" in query or "missing" in query:
            raw["observation"] = "On-site volunteer reports a lost 6-year-old child wearing a red shirt last seen near Section 102."
            raw["analysis"] = "Child may attempt to leave through Gate B exit lanes; parent is experiencing severe distress."
            raw["prediction"] = "Exiting the secure zone undetected if exit lanes are not immediately monitored and swept."
            raw["expected_impact"] = "Establishes secure exits search corridor and reunites parent/child within 10 minutes."
        elif "medical" in query or "heart" in query or "chest" in query or "injury" in query:
            raw["observation"] = "Fan collapsed with shortness of breath and chest pressure near Row L Section C."
            raw["analysis"] = "Suspected severe cardiac event under elevated heat index (34°C); requires urgent life support."
            raw["prediction"] = "Fatal or severe patient deterioration if resuscitation/AED is delayed past 4 minutes."
            raw["expected_impact"] = "Secures AED access, clears stretcher routes, and completes ambulance transfer in 12 minutes."
        elif "metro" in query or "delay" in query or "train" in query or "transit" in query:
            raw["observation"] = "Signaling fault reported on the main rail transit line, halting train arrivals/departures."
            raw["analysis"] = "Egress capacity reduced by 60%; massive queue backups expected at station entrance plazas."
            raw["prediction"] = "Station entry queue gridlock, high crowd pressure, and dehydration in queuing corridors."
            raw["expected_impact"] = "Diverts flow to bypass bus shuttles and keeps fans in covered concourses."
        elif "parking" in query or "lot" in query or "car" in query:
            raw["observation"] = "Parking Lot A sensors register 100% capacity; cars tailing back onto highway access roads."
            raw["analysis"] = "Access road gridlock blocks emergency responder vehicle corridors and halts ingress traffic."
            raw["prediction"] = "Total highway exit gridlock and 30-minute delays for incoming transit buses."
            raw["expected_impact"] = "Clears access roads and distributes incoming vehicles to Parking Lot B/C."
        elif "fire" in query or "alarm" in query or "smoke" in query:
            raw["observation"] = "Smoke alarm triggered in kitchen hood of Concession Stand North; sprinklers activated."
            raw["analysis"] = "Grease fire hazard inside concourse level, threatening smoke inhalation and crowd panic."
            raw["prediction"] = "Localized smoke spread and stampede hazards if evacuation is not directed immediately."
            raw["expected_impact"] = "Safely evacuates Section 102 concourse and suppresses localized grease fire."
        else:
            raw["observation"] = f"Operations command logged custom report: '{situation}'."
            raw["analysis"] = "Evaluating threat vectors and coordinating resources across local quadrants."
            raw["prediction"] = "Temporary localized bottleneck or service delay if unchecked."
            raw["expected_impact"] = "Resolves operational incident and restores normal service levels."

    if "explanation" not in raw:
        raw["explanation"] = raw.get("ai_reasoning", "Assessed situation dynamics and calculated optimal multi-vector response.")
    
    # Ensure backward compatibility aliases exist
    if "ai_reasoning" not in raw:
        raw["ai_reasoning"] = raw["explanation"]
        
    return raw

def get_simulated_mission_plan(situation: str) -> dict:
    """Pre-set, highly detailed mock responses matching the required schema for standard scenarios."""
    query = situation.lower()
    
    # 1. Gate 4 overcrowding
    if "gate" in query or "overcrowd" in query or "crowd" in query:
        return {
            "situation_summary": "Severe Crowd Bottleneck & Congestion at Gate 4",
            "ai_reasoning": "Ticket scanning delays paired with a sudden transit shuttle arrival have created a surge at Gate 4. The localized density has exceeded 3.5 people/m² near the entrance plaza.",
            "risk_level": "High",
            "affected_zones": ["Gate 4 Entrance Plaza", "Concourse West", "Transit Drop-off B"],
            "fans_impacted": 4200,
            "accessibility_impact": "Wheelchair access ramp at Gate 4 is obstructed. Stroller passage is severely restricted.",
            "medical_impact": "High risk of heat exhaustion, dehydration, and minor crushing incidents in the queue.",
            "security_impact": "Elevated frustration; potential for gate rushing if wait times exceed 20 minutes.",
            "transportation_impact": "Incoming shuttle drop-offs must be temporarily held or diverted to Gate 5.",
            "predicted_resolution_time": "15 minutes",
            "confidence_score": 96.4,
            "recommendations": [
                {"action": "Open Gate 5 & Gate 6 bypass scanners", "why": "To distribute the queue burden and clear the central plaza bottleneck."},
                {"action": "Deploy 8 crowd-control volunteers to Plaza 4", "why": "To actively guide incoming fans towards the underutilized Gate 5 entrances."},
                {"action": "Broadcast multilingual redirect announcement", "why": "To inform non-English speakers of faster entry points via Gates 5 & 6."},
                {"action": "Enable wheelchair rerouting via West Ramp B", "why": "To bypass the congested Gate 4 ramp and maintain accessibility compliance."}
            ],
            "timeline": [
                "T-0m: Ingress bottleneck detected at Gate 4 scanning zone.",
                "T+2m: Operational alert pushed to local concourse supervisors.",
                "T+5m: Bypass Gates 5 and 6 scanners active; volunteer redirection begins.",
                "T+10m: Queue density reduced to nominal levels; transit flows normalized."
            ]
        }
        
    # 2. Heavy rain
    elif "rain" in query or "storm" in query or "weather" in query:
        return {
            "situation_summary": "Approaching Severe Rainstorm & High Wind Cell",
            "ai_reasoning": "Live weather radar reports a convective rain cell moving at 25km/h directly toward MetLife Stadium. Rainfall rate expected to hit 20mm/hr with winds up to 45km/h.",
            "risk_level": "High",
            "affected_zones": ["Ramp North", "Ramp South", "Upper Deck Plaza", "Concourse Outer Rings"],
            "fans_impacted": 14500,
            "accessibility_impact": "Exposed outdoor ramps present high slip hazards for wheelchair users. Elevators will experience high demand.",
            "medical_impact": "Elevated slip-and-fall trauma risk on wet concrete surfaces.",
            "security_impact": "Sudden movement of fans seeking shelter in covered concourses may cause localized bottlenecks.",
            "transportation_impact": "Outdoor parking shuttle boarding delayed; transit speed limits reduced by 20%.",
            "predicted_resolution_time": "40 minutes",
            "confidence_score": 92.1,
            "recommendations": [
                {"action": "Activate indoor concourse shelter zones", "why": "To provide dry assembly spaces for fans currently located in uncovered plaza areas."},
                {"action": "Reroute wheelchair/stroller fans to internal elevators", "why": "To prevent hazardous descents on wet, exposed outdoor ramps."},
                {"action": "Deploy additional floor-drying crews with squeegees", "why": "To proactively manage pooling water at concourse thresholds and exit gates."},
                {"action": "Disable T-Minus display timer alerts", "why": "To reduce urgency and encourage fans to walk calmly rather than run."}
            ],
            "timeline": [
                "T-15m: Convective rain warning received from Meteorological Office.",
                "T-10m: Shelter plan dispatched to all volunteer hand-held devices.",
                "T-5m: Dynamic signage switched to show covered concourse routes.",
                "T+20m: Rain starts; outdoor concourses successfully cleared with zero injuries reported."
            ]
        }
        
    # 3. Lost child
    elif "child" in query or "lost" in query or "missing" in query:
        return {
            "situation_summary": "Lost Child Reported (6yo Female, Red Shirt)",
            "ai_reasoning": "A volunteer reported a lost child last seen near the Section 102 concession stands. Perimeter exit sweeps must be established immediately.",
            "risk_level": "Medium",
            "affected_zones": ["Section 102", "Concourse North", "Gate B Exit Lanes"],
            "fans_impacted": 150,
            "accessibility_impact": "Info Booths must remain clear of congestion to facilitate child check-in.",
            "medical_impact": "Reporting parent experiencing acute anxiety; requires support.",
            "security_impact": "Strict exit monitoring needed at Gate B exits to ensure the child does not leave the secure boundary.",
            "transportation_impact": "None.",
            "predicted_resolution_time": "10 minutes",
            "confidence_score": 98.0,
            "recommendations": [
                {"action": "Lockdown Gate B exit lanes", "why": "To prevent the child from leaving the stadium boundaries while search is active."},
                {"action": "Deploy 6 search volunteers to Section 102 stand quadrant", "why": "To perform a rapid sweep of public seating, restrooms, and concession lobbies."},
                {"action": "Assign de-escalation coach to the reporting parent", "why": "To manage severe panic and maintain communication at the sector post."},
                {"action": "Broadcast child description to all security radios", "why": "To engage all gate personnel in active monitoring."}
            ],
            "timeline": [
                "T-0m: Incident logged by Section 102 volunteer.",
                "T+1m: Search quadrant established; local exit monitoring activated.",
                "T+3m: Volunteers initiate stand and restroom sweeps.",
                "T+8m: Child located safe at north ice-cream kiosk; parent reunited."
            ]
        }
        
    # 4. Medical emergency in Section C
    elif "medical" in query or "heart" in query or "chest" in query or "injury" in query or "section c" in query:
        return {
            "situation_summary": "Medical Emergency (Suspected Cardiac/Heatstroke) in Section C",
            "ai_reasoning": "Fan collapsed near Row L Section C. On-site volunteers report shortness of breath. Heat index currently at 34°C.",
            "risk_level": "Critical",
            "affected_zones": ["Section C", "Concourse West Triage Post", "Gate A Emergency Ingress"],
            "fans_impacted": 80,
            "accessibility_impact": "Emergency medical vehicle route requires clear elevators and ramps.",
            "medical_impact": "Immediate advanced life support (ALS) intervention required.",
            "security_impact": "Security must establish a perimeter around Row L to allow medical staff to operate.",
            "transportation_impact": "Emergency ambulance route cleared through Gate A entrance lanes.",
            "predicted_resolution_time": "12 minutes",
            "confidence_score": 99.1,
            "recommendations": [
                {"action": "Dispatch 2 medical responders with AED immediately", "why": "To initiate immediate first-aid chest compression/stabilization at the scene."},
                {"action": "Clear Section C aisle ways and exit stairs", "why": "To ensure unhindered access for incoming stretcher teams."},
                {"action": "Alert Gate A security for ambulance arrival", "why": "To expedite emergency vehicle entry and guide responders to Section C."},
                {"action": "Deploy 2 volunteers to support companions", "why": "To offer translation, comfort, and escort support to the patient's family."}
            ],
            "timeline": [
                "T-0m: Collapsed fan alert received via volunteer app.",
                "T+1m: Medical dispatch team dispatched with AED kit.",
                "T+4m: Responders arrive at Section C; stabilization begins.",
                "T+9m: Stretcher extraction completed; patient loaded into Gate A ambulance."
            ]
        }
        
    # 5. Metro delayed
    elif "metro" in query or "delay" in query or "train" in query or "transit" in query:
        return {
            "situation_summary": "Metro Line Transit Delay (15 Minutes)",
            "ai_reasoning": "Signaling fault on the primary rail line has halted inbound/outbound transit. Post-match egress will bottleneck at the station entrance plaza.",
            "risk_level": "Medium",
            "affected_zones": ["Transit Plaza", "Station Gate 1", "External Parking shuttle lanes"],
            "fans_impacted": 12500,
            "accessibility_impact": "Extended standing times at the train platform will impact elderly and disabled spectators.",
            "medical_impact": "Dehydration risk in outdoor staging lines; requests for seating/shade will increase.",
            "security_impact": "Frustration buildup in crowded station queues; security needed to prevent platform surges.",
            "transportation_impact": "Bypass bus shuttles must be activated to carry passengers to alternative hub stations.",
            "predicted_resolution_time": "25 minutes",
            "confidence_score": 91.0,
            "recommendations": [
                {"action": "Notify transportation team to dispatch standby buses", "why": "To provide immediate alternative transit capacity and drain queue build-up."},
                {"action": "Extend stadium food/concession operations by 20 minutes", "why": "To encourage fans to stay inside the stadium rather than crowd the transit plaza."},
                {"action": "Deploy 10 volunteers to manage plaza queues", "why": "To communicate delay updates, distribute water, and prevent queue jumping."},
                {"action": "Adjust transit plaza dynamic banners", "why": "To show real-time delay minutes and alternative bus routes."}
            ],
            "timeline": [
                "T-0m: Metro rail signaling fault reported to command bridge.",
                "T+3m: Standby bus shuttle fleet activated; concourse delays announced.",
                "T+10m: First wave of bypass buses arrive at plaza loading bays.",
                "T+22m: Train lines restored; station queue clearing completed."
            ]
        }
        
    # 6. Parking Lot A is full
    elif "parking" in query or "lot" in query or "car" in query:
        return {
            "situation_summary": "Parking Lot A Reached 100% Saturation",
            "ai_reasoning": "Lot A is completely full. Incoming vehicles are causing tailbacks onto Highway 120, blocking ingress lanes.",
            "risk_level": "Medium",
            "affected_zones": ["Parking Lot A", "Highway 120 Access Road", "Gate C Outer Perimeter"],
            "fans_impacted": 3000,
            "accessibility_impact": "Accessible parking spaces in Lot A are full. Rerouting must direct handicap placards to Lot B accessible bays.",
            "medical_impact": "None.",
            "security_impact": "Gridlock on access roads prevents emergency response vehicles from entering Lot A.",
            "transportation_impact": "Severe traffic tailbacks; transit schedules delayed.",
            "predicted_resolution_time": "20 minutes",
            "confidence_score": 95.0,
            "recommendations": [
                {"action": "Redirect traffic to Parking Lot B/C", "why": "To immediately relieve the access road tailbacks and utilize empty bays."},
                {"action": "Deploy 4 traffic control volunteers to Lot A entrance", "why": "To turn cars away and point drivers towards Lot B signage."},
                {"action": "Update digital highway display signs", "why": "To show 'LOT A FULL - FOLLOW LOT B DETOUR' warning to inbound drivers."},
                {"action": "Direct handicap placards to Lot B reserved bays", "why": "To maintain accessible parking availability for disabled drivers."}
            ],
            "timeline": [
                "T-0m: Parking sensors indicate 100% capacity in Lot A.",
                "T+2m: Dynamic highway signs updated; traffic redirection active.",
                "T+5m: Volunteers deployed at entry junction to guide tailbacks.",
                "T+18m: Traffic flow on access roads normalized; Lot B filling steadily."
            ]
        }
        
    # 7. Fire alarm
    elif "fire" in query or "alarm" in query or "smoke" in query:
        return {
            "situation_summary": "Fire Alarm Triggered in Concession Stand North",
            "ai_reasoning": "Smoke detector triggered. On-site staff confirm localized grease fire in kitchen hood. Automated sprinklers have activated.",
            "risk_level": "Critical",
            "affected_zones": ["Concession Stand North", "Section 102 Concourse", "Gate B Exit Corridors"],
            "fans_impacted": 2800,
            "accessibility_impact": "Elevator 1 near Section 102 must be reserved strictly for wheelchair evacuation under manual control.",
            "medical_impact": "High risk of smoke inhalation and panic-induced injuries during local evacuation.",
            "security_impact": "Immediate localized evacuation required. Crowd panic control is paramount.",
            "transportation_impact": "Emergency lane access at Gate B cleared for fire responder engines.",
            "predicted_resolution_time": "8 minutes",
            "confidence_score": 99.8,
            "recommendations": [
                {"action": "Initiate local evacuation for Section 102 & Concourse North", "why": "To clear spectators out of the immediate smoke zone safely and rapidly."},
                {"action": "Deploy 12 safety volunteers to Gate B exits", "why": "To direct the evacuation flow, prevent crush hazards, and ensure exits remain clear."},
                {"action": "Override Elevator 1 for manual wheelchair evacuation", "why": "To ensure disabled fans in the upper levels are safely evacuated without using stairs."},
                {"action": "Dispatch on-site fire response crew", "why": "To assist in kitchen grease fire suppression and secure chemical gas valves."}
            ],
            "timeline": [
                "T-0m: Alarm triggered; automated fire suppressors active.",
                "T+30s: Local sector alarm sounds; emergency lighting active.",
                "T+2m: Sector evacuation initiated; safety volunteers guide crowd flows.",
                "T+6m: Fire suppressed; smoke cleared; sector declared 100% safe."
            ]
        }
        
    # Default fallback
    else:
        return {
            "situation_summary": "Operational Situation Logged: " + situation,
            "ai_reasoning": "Custom situation detected. Operations team must verify local details and dispatch coordinates.",
            "risk_level": "Medium",
            "affected_zones": ["Global Stadium Coordinates"],
            "fans_impacted": 1000,
            "accessibility_impact": "Assess local ramps and elevators for potential obstructions.",
            "medical_impact": "First-aid kits and on-duty responders placed on standby.",
            "security_impact": "Deploy volunteers to secure local quadrants.",
            "transportation_impact": "Monitor local shuttle and shuttle platforms.",
            "predicted_resolution_time": "15 minutes",
            "confidence_score": 85.0,
            "recommendations": [
                {"action": "Notify local sector volunteers", "why": "To inspect the reported zone and verify details on the ground."},
                {"action": "Monitor surveillance cameras", "why": "To get visual verification of the situation status."}
            ],
            "timeline": [
                "T-0m: Situation logged in operational system.",
                "T+2m: Sector patrol dispatched to verify details.",
                "T+10m: Resolution steps updated based on patrol report."
            ]
        }
