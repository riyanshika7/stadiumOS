import datetime
import logging
import csv
import io
import os
import shutil
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import pypdf

from backend.app.db import get_db, engine, Base, SessionLocal
from backend.app.models import Incident, Alert, StadiumLocation
from backend.app import schemas
from backend.app.seeder import seed_database
from backend.app.agents.translator import handle_translation
from backend.app.agents.incident import handle_incident_parsing
from backend.app.agents.navigation import handle_navigation
from backend.app.agents.crowd_control import handle_crowd_recommendation
from backend.app.agents.deescalation import handle_deescalation
from backend.app.agents.vision_gate import handle_ticket_vision
from backend.app.agents.ambient_proactive import handle_ambient_insights
from backend.app.agents.cctv_triage import handle_cctv_analysis
from backend.app.agents.swarm import handle_swarm_coordination
from backend.app.utils import binary_search_locations
from backend.app.weather import fetch_live_stadium_weather
from google import genai
from google.genai import types
from backend.app.config import GEMINI_API_KEY, USE_SIMULATOR

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("stadiumos")

app = FastAPI(
    title="StadiumOS Backend API",
    description="FIFA World Cup 2026 Volunteer Co-Pilot decision-support API",
    version="2.0.0"
)

# Enable CORS for frontend web integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory storage for PDF Playbook RAG context
PLAYBOOK_TEXT_CACHE = "Default SOP Protocol: If a child is lost, escort them to the nearest Information Booth and alert Section Supervisor immediately. If a medical emergency occurs, maintain calm, sit the fan down, and page emergency responders."

def mock_sop_response(query: str) -> dict:
    """Helper to return simulated RAG fallback answers when API rate-limits are hit."""
    question = query.lower()
    if "child" in question or "lost" in question:
        ans = "SOP Lost Child Protocol: Escort child to Info Booth West, notify supervisor immediately."
    elif "medical" in question or "doctor" in question or "faint" in question:
        ans = "SOP Medical Protocol: Have the fan sit down in a cool/shaded area, page responder."
    else:
        ans = "General SOP Protocol: Refer to nearest Supervisor or Information Desk."
    return {"answer": ans}

# Startup DB Seeder & Live Weather API Ingestion
@app.on_event("startup")
async def on_startup():
    db = next(get_db())
    try:
        seed_database(db)
        logger.info("Application startup and database initialization successful.")
        
        # Ingest live weather from Open-Meteo external API
        weather_info = await fetch_live_stadium_weather()
        if weather_info.get("success") and weather_info.get("warnings"):
            for warning in weather_info["warnings"]:
                existing = db.query(Alert).filter(Alert.message == warning).first()
                if not existing:
                    alert = Alert(
                        title="☀️ Live Weather Advisory",
                        message=warning,
                        type=weather_info["type"],
                        active=True
                    )
                    db.add(alert)
            db.commit()
            logger.info("Live weather warning ingested successfully.")
    except Exception as e:
        logger.error(f"Error during application startup database seed: {e}")
    finally:
        db.close()

# Health check route
@app.get("/api/health")
def read_health():
    return {
        "status": "healthy",
        "service": "StadiumOS Volunteer Co-Pilot Backend",
        "version": "2.0.0"
    }

# 1. Translation Endpoint
@app.post("/api/translate", response_model=schemas.TranslateResponse)
def translate_fan_query(payload: schemas.TranslateRequest):
    """Translates a fan's query, analyzes sentiment, and suggests replies."""
    try:
        result = handle_translation(payload.query)
        return result
    except Exception as e:
        logger.error(f"Translation endpoint failure: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Translation processing failed: {str(e)}"
        )

# 2. Incident Logging Endpoints
@app.post("/api/incident", response_model=schemas.IncidentResponse)
def log_new_incident(payload: schemas.IncidentCreate, db: Session = Depends(get_db)):
    """Parses a raw incident report using GenAI and saves it to the database."""
    try:
        parsed_data = handle_incident_parsing(payload.description)
        
        db_incident = Incident(
            category=parsed_data.get("category", "general"),
            urgency=parsed_data.get("urgency", "low"),
            location=parsed_data.get("location", "unknown"),
            description=parsed_data.get("description", payload.description),
            required_action=parsed_data.get("required_action", ""),
            status="open"
        )
        db.add(db_incident)
        db.commit()
        db.refresh(db_incident)
        
        if db_incident.urgency == "high":
            severity = "critical" if db_incident.category in ["medical", "security"] else "warning"
            alert = Alert(
                title=f"New High-Urgency Incident: {db_incident.category.upper()}",
                message=f"Location: {db_incident.location}. Description: {db_incident.description} Action required: {db_incident.required_action}",
                type=severity
            )
            db.add(alert)
            db.commit()
            
        return db_incident
    except Exception as e:
        logger.error(f"Incident logging endpoint failure: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Incident logging failed: {str(e)}"
        )

@app.get("/api/incidents", response_model=List[schemas.IncidentResponse])
def get_incidents(db: Session = Depends(get_db)):
    """Fetches all reported incidents, sorted by urgency and time."""
    incidents = db.query(Incident).order_by(
        Incident.status.asc(),
        Incident.reported_at.desc()
    ).all()
    return incidents

@app.patch("/api/incidents/{incident_id}", response_model=schemas.IncidentResponse)
def update_incident_status(incident_id: int, payload: schemas.IncidentUpdateStatus, db: Session = Depends(get_db)):
    """Updates the status of an incident (resolving it)."""
    db_incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    db_incident.status = payload.status
    if payload.status == "resolved":
        db_incident.resolved_at = datetime.datetime.utcnow()
    else:
        db_incident.resolved_at = None
        
    db.commit()
    db.refresh(db_incident)
    return db_incident

# 3. Accessibility Navigation Endpoints
@app.post("/api/navigation", response_model=schemas.NavigationResponse)
def get_navigation_directions(payload: schemas.NavigationRequest, db: Session = Depends(get_db)):
    """Computes accessibility-friendly step-by-step directions between locations."""
    try:
        db_locations = db.query(StadiumLocation).all()
        
        start_node = db.query(StadiumLocation).filter(StadiumLocation.name == payload.start_location).first()
        crowd_level = start_node.crowd_level if start_node else "low"
        
        accessibility = {
            "wheelchair": payload.wheelchair,
            "visual": payload.visual,
            "stroller": payload.stroller
        }
        
        directions = handle_navigation(
            start=payload.start_location,
            end=payload.destination,
            crowd_level=crowd_level,
            accessibility=accessibility,
            db_locations=db_locations
        )
        return directions
    except Exception as e:
        logger.error(f"Navigation endpoint failure: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Navigation routing failed: {str(e)}"
        )

@app.get("/api/locations", response_model=List[schemas.LocationResponse])
def get_stadium_locations(db: Session = Depends(get_db)):
    """Fetches all stadium layout nodes and active congestion levels."""
    return db.query(StadiumLocation).all()

# 4. Live Command Center Alerts Feed Endpoints
@app.get("/api/alerts", response_model=List[schemas.AlertResponse])
def get_active_alerts(db: Session = Depends(get_db)):
    """Returns the feed of active alerts pushed by stadium operations."""
    return db.query(Alert).filter(Alert.active == True).order_by(Alert.created_at.desc()).all()

@app.post("/api/alerts", response_model=schemas.AlertResponse)
def create_operational_alert(payload: schemas.AlertCreate, db: Session = Depends(get_db)):
    """Allows simulated command center to post a live broadcast bulletin."""
    db_alert = Alert(
        title=payload.title,
        message=payload.message,
        type=payload.type,
        active=True
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

# 5. Ingestion of Stadium Zone Densities (CSV Upload & XAI Recommendations)
@app.post("/api/crowd/upload-csv")
async def upload_crowd_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Ingests CSV density logs and triggers Explainable AI alerts (>80%)."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")

    try:
        contents = await file.read()
        if len(contents) > 2 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds the 2MB safety limit.")

        try:
            csv_text = contents.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="CSV file must be encoded in UTF-8 format.")

        csv_reader = csv.DictReader(io.StringIO(csv_text))
        
        if not csv_reader.fieldnames or not all(k in csv_reader.fieldnames for k in ["zone_name", "capacity", "current_count"]):
            raise HTTPException(
                status_code=400, 
                detail="CSV must contain 'zone_name', 'capacity', and 'current_count' headers."
            )
        
        db_locations = db.query(StadiumLocation).all()
        processed_rows = 0
        triggered_alerts = 0
        
        for row in csv_reader:
            zone_name = row.get("zone_name")
            try:
                capacity = int(row.get("capacity", 1))
                current_count = int(row.get("current_count", 0))
            except (ValueError, TypeError):
                continue
                
            if not zone_name or capacity <= 0 or current_count < 0:
                continue
                
            location = binary_search_locations(db_locations, zone_name)
            if not location:
                continue
                
            density = current_count / capacity
            location.crowd_level = "high" if density > 0.8 else ("moderate" if density > 0.5 else "low")
            location.crowd_factor = float(1.0 + (density * 2.0))
            db.commit()
            
            if density > 0.8:
                alternatives_nodes = db.query(StadiumLocation).filter(
                    StadiumLocation.type == location.type,
                    StadiumLocation.name != location.name,
                    StadiumLocation.crowd_level != "high"
                ).limit(2).all()
                
                alternatives = [node.name for node in alternatives_nodes]
                if not alternatives:
                    alternatives = ["Gate A", "West Corridor Exits"]
                    
                xai_advise = handle_crowd_recommendation(
                    zone_name=location.name,
                    capacity=capacity,
                    count=current_count,
                    alternatives=alternatives
                )
                
                alert = Alert(
                    title=f"⚠️ Capacity Bottleneck: {location.name.upper()} ({density * 100:.1f}%)",
                    message=f"{xai_advise.get('explanation')}\nAction: {xai_advise.get('recommended_action')}",
                    type="critical"
                )
                db.add(alert)
                db.commit()
                triggered_alerts += 1
                
            processed_rows += 1
            
        return {
            "status": "success",
            "message": f"Processed {processed_rows} zones. Generated {triggered_alerts} XAI alerts.",
            "processed_zones_count": processed_rows,
            "critical_alerts_triggered": triggered_alerts
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"CSV ingestion failed: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Malformed CSV dataset structures: {str(e)}"
        )

# 6. Ingestion of PDF Playbook / SOP Guide (PDF Upload & RAG Querying)
@app.post("/api/crowd/upload-pdf")
async def upload_playbook_pdf(file: UploadFile = File(...)):
    """Accepts a PDF of the stadium volunteer playbook and updates RAG context cache."""
    global PLAYBOOK_TEXT_CACHE
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
        
    try:
        contents = await file.read()
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="PDF size exceeds the 5MB safety limit.")
            
        pdf_file = io.BytesIO(contents)
        reader = pypdf.PdfReader(pdf_file)
        
        extracted_text = []
        for idx, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                extracted_text.append(text)
                
        full_text = "\n".join(extracted_text)
        if not full_text.strip():
            raise HTTPException(status_code=400, detail="PDF contains no readable text extract.")
            
        PLAYBOOK_TEXT_CACHE = full_text
        logger.info(f"Ingested PDF Playbook: {len(PLAYBOOK_TEXT_CACHE)} characters.")
        
        return {
            "status": "success",
            "message": f"SOP Playbook uploaded successfully. Indexed {len(reader.pages)} pages for GenAI RAG lookup.",
            "page_count": len(reader.pages)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF upload failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process PDF Playbook: {str(e)}"
        )

@app.post("/api/playbook/query")
def query_sop_playbook(payload: schemas.TranslateRequest, db: Session = Depends(get_db)):
    """Queries the uploaded PDF playbook text using Gemini RAG."""
    global PLAYBOOK_TEXT_CACHE
    try:
        if USE_SIMULATOR:
            return mock_sop_response(payload.query)
            
        client = genai.Client(api_key=GEMINI_API_KEY)
        prompt = f"""
        Answer the volunteer's question using ONLY the provided Stadium SOP/Playbook context.
        Volunteer Question: {payload.query}
        Stadium Playbook SOP Context:
        {PLAYBOOK_TEXT_CACHE[:8000]}
        """
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.2)
        )
        return {"answer": response.text.strip()}
    except Exception as e:
        logger.warning(f"RAG Playbook Query API call failed ({e}). Falling back to simulator.")
        return mock_sop_response(payload.query)

# 7. Live SQL Database Uploader (SQLite DB File replacement)
@app.post("/api/crowd/upload-db")
async def upload_sqlite_db(file: UploadFile = File(...)):
    """Ingests a custom SQLite database file (.db) to override the active database."""
    if not file.filename.endswith(".db"):
        raise HTTPException(status_code=400, detail="Only SQLite database (.db) files are allowed.")
        
    try:
        contents = await file.read()
        if len(contents) > 8 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Database file exceeds the 8MB safety limit.")
            
        db_path = "./stadiumos.db"
        temp_path = "./stadiumos_temp.db"
        with open(temp_path, "wb") as f:
            f.write(contents)
            
        engine.dispose()
        shutil.move(temp_path, db_path)
        return {
            "status": "success",
            "message": "SQLite database replaced successfully."
        }
    except Exception as e:
        logger.error(f"SQL database upload failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to load SQL database file: {str(e)}"
        )

# 8. De-escalation Behavioral Coach Endpoint (New V2.0)
@app.post("/api/deescalate", response_model=schemas.DeescalateResponse)
def get_deescalation_guide(payload: schemas.DeescalateRequest):
    """Generates de-escalation speaking scripts and body language tips for the volunteer."""
    try:
        result = handle_deescalation(payload.query, payload.tone, payload.context)
        return result
    except Exception as e:
        logger.error(f"De-escalation endpoint failure: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"De-escalation processing failed: {str(e)}"
        )

# 9. Ticket Vision Scanner Endpoint (New V2.0)
@app.post("/api/volunteer/vision-ticket", response_model=schemas.TicketVisionResponse)
def analyze_ticket_image(payload: schemas.TicketVisionRequest):
    """Analyzes base64 ticket image using Multimodal Vision."""
    try:
        result = handle_ticket_vision(payload.image_b64, payload.ticket_type, payload.filename or "")
        return result
    except Exception as e:
        logger.error(f"Ticket vision endpoint failure: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ticket vision analysis failed: {str(e)}"
        )

# 10. Ambient Proactive Insights Endpoint (New V2.0 Invisible AI)
@app.get("/api/ambient/insights", response_model=schemas.AmbientInsightsResponse)
def get_ambient_predictive_insights(db: Session = Depends(get_db)):
    """Proactively monitors stadium state and predicts issues before they arise."""
    try:
        return handle_ambient_insights(db)
    except Exception as e:
        logger.error(f"Ambient insights endpoint failure: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Predictive insights generation failed: {str(e)}"
        )

# 11. CCTV Surveillance Analysis Endpoint (New V2.0 "That's Brilliant")
@app.post("/api/operations/cctv-analysis", response_model=schemas.CctvTriageResponse)
def analyze_cctv_surveillance_feed(payload: schemas.CctvTriageRequest, db: Session = Depends(get_db)):
    """Analyzes security camera frames and auto-generates critical alerts."""
    try:
        result = handle_cctv_analysis(payload.image_b64, payload.scenario)
        if result.get("risk_index", 1) >= 8:
            alert = Alert(
                title=f"🚨 Visual Triage Alert: RISK LEVEL {result['risk_index']}",
                message=f"{result['anomaly_detected']}\nAction: {result['automated_dispatch_action']}",
                type="critical",
                active=True
            )
            db.add(alert)
            db.commit()
        return result
    except Exception as e:
        logger.error(f"CCTV analysis endpoint failure: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"CCTV visual analysis failed: {str(e)}"
        )

# 12. Multi-Agent Swarm Orchestrator Endpoint (New V2.0 Top 1% Engineering)
@app.post("/api/swarm/coordinate", response_model=schemas.SwarmResponse)
def coordinate_multi_agent_swarm(payload: schemas.SwarmRequest):
    """Coordinates a hierarchical multi-agent swarm to solve complex multi-dimensional events."""
    try:
        return handle_swarm_coordination(payload.event_description)
    except Exception as e:
        logger.error(f"Swarm coordination endpoint failure: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Swarm orchestration routing failed: {str(e)}"
        )

# Mount landing page static files at root if the folder exists
landing_dir = "landing"
if os.path.exists(landing_dir) and os.path.isdir(landing_dir):
    app.mount("/", StaticFiles(directory=landing_dir, html=True), name="landing")
else:
    logger.warning("Landing directory not found. Skipping static file mounting at root.")
