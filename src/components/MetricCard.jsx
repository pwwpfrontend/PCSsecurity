import React from "react";
import { Wind, ThermometerSun, Droplets } from "lucide-react";

const getStatusAndColor = (title, value) => {
  if (Number.isNaN(value)) return { status: "Loading…", color: "#9ca3af" };

  if (title === "Air Quality") {
    if (value <= 40) return { status: "Bad", color: "#e47a7c" };
    if (value <= 60) return { status: "Normal", color: "#ff9800" };
    return { status: "Good", color: "#4caf50" };
  }

  if (title === "Temperature") {
    if (value <= 22) return { status: "Good", color: "#4caf50" };
    if (value <= 26) return { status: "Normal", color: "#ff9800" };
    return { status: "Bad", color: "#e47a7c" };
  }

  if (title === "Humidity") {
    if (value <= 40) return { status: "Bad", color: "#e47a7c" }; // too dry
    if (value <= 60) return { status: "Good", color: "#4caf50" }; // ideal
    return { status: "Normal", color: "#ff9800" }; // too humid
  }

  return { status: "Unknown", color: "gray" };
};

const getIcon = (title) => {
  const iconSize = "w-8 h-8";
  if (title === "Air Quality") return <Wind className={iconSize} color="#97a7ff" />;
  if (title === "Temperature") return <ThermometerSun className={iconSize} color="#cc8965" />;
  if (title === "Humidity") return <Droplets className={iconSize} color="#3b75ea" />;
  return null;
};

const MetricCard = ({ title, value, unit }) => {
  const numericValue = parseFloat(value);
  const hasValue = !Number.isNaN(numericValue);
  const { status, color } = getStatusAndColor(title, numericValue);

  let percentage = 0;
  if (hasValue) {
    const max = title === "Temperature" ? 40 : 100;
    percentage = Math.max(0, Math.min(100, (numericValue / max) * 100));
  }

  const radius = 40;
  const circumference = Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 w-full h-full border border-gray-300 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-gray-900">{title}</div>
        {getIcon(title)}
      </div>

      {/* Gauge — grows with the card */}
      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <div className="relative w-full max-w-[270px]">
          <svg viewBox="0 0 100 56" className="w-full h-auto">
            <path
              d="M10,50 A40,40 0 0,1 90,50"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M10,50 A40,40 0 0,1 90,50"
              fill="none"
              stroke={color}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.5s ease" }}
            />
          </svg>

          {/* Value inside the arc */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
            <div className="flex items-baseline gap-1" style={{ color }}>
              <span className="text-4xl xl:text-5xl font-bold tabular-nums leading-none">
                {hasValue ? numericValue.toFixed(1) : "--"}
              </span>
              <span className="text-lg xl:text-xl font-semibold text-gray-500">{unit}</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mt-4">
          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color }}></span>
          <span className="text-lg font-medium text-gray-700">{status}</span>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
