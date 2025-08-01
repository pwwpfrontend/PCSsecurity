import React from "react";
import { Wind, ThermometerSun, Droplets } from "lucide-react";

const getStatusAndColor = (title, value) => {
  value = parseFloat(value);

if (title === "Air Quality") {
  if (value > 1000) return { status: "Bad", color: "#e47a7c" };         // Red
  if (value > 800) return { status: "Normal", color: "#ff9800" };       // Orange
  return { status: "Good", color: "#4caf50" };                          // Green
}


  if (title === "Temperature") {
    if (value <= 22) return { status: "Good", color: "#4caf50" };         // Green
    if (value <= 26) return { status: "Normal", color: "#ff9800" };       // Orange
    return { status: "Bad", color: "#e47a7c" };                                // Red
  }

  if (title === "Humidity") {
    if (value <= 40) return { status: "Bad", color: "#e47a7c" };              // Red (too dry)
    if (value <= 60) return { status: "Good", color: "#4caf50" };         // Green (ideal)
    return { status: "Normal", color: "#ff9800" };                         // Orange (too humid)
  }

  return { status: "Unknown", color: "gray" };
};


const getIcon = (title) => {
  const iconSize = "w-7 h-7"; // Increased icon size

  if (title === "Air Quality")
    return <Wind className={`${iconSize}`} color="#97a7ff" />; // Light blue
  if (title === "Temperature")
    return <ThermometerSun className={`${iconSize}`} color="#cc8965" />; // Light orange
  if (title === "Humidity")
    return <Droplets className={`${iconSize}`} color="#3b75ea" />; // Light green
  return null;
};

const MetricCard = ({ title, value, unit }) => {
  const numericValue = parseFloat(value);
  const { status, color } = getStatusAndColor(title, numericValue);

  let percentage = 0;
  if (title === "Air Quality") percentage = Math.min(100, (numericValue / 1000) * 100);
  else if (title === "Temperature") percentage = Math.min(100, (numericValue / 40) * 100);
  else if (title === "Humidity") percentage = Math.min(100, (numericValue / 100) * 100);

  const radius = 40;
  const circumference = Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;


  return (
    <div className="bg-white rounded-xl shadow-sm p-4 w-full border border-gray-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-black-700 text-lg font-semibold">{title}</div>
        {getIcon(title)}
      </div>

      {/* Centered Inner Content */}
      <div className="flex flex-col items-center justify-center">
        {/* Semicircle Gauge */}
        <div className="relative w-32 h-22 mb-4">
          <svg viewBox="0 0 100 50" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M10,50 A40,40 0 0,1 90,50"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="10"
            />
            {/* Colored progress arc */}
            <path
              d="M10,50 A40,40 0 0,1 90,50"
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>

          {/* Value Display */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-end translate-y-4"
            style={{ color }}
          >
           <div className="text-lg font-bold">
  {parseFloat(value).toFixed(1)}
</div>


            <div className="text-sm text-gray-600 -mt-1">{unit}</div>
          </div>
        </div>

        {/* Status Display */}
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
          <span className="text-sm font-medium text-gray-700">{status}</span>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
