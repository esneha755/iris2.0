"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export default function NewTrajectoryModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState("Earth");
  const [days, setDays] = useState(30);
  const [swarms, setSwarms] = useState(12);
  const [deltaV, setDeltaV] = useState(0.8);
  const [angle, setAngle] = useState(45);

  const handleLaunch = async () => {
    const params = {
      target,
      days,
      swarm_count: swarms,
      delta_v_budget: deltaV,
      target_angle_deg: angle,
    };

    // Call backend Gemini endpoint
    const res = await fetch("http://localhost:8000/trajectory/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = await res.json();

    // Open in new tab with scenario data
    const url = `/solar-system/${data.id}`;
    window.open(url, "_blank");
    setIsOpen(false);
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 16px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        <Plus size={18} /> New Trajectory
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ background: "#1f2937", padding: 24, borderRadius: 8, width: 400 }}>
            <h2 style={{ color: "white", marginBottom: 16 }}>New Trajectory</h2>

            <label style={{ color: "white" }}>Target:</label>
            <select value={target} onChange={(e) => setTarget(e.target.value)} style={{ width: "100%", marginBottom: 12 }}>
              <option>Earth</option>
              <option>Mars</option>
              <option>Jupiter</option>
              <option>Saturn</option>
            </select>

            <label style={{ color: "white" }}>Duration (days):</label>
            <input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ width: "100%", marginBottom: 12 }} />

            <label style={{ color: "white" }}>Swarm Count:</label>
            <input type="number" value={swarms} onChange={(e) => setSwarms(Number(e.target.value))} style={{ width: "100%", marginBottom: 12 }} />

            <label style={{ color: "white" }}>Delta-V Budget (km/s):</label>
            <input type="number" step="0.01" value={deltaV} onChange={(e) => setDeltaV(Number(e.target.value))} style={{ width: "100%", marginBottom: 12 }} />

            <label style={{ color: "white" }}>Launch Angle (deg):</label>
            <input type="number" value={angle} onChange={(e) => setAngle(Number(e.target.value))} style={{ width: "100%", marginBottom: 12 }} />

            <button
              onClick={handleLaunch}
              style={{
                width: "100%",
                padding: "10px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: 6,
                marginTop: 12,
                cursor: "pointer",
              }}
            >
              Launch 
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
