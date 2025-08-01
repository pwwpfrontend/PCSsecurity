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

const OCCUPANCY_HISTORY_API_URL = "https://njs-01.optimuslab.space/webhook/pcs/occupancy_history";

// Function to get UTC hour directly (no conversion needed)
const getUTCHour = (utcTimestamp) => {
  const date = new Date(utcTimestamp);
  return date.getUTCHours();
};

// Function to check if timestamp is from current day in UTC
const isCurrentDayUTC = (utcTimestamp) => {
  const date = new Date(utcTimestamp);
  const today = new Date();
  
  return date.getUTCDate() === today.getUTCDate() &&
         date.getUTCMonth() === today.getUTCMonth() &&
         date.getUTCFullYear() === today.getUTCFullYear();
};

// Function to check if timestamp ends with 00:00 (minutes and seconds) in UTC
const endsWithZeroMinutesSeconds = (utcTimestamp) => {
  const date = new Date(utcTimestamp);
  return date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0;
};

// Function to format UTC hour to HKT display format (8am, 9am, 12pm, etc.)
const formatUTCHourToHKT = (utcHour) => {
  // Convert UTC hour to HKT hour (UTC + 8)
  const hktHour = (utcHour + 8) % 24;
  
  if (hktHour === 0) return "12am";
  if (hktHour < 12) return `${hktHour}am`;
  if (hktHour === 12) return "12pm";
  return `${hktHour - 12}pm`;
};

// Transform API data to chart-ready format
const transformToOccupancyLoad = (apiData) => {
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
    return [];
  }

  // Flatten the nested array structure
  const flatData = apiData.flat();

  // Filter only Zone A, B, C (exclude Office), current day, and timestamps ending with 00:00
  const filteredData = flatData.filter(item => 
    item.area && 
    item.area.startsWith('Zone') && 
    item.timestamp &&
    isCurrentDayUTC(item.timestamp) &&
    endsWithZeroMinutesSeconds(item.timestamp)
  );

  // Group by UTC hour and sum occupancyCount
  const hourlyData = {};
  
  filteredData.forEach(item => {
    const utcHour = getUTCHour(item.timestamp);
    const occupancyCount = parseInt(item.occupancyCount) || 0;
    
    if (!hourlyData[utcHour]) {
      hourlyData[utcHour] = 0;
    }
    hourlyData[utcHour] += occupancyCount;
  });

  // Create array with all 24 UTC hours, filling missing hours with 0
  const result = [];
  for (let utcHour = 0; utcHour < 24; utcHour++) {
    result.push({
      time: formatUTCHourToHKT(utcHour),
      load: hourlyData[utcHour] || 0
    });
  }

  // Filter to show only UTC hours 0-12 (which correspond to 8am-8pm HKT)
  return result.filter((item, index) => {
    const utcHour = index;
    return utcHour >= 0 && utcHour <= 12; // UTC 0-12 = HKT 8am-8pm
  });
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
      // Fallback to dummy data in case of error
      setOccupancyLoadData([
        { time: "8am", load: 0 },
        { time: "9am", load: 0 },
        { time: "10am", load: 0 },
        { time: "11am", load: 0 },
        { time: "12pm", load: 0 },
        { time: "1pm", load: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccupancyHistoryData(); // initial fetch
    const interval = setInterval(fetchOccupancyHistoryData, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

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
        <div className="flex items-center space-x-1">
          <Users size={20} className="text-gray-700" />
          <h2 className="text-lg font-semibold">Occupancy Load</h2>
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