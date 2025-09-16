"use client";

const phases = ["Launch", "Orbiting", "Intercepting", "Data Relay"];

export default function MissionTimeline() {
  return (
    <div style={{ padding: "20px", background: "#111827", color: "white" }}>
      <h2 style={{ marginBottom: "10px" }}>Mission Timeline</h2>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {phases.map((phase, i) => (
          <div key={i} style={{ textAlign: "center", flex: 1 }}>
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: i <= 1 ? "#60a5fa" : "#374151", // first 2 completed
                margin: "0 auto",
              }}
            ></div>
            <p style={{ fontSize: "14px", marginTop: "5px" }}>{phase}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
