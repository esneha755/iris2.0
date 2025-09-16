"use client";

import Sidebar from "../components/sidebar";
import EarthGlobeView from "../components/EarthGlobe";
import { SetStateAction } from "react";
import EarthCharts from "../components/EarthCharts";
import EarthStats from "../components/EarthStats";

export default function EarthGlobePage() {
    const dummyStats = {
    "Active Stations": 6,
    "Total Data Received (GB)": 12.5,
    "Uplink Success Rate (%)": 94,
    "Coverage (%)": 72,
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, height: "100vh" }}>
        <EarthGlobeView />
      </div>
      <div>
        <EarthStats stats={dummyStats} />
        <EarthCharts/>
      </div>
    </div>
  );
}
