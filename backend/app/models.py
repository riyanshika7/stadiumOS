import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from backend.app.db import Base

class StadiumLocation(Base):
    __tablename__ = "stadium_locations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    type = Column(String, nullable=False)  # section, gate, elevator, ramp, restroom, concession
    accessibility_features = Column(String, default="")  # comma-separated (e.g. wheelchair,braille,family)
    crowd_level = Column(String, default="low")  # low, moderate, high
    crowd_factor = Column(Float, default=1.0)  # delay multiplier
    description = Column(String, default="")

class Incident(Base):
    __tablename__ = "incidents"
    
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True, nullable=False)  # medical, security, hazard, lost_found, general
    urgency = Column(String, index=True, default="low")  # low, medium, high
    location = Column(String, default="unknown")
    description = Column(String, nullable=False)
    required_action = Column(String, default="")
    status = Column(String, default="open")  # open, in_progress, resolved
    reported_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, default="info")  # info, warning, critical
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
