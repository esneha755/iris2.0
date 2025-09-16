"use client";

import Sidebar from "../components/sidebar";
import PastMissionsList from "../components/PastMissionList";

export default function PastMissionsPage() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, background: "#0b1220", height: "100vh", overflowY: "auto" }}>
        <PastMissionsList />
      </div>
    </div>
  );
}
