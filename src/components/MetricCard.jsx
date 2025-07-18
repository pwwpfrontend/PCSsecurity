// File: src/components/MetricCard.jsx
import React from "react";

const getStatusAndColor = (title, value) => {
  value = parseFloat(value);
  if (title === "Air Quality") {
    if (value <= 450) return { status: "Good", color: "green" };
    if (value <= 470) return { status: "Moderate", color: "orange" };
    return { status: "Poor", color: "red" };
  } else if (title === "Temperature") {
    if (value <= 22) return { status: "Cool", color: "blue" };
    if (value <= 26) return { status: "Normal", color: "green" };
    return { status: "Hot", color: "orange" };
  } else if (title === "Humidity") {
    if (value <= 40) return { status: "Low", color: "blue" };
    if (value <= 60) return { status: "Normal", color: "green" };
    return { status: "High", color: "orange" };
  }
  return { status: "Unknown", color: "gray" };
};

const getIcon = (title) => {
  if (title === "Air Quality") return "🌫️";
  if (title === "Temperature") return "🌡️";
  if (title === "Humidity") return "💧";
  return "🔍";
};

const MetricCard = ({ title, value, unit }) => {
  const { status, color } = getStatusAndColor(title, value);
  const icon = getIcon(title);

  // Progress range control (map value to percentage)
  let percentage = 0;
  if (title === "Air Quality") percentage = Math.min(100, (value / 800) * 100);
  else if (title === "Temperature") percentage = Math.min(100, (value / 40) * 100);
  else if (title === "Humidity") percentage = Math.min(100, (value / 100) * 100);

  // For a 180-degree arc, the full stroke length ≈ PI * r
  const radius = 40;
  const circumference = Math.PI * radius;

  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-sm mx-auto flex flex-col items-center justify-center">
      {/* Icon + Title */}
      <div className="flex items-center gap-2 text-gray-600 text-md sm:text-lg font-semibold mb-3">
        <span className="text-xl sm:text-2xl">{icon}</span>
        <span>{title}</span>
      </div>

      {/* SVG Semicircle Gauge */}
      <div className="relative w-32 h-16 sm:w-36 sm:h-18 md:w-40 md:h-20 mb-4">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          {/* Background Arc */}
          <path
            d="M10,50 A40,40 0 0,1 90,50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          {/* Progress Arc */}
          <path
            d="M10,50 A40,40 0 0,1 90,50"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        {/* Value Display */}
        <div className="absolute inset-0 flex items-end justify-center translate-y-1 sm:translate-y-2 text-lg sm:text-xl font-bold text-gray-900">
          <div className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
            {value}
            <span className="ml-1 text-sm font-medium text-gray-600">{unit}</span>
          </div>
        </div>
      </div>

      {/* Status Display */}
      <div className="flex items-center gap-2 mt-1">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        ></span>
        <span className="text-sm font-medium text-gray-700">{status}</span>
      </div>
    </div>
  );
};

export default MetricCard;
