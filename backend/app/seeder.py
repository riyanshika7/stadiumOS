import datetime
from sqlalchemy.orm import Session
from backend.app.db import engine, Base
from backend.app.models import StadiumLocation, Alert, Incident

def seed_database(db: Session):
    # Create all tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Check if we already have locations seeded
    if db.query(StadiumLocation).count() > 0:
        return
        
    print("Pre-seeding database tables...")
    
    # 1. Seed Stadium Locations
    locations = [
        StadiumLocation(
            name="Gate A",
            type="gate",
            accessibility_features="wheelchair,braille,elevator",
            crowd_level="low",
            crowd_factor=1.0,
            description="Main west gate. Easy wheelchair and stroller access via elevator 1."
        ),
        StadiumLocation(
            name="Gate B",
            type="gate",
            accessibility_features="stairs",
            crowd_level="high",
            crowd_factor=2.5,
            description="Main north gate. Stairs only, experiencing high congestion."
        ),
        StadiumLocation(
            name="Gate C",
            type="gate",
            accessibility_features="wheelchair,ramp",
            crowd_level="moderate",
            crowd_factor=1.5,
            description="East gate. Gradual wheelchair ramp entry."
        ),
        StadiumLocation(
            name="Section 101",
            type="section",
            accessibility_features="wheelchair,braille,elevator",
            crowd_level="low",
            crowd_factor=1.0,
            description="Lower bowl section. Fully wheelchair accessible, adjacent to elevator 1."
        ),
        StadiumLocation(
            name="Section 102",
            type="section",
            accessibility_features="stairs",
            crowd_level="moderate",
            crowd_factor=1.2,
            description="Lower bowl section. Access via standard stairs only."
        ),
        StadiumLocation(
            name="Section 204",
            type="section",
            accessibility_features="stairs",
            crowd_level="high",
            crowd_factor=1.8,
            description="Upper deck section. Escalators nearby, stairs only for row access."
        ),
        StadiumLocation(
            name="Elevator 1",
            type="elevator",
            accessibility_features="wheelchair,braille,elevator",
            crowd_level="low",
            crowd_factor=1.0,
            description="Access elevator near West concourse."
        ),
        StadiumLocation(
            name="Ramp North",
            type="ramp",
            accessibility_features="wheelchair,ramp",
            crowd_level="moderate",
            crowd_factor=1.3,
            description="Main ramp leading to the upper deck."
        ),
        StadiumLocation(
            name="Restroom Block A",
            type="restroom",
            accessibility_features="wheelchair,restroom,family",
            crowd_level="low",
            crowd_factor=1.0,
            description="Fully accessible family restroom near Section 101."
        ),
        StadiumLocation(
            name="Concession Stand North",
            type="concession",
            accessibility_features="braille",
            crowd_level="high",
            crowd_factor=2.0,
            description="Food and drink stand. Braille menus available."
        )
    ]
    
    db.add_all(locations)
    
    # 2. Seed Mock Alerts
    alerts = [
        Alert(
            title="Gate B Congestion surge",
            message="Extreme crowd congestion at Gate B (Stairs). Direct wheelchair/stroller users and large groups to Gate A (Elevator) to avoid bottleneck delays.",
            type="warning",
            active=True
        ),
        Alert(
            title="Translation Assistance Notice",
            message="High volume of Spanish-speaking and French-speaking fans arriving. Ensure translators are active at Info Desk West.",
            type="info",
            active=True
        ),
        Alert(
            title="Weather Warning: Heat Index",
            message="Temperature expected to peak at 36°C (97°F). Watch out for signs of heat exhaustion in families and elderly fans.",
            type="warning",
            active=True
        )
    ]
    db.add_all(alerts)
    
    # 3. Seed Historical Incidents
    incidents = [
        Incident(
            category="hazard",
            urgency="low",
            location="Concession Stand North",
            description="Soft drink spilled near counter creating a slippery surface.",
            required_action="Dispatch cleaning crew with wet floor signs.",
            status="resolved",
            reported_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2),
            resolved_at=datetime.datetime.utcnow() - datetime.timedelta(hours=1, minutes=45)
        ),
        Incident(
            category="medical",
            urgency="high",
            location="Section 204 Row E",
            description="Elderly fan showing signs of severe dehydration, needs urgent cooling and assessment.",
            required_action="Dispatch medical responders with electrolytes and stretcher.",
            status="resolved",
            reported_at=datetime.datetime.utcnow() - datetime.timedelta(hours=1),
            resolved_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=30)
        ),
        Incident(
            category="lost_found",
            urgency="low",
            location="Restroom Block A",
            description="Found a child's toy camera. Handed over to lost & found desk.",
            required_action="Log in central registry and notify information booths.",
            status="open",
            reported_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=20)
        )
    ]
    db.add_all(incidents)
    
    db.commit()
    print("Database seeding completed successfully.")
