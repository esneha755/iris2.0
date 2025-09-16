"use client";

export default function EarthStats({ stats }: { stats: Record<string, number | string> }) {
  return (
    <div style={{ display: "grid", gap: 16, margin: "20px" }}>
      {Object.entries(stats).map(([key, value]) => (
        <div
          key={key}
          style={{
            padding: 16,
            background: "#1f2937",
            borderRadius: 8,
            textAlign: "center",
            color: "white",
          }}
        >
          <h4 style={{ fontSize: "14px", marginBottom: 6 }}>{key}</h4>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>
            {String(value)}
          </p>
        </div>
      ))}
    </div>
  );
}
