"use client";

import { useState } from "react";

type ControlsPanelProps = {
  onSim: (params: any) => Promise<void>; // 👈 define onSim prop
};

export default function ControlsPanel({ onSim }: ControlsPanelProps) {
  const [swarmCount, setSwarmCount] = useState(24);
  const [deltaV, setDeltaV] = useState(0.5);
  const [distance, setDistance] = useState(0.01);
  const [duration, setDuration] = useState(48);
  const [targetAngle, setTargetAngle] = useState(45);

  return (
    <div style={{ padding: 16, background: "#0b1220", borderRadius: 8, color: "white" }}>
      <h3 style={{ marginBottom: 8 }}>Simulation Controls</h3>
      <div style={{ display: "grid", gap: 8 }}>
        <label>Swarm count: {swarmCount}</label>
        <input
          type="range"
          min={1}
          max={96}
          value={swarmCount}
          onChange={(e) => setSwarmCount(parseInt(e.target.value))}
        />

        <label>Delta-V budget (km/s): {deltaV}</label>
        <input
          type="range"
          min={0.1}
          max={2}
          step={0.01}
          value={deltaV}
          onChange={(e) => setDeltaV(parseFloat(e.target.value))}
        />

        <label>Target offset (AU): {distance}</label>
        <input
          type="range"
          min={0.001}
          max={0.05}
          step={0.001}
          value={distance}
          onChange={(e) => setDistance(parseFloat(e.target.value))}
        />

        <label>Sim duration (hours): {duration}</label>
        <input
          type="range"
          min={1}
          max={168}
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
        />

        <label>Target angle (deg): {targetAngle}</label>
        <input
          type="range"
          min={0}
          max={360}
          value={targetAngle}
          onChange={(e) => setTargetAngle(parseInt(e.target.value))}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            onClick={() =>
              onSim({
                swarm_count: swarmCount,
                delta_v_budget: deltaV,
                target_distance_au: distance,
                sim_duration_hours: duration,
                target_angle_deg: targetAngle,
                steps: 300,
              })
            }
            style={{
              padding: "10px 24px",
              background: "#04369e",
              border: "none",
              color: "white",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Simulate
          </button>
        </div>
      </div>
    </div>
  );
}
