import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Users } from "lucide-react";

const OCCUPANCY_HISTORY_API_URL = "https://api.powerworkplace.com/api:P-MhDvE_/last24HourZoneOccupancyPercentages";

// Function to format hour to display format (8am, 9am, 12pm, etc.)
const formatHourToDisplay = (hour) => {
  if (hour === 0) return "12am";
  if (hour < 12) return `${hour}am`;
  if (hour === 12) return "12pm";
  return `${hour - 12}pm`;
};

// Transform API data to chart-ready format
const transformToOccupancyLoad = (apiData) => {
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
    return [];
  }

  // Transform the data to the format expected by the chart
  return apiData.map(item => ({
    time: formatHourToDisplay(item.hour),
    load: item.occupancy || 0
  }));
};

const OccupancyLoadChart = () => {
  const [occupancyLoadData, setOccupancyLoadData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch occupancy history data from API
  const fetchOccupancyHistoryData = async () => {
    try {
      setLoading(true);
      const response = await fetch(OCCUPANCY_HISTORY_API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const transformedData = transformToOccupancyLoad(data);
      
      setOccupancyLoadData(transformedData);
      setError(null);
    } catch (error) {
      console.error("Error fetching occupancy history data:", error);
      setError("Failed to load occupancy history data");
      // Keep existing data if fetch fails, don't override with dummy data
      setOccupancyLoadData(prev => prev);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccupancyHistoryData(); // initial fetch
    const interval = setInterval(fetchOccupancyHistoryData, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  // Get current (last) bar value with non-zero data
  const getCurrentOccupancy = () => {
    if (occupancyLoadData.length === 0) return 0;
    // Find the last non-zero value or return the actual last value
    for (let i = occupancyLoadData.length - 1; i >= 0; i--) {
      if (occupancyLoadData[i].load > 0) {
        return occupancyLoadData[i].load;
      }
    }
    return occupancyLoadData[occupancyLoadData.length - 1].load;
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow w-full border border-gray-300">
        <div className="flex justify-center items-center h-48">
          <div className="text-gray-500">Loading occupancy history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow w-full border border-gray-300">
      {/* Title and Top Info */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center space-x-1">
            <Users size={20} className="text-gray-700" />
            <h2 className="text-lg font-semibold">Occupancy Load</h2>
          </div>
          {/* Current Occupancy Display */}
          <p className="pl-7 font-semibold text-gray-800">
            {getCurrentOccupancy()} people
          </p>
        </div>
        <p className="text-sm text-right text-gray-600">
          Max Load: <span className="font-medium">50</span> <br />
          Status: <span className="text-green-600 font-medium">Live</span> <br />
          
          {error && (
            <>
              <br />
              <span className="text-red-500 text-xs">{error}</span>
            </>
          )}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={occupancyLoadData}
          barCategoryGap="15%"
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            domain={[0, 'dataMax + 10']} 
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip />
          <Bar
            dataKey="load"
            fill="rgba(239, 209, 236, 0.8)"      // New fill color
            stroke="#ba9eb7"                     // New stroke color
            strokeWidth={1.5}
            radius={[0, 0, 0, 0]}
            barSize={32}
            name="Occupancy"
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-end mt-2 text-xs text-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(239, 209, 236, 0.8)' }}></div>
          <span>Occupancy</span>
        </div>
      </div>
    </div>
  );
};

export default OccupancyLoadChart;