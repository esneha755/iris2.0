"use client";
import { Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement } from "chart.js";

ChartJS.register(LineElement, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement);

export default function SolarCharts() {
  const lineData = {
    labels: ["0h", "12h", "24h", "36h", "48h"],
    datasets: [
      {
        label: "Delta-V Used (km/s)",
        data: [0, 0.2, 0.35, 0.5, 0.79],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.3)",
      },
    ],
  };

  const pieData = {
    labels: ["Active", "Standby", "Failed"],
    datasets: [
      {
        data: [40, 3, 1],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
      },
    ],
  };

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ background: "#111827", padding: 16, borderRadius: 8 }}>
        <Line data={lineData} />
      </div>
      <div style={{ background: "#111827", padding: 16, borderRadius: 8 }}>
        <Pie data={pieData} />
      </div>
    </div>
  );
}
