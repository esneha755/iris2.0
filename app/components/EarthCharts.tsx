"use client";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function EarthCharts() {
  const barData = {
    labels: ["India", "USA", "Europe", "Japan", "Australia", "Brazil"],
    datasets: [
      {
        label: "Data Received (GB)",
        data: [2.1, 3.5, 2.8, 1.9, 1.2, 1.0],
        backgroundColor: "#3b82f6",
      },
    ],
  };

  const lineData = {
    labels: ["0h", "6h", "12h", "18h", "24h"],
    datasets: [
      {
        label: "Total Data Received (GB)",
        data: [0, 1.2, 3.8, 7.4, 12.5],
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.3)",
      },
    ],
  };

  return (
    <div style={{ display: "grid", gap: 24, margin: "20px" }}>
      <div style={{ background: "#111827", padding: 16, borderRadius: 8 }}>
        <Bar data={barData} />
      </div>
      <div style={{ background: "#111827", padding: 16, borderRadius: 8 }}>
        <Line data={lineData} />
      </div>
    </div>
  );
}
