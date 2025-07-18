import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { zoneOccupancy } from "../data/occupancyData";
import { UsersIcon } from "lucide-react";


// Zone color mapping
const zoneColors = {
  "Zone A": "#e9d5ff", // light purple-pink
  "Zone B": "#fdba74", // orange
  "Zone C": "#93c5fd", // blue
};

const OccupancyChart = () => {
  const data = [...zoneOccupancy]; // Keep original order, no sorting

  return (
    <div className="bg-white p-4 rounded-lg shadow w-full border border-gray-300">
      {/* Title */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-1">
                  <UsersIcon size={14} className="text-gray-700" />
                  <h2 className="text-sm font-semibold">Occupancy</h2>
            </div>
         <p className="text-xs text-right text-gray-600">
          Max Load: <span className="font-medium">50</span> <br />
          Status: <span className="text-green-600 font-medium">Low</span>
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="90%" height={180}>
        <BarChart data={data} layout="vertical" barCategoryGap={20}>
          <CartesianGrid horizontal={false} stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="zone" tick={{ fontSize: 12 }} width={70} />
          <Tooltip />
          <Bar
            dataKey="value"
            radius={[0, 0, 0, 0]}
            barSize={20}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={zoneColors[entry.zone]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-around mt-3 text-xs text-gray-600">
        {Object.entries(zoneColors).map(([zone, color]) => (
          <div key={zone} className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
            <span>{zone}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OccupancyChart;
