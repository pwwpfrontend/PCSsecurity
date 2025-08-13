import React, { useEffect, useState } from "react";
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
import { Users } from "lucide-react";

// Updated Zone color mapping
const zoneColors = {
  "Zone A": "#bd8fa2",  
  "Zone B": "#a493c4",  
  "Zone C": "#4354b3",  
};

const OCCUPANCY_API_URL = "https://njs-01.optimuslab.space/pcs/optimus/occupancy_live";

const OccupancyChart = () => {
  const [zoneOccupancy, setZoneOccupancy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch occupancy data from API
  const fetchOccupancyData = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      
      const response = await fetch(OCCUPANCY_API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      // Filter only Zone A, B, C (exclude Office) and transform data
      const transformedData = data
        .filter(item => item.area.startsWith('Zone'))
        .map(item => ({
          zone: item.area,
          value: parseInt(item.occupancyCount) || 0
        }));

      setZoneOccupancy(transformedData);
      setError(null);
    } catch (error) {
      console.error("Error fetching occupancy data:", error);
      setError("Failed to load occupancy data");
      
      // Only set fallback data if this is the initial load and we have no data
      if (isInitialLoad && zoneOccupancy.length === 0) {
        setZoneOccupancy([
          { zone: "Zone A", value: 0 },
          { zone: "Zone B", value: 0 },
          { zone: "Zone C", value: 0 },
        ]);
      }
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchOccupancyData(true); // initial fetch with loading state
    const interval = setInterval(() => fetchOccupancyData(false), 30000); // silent updates every 30s
    return () => clearInterval(interval);
  }, []);

  const data = [...zoneOccupancy]; // Keep original order, no sorting

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow w-full border border-gray-300">
        <div className="flex justify-center items-center h-48">
          <div className="text-gray-500">Loading occupancy data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow w-full border border-gray-300">
      {/* Title */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-1">
          <Users size={20} className="text-gray-700" />
          <h2 className="text-lg font-semibold">Occupancy</h2>
        </div>
        <p className="text-sm text-right text-gray-600">
          Max Load: <span className="font-medium">50</span> <br />
          Status: <span className="text-green-600 font-medium">Live</span>
          {error && (
            <>
              <br />
              <span className="text-red-500 text-xs">{error}</span>
            </>
          )}
        </p>
      </div>
      <ResponsiveContainer width="90%" height={180}>
        <BarChart data={data} layout="vertical" barCategoryGap={20}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="zone"
            tick={{ fontSize: 12 }}
            width={70}
            interval={0}
          />
          <Tooltip />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={26}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={zoneColors[entry.zone]}
                stroke={zoneColors[entry.zone]} // Match stroke with fill
                strokeWidth={1.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex justify-end mt-2 text-xs text-gray-700">
        <div className="flex items-center space-x-4">
          {Object.entries(zoneColors).map(([zone, color]) => (
            <div key={zone} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              ></div>
              <span>{zone}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OccupancyChart;