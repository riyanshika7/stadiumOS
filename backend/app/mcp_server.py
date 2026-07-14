import sys
import json
import logging
from sqlalchemy.orm import Session
from backend.app.db import SessionLocal
from backend.app.models import Incident, Alert

logging.basicConfig(level=logging.INFO, stream=sys.stderr)
logger = logging.getLogger("stadiumos-mcp")

def handle_initialize(request_id):
    """Responds to MCP initialize handshake."""
    response = {
        "jsonrpc": "2.0",
        "id": request_id,
        "result": {
            "protocolVersion": "2024-11-05",
            "capabilities": {
                "tools": {}
            },
            "serverInfo": {
                "name": "stadiumos-stadium-server",
                "version": "1.0.0"
            }
        }
    }
    return response

def handle_list_tools(request_id):
    """Lists available tools to the MCP client."""
    response = {
        "jsonrpc": "2.0",
        "id": request_id,
        "result": {
            "tools": [
                {
                    "name": "list_stadium_incidents",
                    "description": "Retrieve all logged stadium incidents (medical, security, hazards) from SQLite.",
                    "inputSchema": {
                        "type": "object",
                        "properties": {}
                    }
                },
                {
                    "name": "create_stadium_incident",
                    "description": "Log a new stadium incident (e.g. medical emergency, spill hazard) directly to the DB.",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "category": {"type": "string", "description": "medical, security, hazard, lost_found, or general"},
                            "location": {"type": "string", "description": "The gate, section, or concession stand"},
                            "description": {"type": "string", "description": "Detailed description of what occurred"},
                            "urgency": {"type": "string", "description": "low, medium, or high"}
                        },
                        "required": ["category", "location", "description"]
                    }
                },
                {
                    "name": "push_stadium_alert",
                    "description": "Broadcast a live operational warning or info alert to the volunteer alerts feed.",
                    "inputSchema": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string", "description": "Brief headline of the alert"},
                            "message": {"type": "string", "description": "Details of the broadcast message"},
                            "type": {"type": "string", "description": "info, warning, or critical"}
                        },
                        "required": ["title", "message"]
                    }
                }
            ]
        }
    }
    return response

def execute_tool(tool_name, arguments):
    """Executes the specific tool against the SQLite database."""
    db: Session = SessionLocal()
    try:
        if tool_name == "list_stadium_incidents":
            incidents = db.query(Incident).all()
            output = []
            for inc in incidents:
                output.append({
                    "id": inc.id,
                    "category": inc.category,
                    "location": inc.location,
                    "description": inc.description,
                    "urgency": inc.urgency,
                    "status": inc.status
                })
            return {"content": [{"type": "text", "text": json.dumps(output, indent=2)}]}
            
        elif tool_name == "create_stadium_incident":
            category = arguments.get("category", "general")
            location = arguments.get("location", "unknown")
            description = arguments.get("description", "")
            urgency = arguments.get("urgency", "low")
            
            incident = Incident(
                category=category,
                location=location,
                description=description,
                urgency=urgency,
                status="open"
            )
            db.add(incident)
            db.commit()
            db.refresh(incident)
            
            return {"content": [{"type": "text", "text": f"Successfully created incident ID {incident.id} with status open."}]}
            
        elif tool_name == "push_stadium_alert":
            title = arguments.get("title")
            message = arguments.get("message")
            alert_type = arguments.get("type", "info")
            
            alert = Alert(
                title=title,
                message=message,
                type=alert_type,
                active=True
            )
            db.add(alert)
            db.commit()
            
            return {"content": [{"type": "text", "text": f"Successfully broadcasted alert: '{title}'."}]}
            
        else:
            return {"isError": True, "content": [{"type": "text", "text": f"Unknown tool: {tool_name}"}]}
    except Exception as e:
        logger.error(f"MCP Tool Execution Error: {e}")
        return {"isError": True, "content": [{"type": "text", "text": str(e)}]}
    finally:
        db.close()

def main():
    logger.info("StadiumOS Stdio MCP Server started.")
    
    for line in sys.stdin:
        if not line.strip():
            continue
        try:
            request = json.loads(line)
            req_id = request.get("id")
            method = request.get("method")
            
            if method == "initialize":
                response = handle_initialize(req_id)
            elif method == "tools/list":
                response = handle_list_tools(req_id)
            elif method == "tools/call":
                params = request.get("params", {})
                name = params.get("name")
                arguments = params.get("arguments", {})
                
                result = execute_tool(name, arguments)
                response = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": result
                }
            else:
                response = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {
                        "code": -32601,
                        "message": f"Method not found: {method}"
                    }
                }
            
            sys.stdout.write(json.dumps(response) + "\n")
            sys.stdout.flush()
            
        except Exception as e:
            logger.error(f"Error handling MCP input line: {e}")

if __name__ == "__main__":
    main()
