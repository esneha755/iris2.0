from http import client
import uuid
from fastapi import APIRouter
from pydantic import BaseModel
import os
import random
from dotenv import load_dotenv
import google.generativeai as genai

# Load .env variables
load_dotenv()

router = APIRouter()


# Get Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini client only if API key is available
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class SimInput(BaseModel):
    swarm_count: int
    delta_v_budget: float
    target_distance_au: float
    sim_duration_hours: int
    target_angle_deg: float
    steps: int

class InsightsResponse(BaseModel):
    id: str
    insights: str

@router.post("/insights", response_model=InsightsResponse)
def generate_ai_insights(metrics: dict):
    """Generate short AI mission insights using Google Gemini."""
    prompt = f"""
    Summarize the nanosatellite mission with metrics: {metrics}.
    Provide a short bullet-point list with:
    - Mission efficiency
    - Key risks
    - Recommendations
    Keep it under 5 bullets, concise and clear.
    """

    try:
        if not GEMINI_API_KEY:
            return {
                "id": "insights-fallback",
                "insights": "[Fallback] AI unavailable. Keep delta-v optimized. Monitor fuel and trajectory."
            }
        
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        if response and response.candidates:
            text = response.candidates[0].content.parts[0].text.strip()
        else:
            text = "No insights generated."
        return {"id": f"insights-{random.randint(1000,9999)}", "insights": text}
    except Exception as e:
        return {
            "id": "insights-error",
            "insights": f"AI engine unavailable. Fallback insights: Keep delta-v optimized. Error: {e}"
        }

@router.post("/simulate")
def simulate_trajectory(params: SimInput):
    points = [[random.random(), random.random(), random.random()] for _ in range(params.steps)]
    
    return {
        "id": f"sim-{uuid.uuid4().hex[:6]}",  # unique ID
        "message": f"Simulated {params.swarm_count} nanosats for {params.sim_duration_hours}h",
        "points": points,
        "ts": str(uuid.uuid1())  # timestamp for ordering (optional)
    }
