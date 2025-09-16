"use client";
import { useEffect, useState } from "react";

export default function MissionMetrics({ metrics }: { metrics: Record<string, number> }) {
  const [displayMetrics, setDisplayMetrics] = useState<Record<string, number>>(metrics);

  useEffect(() => {
    let frame: number;
    const start = { ...displayMetrics };
    const duration = 800; // ms
    const startTime = performance.now();

    const animate = (ts: number) => {
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const newMetrics: Record<string, number> = {};
      Object.keys(metrics).forEach((key) => {
        const startVal = start[key] ?? 0; // if undefined → start at 0
        const endVal = metrics[key];
        newMetrics[key] = Math.floor(startVal + (endVal - startVal) * progress);
      });

      setDisplayMetrics(newMetrics);

      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [metrics]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
      {Object.entries(displayMetrics).map(([key, value]) => (
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
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>{value}</p>
        </div>
      ))}
    </div>
  );
}
