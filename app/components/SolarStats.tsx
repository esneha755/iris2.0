"use client";
import React from "react";

export default function SolarStats({ stats }: { stats: any }) {
  const cards = [
    { label: "Active Missions", value: stats.activeMissions },
    { label: "Avg Altitude", value: `${stats.avgAltitude} km` },
    { label: "Coverage", value: `${stats.coverage}%` },
    { label: "Delta-V Used", value: `${stats.deltaV} km/s` },
  ];

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {cards.map((c, i) => (
        <div key={i} style={{
          background: "#1f2937",
          padding: "12px 16px",
          borderRadius: 8,
          color: "white"
        }}>
          <p style={{ fontSize: 14 }}>{c.label}</p>
          <h3 style={{ fontSize: 20, fontWeight: "bold" }}>{c.value}</h3>
        </div>
      ))}
    </div>
  );
}
