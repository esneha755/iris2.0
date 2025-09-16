"use client";

export default function TrajectoryLogs({ logs }: { logs: any[] }) {
  return (
    <div style={{ padding: 16, background: "#111827", borderRadius: 8, color: "white" }}>
      <h3 style={{ marginBottom: 8 }}>Trajectory Logs</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "300px", overflowY: "auto" }}>
        {logs.length === 0 ? (
          <p style={{ color: "#9ca3af" }}>No simulations yet.</p>
        ) : (
          logs.map((sim, idx) => (
            <div
              key={`${sim.id}-${idx}`} // fallback uniqueness
              style={{
                padding: 12,
                background: "#1f2937",
                borderRadius: 6,
                fontSize: "14px",
              }}
            >
              <h4>{sim.message}</h4>
              {sim.ts && (
                <p style={{ fontSize: "12px", color: "#9ca3af" }}>
                  {new Date(sim.ts).toLocaleTimeString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
