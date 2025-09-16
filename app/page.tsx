"use client";

import { useState } from "react";
import Sidebar from "./components/sidebar";
import SolarSystem from "./components/SolarSystemView";
import EarthGlobeView from "./components/EarthGlobe";

export default function Page() {
  const [activeTab, setActiveTab] = useState("solarsystem");

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar with navigation */}
      <Sidebar />

      {/* Main content */}
      <div style={{ flex: 1, padding: "0", height: "100vh" }}>
        {activeTab === "solarsystem" && <SolarSystem />}
        {activeTab === "earthglobe" && <EarthGlobeView />}
      </div>
    </div>
  );
}
