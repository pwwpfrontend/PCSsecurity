// File: src/pages/Dashboard.jsx  
import React, { useEffect, useState } from "react";
import { MetricCard, MeetingRooms } from ".";

const API_URL = "https://njs-01.optimuslab.space/pcs/optimus/9in1_iaq_live";

const Dashboard = () => {
  // Start with placeholders so the layout doesn't jump while data loads
  const [metrics, setMetrics] = useState([
    { title: "Air Quality", value: null, unit: "%" },
    { title: "Temperature", value: null, unit: "°C" },
    { title: "Humidity", value: null, unit: "%" },
  ]);

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
    <div className="bg-gray-50 min-h-full lg:h-full flex flex-col px-6 py-6 gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-xl font-semibold">
          {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" })},{" "}
          {new Date().toLocaleDateString("en-IN", { weekday: "long" })}
        </p>
      </div>

      {/* IAQ, Temperature, Humidity — large cards that grow to fill the space */}
      <section className="flex-1 min-h-[280px] max-h-[440px] grid gap-6 grid-cols-1 md:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </section>

      {/* Meeting Rooms */}
      <section>
        <MeetingRooms />
      </section>
    </div>
  );
};

export default Dashboard;