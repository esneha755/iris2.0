"use client";

import { useEffect, useState } from "react";

export default function MissionLogs() {
  const [logs, setLogs] = useState<string[]>([
    "Launched successfully at 09:14 UTC",
    "Achieved stable orbit at 550 km",
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = `Telemetry update received at ${new Date().toLocaleTimeString()}`;
      setLogs((prev) => [newLog, ...prev].slice(0, 8)); // keep last 8 logs
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        background: "#1f2937",
        color: "white",
        height: "200px",
        overflowY: "auto",
      }}
    >
      <h2 style={{ marginBottom: "10px" }}>Mission Logs</h2>
      <ul>
        {logs.map((log, i) => (
          <li key={i} style={{ marginBottom: "5px", fontSize: "14px" }}>
            {log}
          </li>
        ))}
      </ul>
    </div>
  );
}
