"use client";

import { useEffect, useState } from "react";

interface MissionStatsProps {
  stats: { label: string; value: number; unit?: string }[];
}

function AnimatedStat({ label, value, unit }: { label: string; value: number; unit?: string }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let frame: number;
    let startValue = displayValue;
    let endValue = value;
    let startTime: number | null = null;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / 1000, 1); // 1 sec animation
      const current = startValue + (endValue - startValue) * progress;
      setDisplayValue(current);

      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div
      style={{
        background: "#1f2937",
        padding: "15px",
        borderRadius: "8px",
        color: "white",
        textAlign: "center",
      }}
    >
      <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>{label}</h3>
      <p style={{ fontSize: "20px", fontWeight: "bold", color: "#60a5fa" }}>
        {displayValue.toFixed(2)} {unit}
      </p>
    </div>
  );
}

export default function MissionStats({ stats }: MissionStatsProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", padding: "20px" }}>
      {stats.map((s, i) => (
        <AnimatedStat key={i} label={s.label} value={s.value} unit={s.unit} />
      ))}
    </div>
  );
}
