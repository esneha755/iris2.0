"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import {
  CircleCheckBig,
  CircleX
} from "lucide-react";

type PastMission = {
  id: string;
  name: string;
  date: string;
  swarmCount: number;
  deltaV: number;
  duration: number;
  outcome: string;
  insights: string;
  swarmHealth: { status: string; value: number }[]; // for pie chart
  velocityOverTime: { step: number; velocity: number }[]; // for line chart
};

const COLORS = ["#22c55e", "#ef4444", "#fbbf24"];

export default function PastMissionCard({ mission }: { mission: PastMission }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: "#1f2937",
        color: "white",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "24px" }}>{mission.name}</h3>
          <small>{mission.date}</small>
        </div>
        <span
          style={{
            color:
              mission.outcome === "Success" ? "#22c55e" : "#ef4444",
                padding: "4px 8px",
                borderRadius: 4,
                fontSize: "14px",
                fontWeight: 500,
                display: "flex",
                width: "auto",
                justifyContent: "space-around",
          }}
        >   
        {mission.outcome === "Success" ? (
            <CircleCheckBig size={20} style={{
                marginRight: "10px"
            }} />
        ) : (
            <CircleX size={20} style={{
                marginRight: "10px"
            }}/>
        )}
        {mission.outcome}
        </span>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{ marginTop: 12 }}>
          <p>Swarm Count: {mission.swarmCount}</p>
          <p>Delta-V: {mission.deltaV} km/s</p>
          <p>Duration: {mission.duration} hours</p>

          <h4 style={{ marginTop: 12, fontSize: "20px" }}>Mission Charts</h4>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {/* Swarm Health Pie Chart */}
            <div style={{ flex: 1, minWidth: 200, height: 200 }}>
              <h5>Swarm Health</h5>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={mission.swarmHealth}
                    dataKey="value"
                    nameKey="status"
                    outerRadius={70}
                    label
                  >
                    {mission.swarmHealth.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Velocity Over Time */}
            <div style={{ flex: 1, minWidth: 300, height: 200 }}>
              <h5>Velocity Over Time</h5>
              <ResponsiveContainer>
                <LineChart data={mission.velocityOverTime}>
                  <XAxis dataKey="step" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="velocity" stroke="#3b82f6" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <h4 style={{ marginTop: 16 }}>AI Insights</h4>
          <p style={{ fontSize: "14px", opacity: 0.9 }}>{mission.insights}</p>
        </div>
      )}
    </div>
  );
}
