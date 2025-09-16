"use client";

import { useEffect, useState } from "react";

interface MissionHeaderProps {
  missionName: string;
  status: string;
}

export default function MissionHeader({ missionName, status }: MissionHeaderProps) {
  const [timestamp, setTimestamp] = useState<string>("");

  useEffect(() => {
    // Initial timestamp
    setTimestamp(new Date().toLocaleString());

    // Update every second
    const interval = setInterval(() => {
      setTimestamp(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        background: "#1e293b",
        borderBottom: "1px solid #334155",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>{missionName}</h1>
      <div>
        <span
          style={{
            background: status === "Active" ? "#22c55e" : "#ef4444",
            padding: "5px 10px",
            borderRadius: "5px",
            marginRight: "15px",
          }}
        >
          {status}
        </span>
        <span style={{ opacity: 0.7 }}>{timestamp}</span>
      </div>
    </div>
  );
}
