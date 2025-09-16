"use client";
import { useEffect, useState } from "react";

export default function AIInsights({
  insights,
  loading,
}: {
  insights: string;
  loading: boolean;
}) {
  const [parsed, setParsed] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    if (!insights) return;

    const sections: { [key: string]: string[] } = {};
    let current = "General";

    insights.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.toLowerCase().includes("efficiency")) current = "Efficiency";
      else if (trimmed.toLowerCase().includes("resource")) current = "Resource Use";
      else if (trimmed.toLowerCase().includes("risk")) current = "Risks";
      else if (trimmed.toLowerCase().includes("recommend")) current = "Recommendations";
      else if (trimmed.toLowerCase().includes("conclusion")) current = "Conclusion";

      if (!sections[current]) sections[current] = [];
      sections[current].push(trimmed.replace(/^[-*●]/, "").trim());
    });

    setParsed(sections);
  }, [insights]);

  return (
    <div
      style={{
        background: "#0b1220",
        padding: 16,
        borderRadius: 8,
        color: "white",
        minHeight: 200,
      }}
    >
      <h3 style={{ marginBottom: 12, color: "#38bdf8", fontSize: "24px", fontWeight: 500 }}>AI Insights</h3>

      {loading ? (
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
          <style jsx>{`
            .dot {
              width: 8px;
              height: 8px;
              background: #38bdf8;
              border-radius: 50%;
              animation: bounce 1.4s infinite ease-in-out both;
            }
            .dot:nth-child(1) {
              animation-delay: -0.32s;
            }
            .dot:nth-child(2) {
              animation-delay: -0.16s;
            }
            @keyframes bounce {
              0%, 80%, 100% {
                transform: scale(0);
              }
              40% {
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      ) : Object.keys(parsed).length === 0 ? (
        <p style={{ color: "#9ca3af" }}>No insights available yet.</p>
      ) : (
        Object.entries(parsed).map(([section, bullets]) => (
          <div key={section} style={{ marginBottom: 12 }}>
            <h4 style={{ fontSize: "18px", marginBottom: 4, color: "#968bff", fontWeight: 500 }}>
              {section}
            </h4>
            <ul style={{ marginLeft: 16, color: "#d1d5db" }}>
              {bullets.map((b, idx) => (
                <li key={idx}>{b}</li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
