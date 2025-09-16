
from fastapi import APIRouter
from pydantic import BaseModel
import random
import google.generativeai as genai
import os
import json
import numpy as np
from datetime import datetime
from poliastro.twobody import Orbit
from poliastro.bodies import Earth
from poliastro.maneuver import Maneuver
from astropy.time import Time
from astropy import units as u

router = APIRouter()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class GenerateInput(BaseModel):
    target: str
    days: int
    swarm_count: int
    delta_v_budget: float
    target_angle_deg: float

class MissionParameters(BaseModel):
    target_name: str
    intercept_epoch: float
    swarm_size: int
    role_split: str
    propulsion_type: str

def generate_trajectory_data(initial_orbit, time_of_flight, steps=50):
    """
    Generates detailed trajectory data by propagating an orbit.
    
    Args:
        initial_orbit (poliastro.twobody.Orbit): The starting orbit of the swarm.
        time_of_flight (astropy.Quantity): Total duration of the mission (e.g., 280 * u.day).
        steps (int): Number of points to generate in the trajectory.
    
    Returns:
        list: A list of dictionaries containing position, velocity, and time for each point.
    """
    trajectory_points = []
    
    # Create time values for propagation (from start to end of mission)
    time_steps = np.linspace(0, 1, steps) * time_of_flight
    
    # Propagate orbit to each time value and store the state
    for dt in time_steps:
        propagated_orbit = initial_orbit.propagate(dt)
        
        # Get position and velocity in Cartesian coordinates
        r = propagated_orbit.r  # Position vector (km)
        v = propagated_orbit.v  # Velocity vector (km/s)
        
        # Calculate distance from the central body (e.g., Sun)
        distance = np.sqrt(np.dot(r, r))
        
        # Calculate the actual time for this point
        current_time = initial_orbit.epoch + dt
        
        # Create a data point for this time step
        point_data = {
            "datetime": current_time.iso,
            "x": float(r[0].value if hasattr(r[0], 'value') else r[0]),
            "y": float(r[1].value if hasattr(r[1], 'value') else r[1]),
            "z": float(r[2].value if hasattr(r[2], 'value') else r[2]),
            "vx": float(v[0].value if hasattr(v[0], 'value') else v[0]),
            "vy": float(v[1].value if hasattr(v[1], 'value') else v[1]),
            "vz": float(v[2].value if hasattr(v[2], 'value') else v[2]),
            "distance": float(distance.value if hasattr(distance, 'value') else distance),
            "source": "poliastro_propagation"
        }
        trajectory_points.append(point_data)
    
    return trajectory_points

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

@router.post("/api/simulate")
async def simulate_mission(mission_params: MissionParameters):
    """Generate and save detailed trajectory data for a mission"""
    # Mock calculations for demonstration
    total_delta_v = 8.5
    time_of_flight = 280 * u.day
    fuel_required = 50.4
    success_prob = 0.95
    launch_epoch = mission_params.intercept_epoch
    
    # 1. Calculate the initial transfer orbit
    earth_orbit = Orbit.from_body_ephem(Earth, Time(launch_epoch, format='jd'))
    # For demonstration, use a simple maneuver (replace with Lambert for real use)
    maneuver = Maneuver.impulse([0, 0.5, 0] * u.km / u.s)
    initial_transfer_orbit = earth_orbit.apply_maneuver(maneuver)
    
    # 2. GENERATE THE TRAJECTORY DATA
    trajectory_data = generate_trajectory_data(
        initial_orbit=initial_transfer_orbit,
        time_of_flight=time_of_flight,
        steps=100  # Generate 100 points along the trajectory
    )
    
    # 3. Save the trajectory data to a JSON file
    mission_id = f"mission_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    trajectories_dir = os.path.join(os.path.dirname(__file__), "trajectories")
    os.makedirs(trajectories_dir, exist_ok=True)
    filename = os.path.join(trajectories_dir, f"{mission_id}.json")
    
    # Save to file
    with open(filename, 'w') as f:
        json.dump({
            "mission_id": mission_id,
            "parameters": mission_params.dict(),
            "calculations": {
                "delta_v": total_delta_v,
                "time_of_flight": time_of_flight.value,
                "fuel_required": fuel_required
            },
            "trajectory": trajectory_data  # This is the full path
        }, f, indent=2)
    
    # 4. Print a sample to the terminal (first 3 points)
    print(f"\n🎯 Generated trajectory for {mission_id}")
    print("📋 First 3 trajectory points:")
    for i, point in enumerate(trajectory_data[:3]):
        print(f"   Point {i+1}: {point['datetime']}")
        print(f"     Position: ({point['x']:.2f}, {point['y']:.2f}, {point['z']:.2f}) km")
        print(f"     Velocity: ({point['vx']:.3f}, {point['vy']:.3f}, {point['vz']:.3f}) km/s")
        print(f"     Distance: {point['distance']:.3f} km")
    
    # 5. Return the results INCLUDING the trajectory
    return {
        "status": "success",
        "mission_id": mission_id,
        "calculations": {
            "delta_v": total_delta_v,
            "time_of_flight": time_of_flight.value,
            "fuel_required": fuel_required,
            "success_probability": success_prob
        },
        "trajectory_points": len(trajectory_data),
        "trajectory_file": filename  # Tell the frontend where the data was saved
    }

@router.get("/api/trajectory/{mission_id}")
async def get_trajectory_data(mission_id: str, sample: int = 3):
    """
    Retrieves and displays saved trajectory data.
    """
    trajectories_dir = os.path.join(os.path.dirname(__file__), "trajectories")
    filename = os.path.join(trajectories_dir, f"{mission_id}.json")
    
    if not os.path.exists(filename):
        return {"error": f"Trajectory file {mission_id} not found"}
    
    with open(filename, 'r') as f:
        data = json.load(f)
    
    # Print to terminal
    print(f"\n📊 Retrieving trajectory: {mission_id}")
    print(f"📈 Total points: {len(data['trajectory'])}")
    print(f"🚀 Mission parameters: {data['parameters']['target_name']}")
    print(f"⛽ Delta-V: {data['calculations']['delta_v']} km/s")
    
    # Show sample points
    print(f"\n🔍 Sample of first {sample} points:")
    for i, point in enumerate(data['trajectory'][:sample]):
        print(f"   {i+1}. {point['datetime']} - Pos: ({point['x']:.2f}, {point['y']:.2f}, {point['z']:.2f}) km")
    
    return data
