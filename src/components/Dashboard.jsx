// File: src/pages/Dashboard.jsx  
import React, { useEffect, useState } from "react";
import {
  MetricCard,
  OccupancyChart,
  OccupancyLoadChart,
  MeetingRooms,
} from "."; // ✅ fixed path

const API_URL = "https://njs-01.optimuslab.space/pcs/optimus/9in1_iaq_live";

const Dashboard = () => {
  const [metrics, setMetrics] = useState([]);

  // Function to fetch metrics from API
  const fetchMetrics = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (data && data.length > 0) {
        const d = data[0];
        setMetrics([
          { title: "Air Quality", value: d.score, unit: "%" },
          { title: "Temperature", value: d.temperature, unit: "°C" },
          { title: "Humidity", value: d.humidity, unit: "%" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  useEffect(() => {
    fetchMetrics(); // initial fetch
    const interval = setInterval(fetchMetrics, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-50">
      <div className="flex items-center justify-between px-6 pt-6 mb-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-xl font-semibold">
          {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" })},{" "}
          {new Date().toLocaleDateString("en-IN", { weekday: "long" })}
        </p>
      </div>

      {/* ✅ Metric Cards */}
      <main className="px-6 pt-4 mb-4 grid gap-7 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </main>

      {/* ✅ Charts - OccupancyChart now fetches data independently */}
      <section className="px-6 py-4 grid gap-7 md:grid-cols-2">
        <OccupancyChart />
        <OccupancyLoadChart />
      </section>

      {/* ✅ Meeting Rooms */}
      <section className="px-6 py-4 mb-4">
        <MeetingRooms />
      </section>
    </div>
  );
};

export default Dashboard;