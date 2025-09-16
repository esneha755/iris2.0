from fastapi import APIRouter
from pydantic import BaseModel
import random
import google.generativeai as genai
import os

router = APIRouter()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class GenerateInput(BaseModel):
    target: str
    days: int
    swarm_count: int
    delta_v_budget: float
    target_angle_deg: float

@router.post("/generate")
def generate_trajectory(input: GenerateInput):
    """Generate swarm trajectories with Gemini"""
    prompt = f"""
    Generate {input.swarm_count} nanosatellite trajectory paths around {input.target}
    for {input.days} days, with delta-V budget {input.delta_v_budget} km/s and launch angle {input.target_angle_deg}.
    Output JSON: array of arrays of 3D positions (x,y,z).
    """

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        return {
            "id": f"traj-{random.randint(1000,9999)}",
            "trajectories": response.text
        }
    except Exception as e:
        return {
            "id": f"traj-{random.randint(1000,9999)}",
            "trajectories": [],
            "error": str(e)
        }
