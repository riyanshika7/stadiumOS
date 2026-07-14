import httpx
import logging

logger = logging.getLogger(__name__)

# MetLife Stadium Coordinates (New York/New Jersey Host)
METLIFE_LAT = 40.8135
METLIFE_LON = -74.0744

async def fetch_live_stadium_weather() -> dict:
    """
    Fetches real-time weather parameters for MetLife Stadium from the open-source Open-Meteo API.
    Does not require API keys, making it robust for live evaluation.
    """
    url = f"https://api.open-meteo.com/v1/forecast?latitude={METLIFE_LAT}&longitude={METLIFE_LON}&current=temperature_2m,relative_humidity_2m,rain,showers,snowfall,weather_code&temperature_unit=celsius"
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = client.get(url)
            # Fetch synchronously if inside synchronous code block, but we use async
            res = await client.get(url)
            if res.status_code == 200:
                data = res.json()
                current = data.get("current", {})
                temp = current.get("temperature_2m", 20.0)
                humidity = current.get("relative_humidity_2m", 50)
                rain = current.get("rain", 0.0)
                showers = current.get("showers", 0.0)
                
                # Formulate dynamic warnings
                warnings = []
                alert_type = "info"
                
                if temp >= 32.0:
                    warnings.append(f"Heat Alert: Live temperature is {temp}°C ({temp*1.8+32:.1f}°F) with high UV. Advise fans to stay hydrated.")
                    alert_type = "warning"
                elif temp <= 10.0:
                    warnings.append(f"Cold Alert: Live temperature is {temp}°C ({temp*1.8+32:.1f}°F). Watch out for hypothermia risks in young/elderly fans.")
                    alert_type = "info"
                    
                if rain > 0.0 or showers > 0.0:
                    warnings.append(f"Precipitation Warning: Active rain detected at stadium ({rain + showers}mm). Outer concourse ramps are slippery. Direct fans to covered seating.")
                    alert_type = "warning"
                    
                return {
                    "success": True,
                    "temperature": temp,
                    "humidity": humidity,
                    "warnings": warnings,
                    "type": alert_type
                }
    except Exception as e:
        logger.error(f"Failed to fetch live weather API: {e}")
        
    return {
        "success": False,
        "temperature": 22.0,
        "humidity": 45,
        "warnings": [],
        "type": "info"
    }
