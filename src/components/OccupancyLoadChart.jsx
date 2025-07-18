import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import occupancyLoadData from "../data/occupancyLoadData";
import { UsersIcon } from "lucide-react";

const OccupancyLoadChart = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow w-full border border-gray-300">
      {/* Title and Top Info */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-1">
          <UsersIcon size={14} className="text-gray-700" />
          <h2 className="text-sm font-semibold">Occupancy Load</h2>
        </div>
        <p className="text-xs text-right text-gray-600">
          Max Load: <span className="font-medium">50</span> <br />
          Status: <span className="text-green-600 font-medium">Low</span>
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={occupancyLoadData} barCategoryGap={20}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 50]}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip />
          <Bar
            dataKey="load"
            fill="#e9d5ff"
            radius={[4, 4, 0, 0]}
            name="Occupancy"
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-end mt-2 text-xs text-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-purple-200"></div>
          <span>Occupancy</span>
        </div>
      </div>
    </div>
  );
};

export default OccupancyLoadChart;
