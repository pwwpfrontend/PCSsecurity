// File: src/pages/Dashboard.jsx  
import React, { useEffect, useState } from "react";
import {
  Header,
  MetricCard,
  OccupancyChart,
  OccupancyLoadChart,
  MeetingRooms,
} from "../components"; // ✅ fixed path

import dummyMetrics from "../data/dummyMetrics";

const Dashboard = () => {
  const [metrics, setMetrics] = useState(dummyMetrics);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) => ({
          ...metric,
          value:
            metric.title === "Air Quality"
              ? (400 + Math.random() * 20).toFixed(1)
              : metric.title === "Temperature"
              ? (20 + Math.random() * 5).toFixed(1)
              : (50 + Math.random() * 15).toFixed(1),
        }))
      );
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-between px-4 pt-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-xl font-semibold">
  {new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  })}
</p>

      </div>
      <main className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </main>
      <section className="p-4 grid gap-4 md:grid-cols-2">
        <OccupancyChart />
        <OccupancyLoadChart />
      </section>
      <section className="p-4">
        <MeetingRooms />
      </section>
    </div>
  );
};

export default Dashboard;
