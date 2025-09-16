from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from astropy import units as u
from poliastro.bodies import Earth, Sun, Mars
from poliastro.twobody import Orbit
from datetime import datetime

import uvicorn
from trajectory import generate_ai_insights
from trajectory import router as trajectory_router
from contextlib import asynccontextmanager

app = FastAPI(title="IRIS Controls Backend")

async def lifespan(app: FastAPI):
    print("Started")
    yield
    print("Shutting down")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Models ---
class TrajectoryPoint(BaseModel):
    x: float
    y: float
    z: float


class TrajectoryResponse(BaseModel):
    id: str
    positions: list[TrajectoryPoint]


# --- Simple GET trajectory ---
@app.get("/trajectory", response_model=TrajectoryResponse)
def get_trajectory(
    alt: float = Query(500, description="Orbit altitude in km (for Earth or Mars)"),
    body: str = Query("earth", description="Central body: earth, mars, sun"),
    points: int = Query(200, description="Number of trajectory points"),
):
    """Generate a nanosat trajectory with query parameters."""

    if body.lower() == "earth":
        orbit = Orbit.circular(Earth, alt * u.km)
    elif body.lower() == "mars":
        orbit = Orbit.circular(Mars, alt * u.km)
    elif body.lower() == "sun":
        orbit = Orbit.circular(Sun, 1 * u.AU)  # Earth-like orbit
    else:
        return {"id": "error", "positions": []}

    # Generate trajectory points
    positions = []
    epoch = datetime.utcnow()
    period = orbit.period.to(u.s).value if orbit.period is not None else 86400
    step = period / points

    for i in range(points):
        sample = orbit.propagate(i * step * u.s)
        r = sample.r.to(u.km).value
        positions.append({"x": float(r[0]), "y": float(r[1]), "z": float(r[2])})

    return {"id": f"nanosat-{body}", "positions": positions}


# --- Include advanced simulation routes ---
app.include_router(trajectory_router, prefix="/trajectory", tags=["trajectory"])

@app.post("/trajectory/simulate")
async def simulate_trajectory(params: dict):
    # Mocked example response
    metrics = {
        "intercept_time": 42,
        "velocity": 7.8,
        "delta_v_used": params.get("delta_v_budget", 0.5),
        "swarm_count": params.get("swarm_count", 24),
    }

    insights = generate_ai_insights(metrics)

    return {
        "id": "sim-001",
        "message": f"Simulated {metrics['swarm_count']} nanosats",
        "metrics": metrics,
        "insights": insights,
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host = "127.0.0.1", 
        port=8000,
        reload = True,
        lifespan = "off"
    )