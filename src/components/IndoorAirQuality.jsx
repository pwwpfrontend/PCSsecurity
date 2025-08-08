import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { ThermometerSun, Droplets, Wind, Info, Calendar } from "lucide-react";


const getTVOCLevel = (tvocValue) => {
  if (tvocValue === 0) return 1;
  if (tvocValue < 100) return 1;
  return Math.floor(tvocValue / 100);
};

const REFRESH_INTERVAL = 30000;

// CO2 threshold levels for color coding
const CO2_LEVELS = {
  GOOD: 700,
  MODERATE: 1000,
  HIGH: 1500,
};

// Temperature threshold levels for color coding
const TEMP_LEVELS = {
  LOW: 20,
  NORMAL: 31,
};

// Humidity threshold levels for color coding
const HUMIDITY_LEVELS = {
  LOW: 40,
  NORMAL: 70,
};

// Color for CO2 value
const getCO2Color = (value) => {
  if (value < CO2_LEVELS.GOOD) return "#4CAF50"; // Good - Green
  if (value < CO2_LEVELS.MODERATE) return "#FF9800"; // Moderate - Yellow
  if (value < CO2_LEVELS.HIGH) return "#F44336"; // Orangish-red
  return "#F44336"; // Bad - Orangish-red
};

// Color for temperature value
const getTempColor = (value) => {
  if (value < TEMP_LEVELS.LOW) return "#4CAF50"; // Good - Green
  if (value <= TEMP_LEVELS.NORMAL) return "#FF9800"; // Normal - Yellow
  return "#F44336"; // Warm - Orangish-red
};

// Color for humidity value
const getHumidityColor = (value) => {
  if (value < HUMIDITY_LEVELS.LOW) return "#4CAF50"; // Dry - Green
  if (value <= HUMIDITY_LEVELS.NORMAL) return "#FF9800"; // Normal - Yellow
  return "#F44336"; // Humid - Orangish-red
};

// Get status label for CO2 value
const getCO2Status = (value) => {
  if (value < CO2_LEVELS.GOOD) return "Good";
  if (value < CO2_LEVELS.MODERATE) return "Moderate";
  if (value < CO2_LEVELS.HIGH) return "Poor";
  return "Bad";
};

// Get status label for temperature value
const getTempStatus = (value) => {
  if (value < TEMP_LEVELS.LOW) return "Cold";
  if (value <= TEMP_LEVELS.NORMAL) return "Normal";
  return "Warm";
};

// Get status label for humidity value
const getHumidityStatus = (value) => {
  if (value < HUMIDITY_LEVELS.LOW) return "Dry";
  if (value <= HUMIDITY_LEVELS.NORMAL) return "Normal";
  return "Humid";
};


// Format date for display (DD-MM)
const formatDateDisplay = (date) => {
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
};



// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium text-gray-800">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value.toFixed(2)}
            {entry.name === "Temperature"
              ? "°C"
              : entry.name === "Humidity"
              ? "%"
              : entry.name === "CO2"
              ? " ppm"
              : entry.name === "PM2.5" || entry.name === "pm2_5"
              ? " µg/m³"
              : entry.name === "PM10" || entry.name === "pm10"
              ? " µg/m³"
              : entry.name === "TVOC" || entry.name === "tvoc"
              ? ""
              : entry.name === "Pressure" || entry.name === "pressure"
              ? " hPa"
              : entry.name === "HCHO" || entry.name === "hcho"
              ? " mg/m³"
              : entry.name === "Score" || entry.name === "score"
              ? ""
              : ""}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Sensor metric card component with pie chart
const SensorMetricCard = ({ title, value, unit, type, icon, color }) => {
  // Calculate percentage for the pie chart based on ranges
  let percentage = 0;
  let statusLabel = "";

  if (type === "co2") {
    percentage = Math.min(100, (value / 2000) * 100);
    statusLabel = getCO2Status(value);
  } else if (type === "temp") {
    percentage = Math.min(100, Math.max(0, ((value - 15) / 25) * 100));
    statusLabel = getTempStatus(value);
  } else if (type === "humidity") {
    percentage = Math.min(100, Math.max(0, value));
    statusLabel = getHumidityStatus(value);
  }

  const pieData = [
    { name: title, value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {icon}
      </div>
      <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              startAngle={180}
              endAngle={0}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell key="cell-0" fill={color} />
              <Cell key="cell-1" fill="#f3f4f6" />
            </Pie>
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
              <tspan
                x="50%"
                dy="-5"
                className="text-2xl font-bold"
                fill={color}
              >
                {typeof value === "number" ? value.toFixed(1) : "N/A"}
              </tspan>
              <tspan x="50%" dy="25" className="text-sm" fill="#6b7280">
                {unit}
              </tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-2 flex items-center justify-center">
          <div
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: color }}
          ></div>
          <span className="text-sm">{statusLabel}</span>
        </div>
      </div>
    </div>
  );
};

// Reusable ChartHeader component
const ChartHeader = ({ title, average, unit }) => {
  const formatAverage = (value) => {
    if (typeof value !== 'number') return 'N/A';
    return value.toFixed(1);
  };

  return (
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-base font-medium">{title}</h3>
      <span className="text-sm text-gray-600 font-medium">
        Avg: {formatAverage(average)}{unit}
      </span>
    </div>
  );
};

const IndoorAirQuality = () => {

  // Report type and date selection
  const [reportType, setReportType] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [customEndDate, setCustomEndDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(
    format(new Date(), "yyyy-MM")
  );

  // Data states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hourlyDataPoints, setHourlyDataPoints] = useState([]);
  const [dailyDataPoints, setDailyDataPoints] = useState([]);
  const [averageMetrics, setAverageMetrics] = useState({
    co2: 0,
    temp: 0,
    humidity: 0,
    pm2_5: 0,
    pm10: 0,
    tvoc: 0,
    pressure: 0,
    hcho: 0,
    score: 0,
  });

  // Format dates for API call - convert to timestamp
  const formatDateForAPI = (date) => {
    return date.getTime();
  };

  // Get date range based on report type
  const getDateRange = useCallback(() => {
    if (reportType === "daily") {
      // For daily reports, use full 24 hours from start to end of selected date
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      return {
        fromDate: formatDateForAPI(startOfDay),
        toDate: formatDateForAPI(endOfDay),
      };
    } else if (reportType === "weekly") {
      const weekStart = startOfWeek(selectedDate);
      const weekEnd = endOfWeek(selectedDate);
      return {
        fromDate: formatDateForAPI(weekStart),
        toDate: formatDateForAPI(weekEnd),
      };
    } else if (reportType === "monthly") {
      const [year, month] = currentMonth.split("-");
      const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      return {
        fromDate: formatDateForAPI(monthStart),
        toDate: formatDateForAPI(monthEnd),
        month: currentMonth,
      };
    } else {
      // Custom date range
      return {
        fromDate: formatDateForAPI(customStartDate),
        toDate: formatDateForAPI(customEndDate),
      };
    }
  }, [reportType, selectedDate, currentMonth, customStartDate, customEndDate]);

  // Apply the selected date range
  const applyDateRange = useCallback(() => {
    if (reportType === "custom") {
      setStartDate(customStartDate);
      setEndDate(customEndDate);
    }
    // Data will be fetched automatically via useEffect when state changes
  }, [reportType, customStartDate, customEndDate]);

  // Export CSV function
// Export CSV function
const exportToCSV = () => {
  try {
    let csvData = [];
    
    if (reportType === "daily") {
      csvData = hourlyDataPoints.map(hour => ({
        'Area': 'Office',
        'Time': hour.displayTime,
        'CO2 (ppm)': hour.co2.toFixed(2),
        'Temperature (°C)': hour.temp.toFixed(2),
        'Humidity (%)': hour.humidity.toFixed(2),
        'PM2.5 (µg/m³)': hour.pm2_5.toFixed(2),
        'PM10 (µg/m³)': hour.pm10.toFixed(2),
        'TVOC': hour.tvoc,
        'Pressure (hPa)': hour.pressure ? hour.pressure.toFixed(1) : 'N/A',
        'HCHO (mg/m³)': hour.hcho ? hour.hcho.toFixed(2) : 'N/A',
        'Score': hour.score ? hour.score.toFixed(1) : 'N/A'
      }));
    } else {
      csvData = dailyDataPoints.map(day => ({
        'Area': 'Office',
        'Date': day.date,
        'CO2 (ppm)': day.co2.toFixed(2),
        'Temperature (°C)': day.temp.toFixed(2),
        'Humidity (%)': day.humidity.toFixed(2),
        'PM2.5 (µg/m³)': day.pm2_5.toFixed(2),
        'PM10 (µg/m³)': day.pm10.toFixed(2),
        'TVOC': day.tvoc,
        'Pressure (hPa)': day.pressure ? day.pressure.toFixed(1) : 'N/A',
        'HCHO (mg/m³)': day.hcho ? day.hcho.toFixed(2) : 'N/A',
        'Score': day.score ? day.score.toFixed(1) : 'N/A'
      }));
    }
    
    if (csvData.length === 0) {
      alert('No data available for export');
      return;
    }
    
    const headers = Object.keys(csvData[0]);
    const tvocNote = [
      '# TVOC Level Information:',
      '# Displayed Number = TVOC Level',
      '# Range, 1: 100-199, 2: 200-299, 3: 300-399, 4: 400-499, 5: 500-599',
      '# Air Quality, 0-1: Very Good, 2: Good, 3: Medium, 4: Poor, 5-6: Bad',
      ''
    ].join('\n');

    const csvContent = [
      tvocNote,
      headers.join(','),
      ...csvData.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url_obj = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url_obj;
    
    const dateRange_obj = getDateRange();
    const fromDate = new Date(dateRange_obj.fromDate).toISOString().split('T')[0];
    const toDate = new Date(dateRange_obj.toDate).toISOString().split('T')[0];
    const filename = `Office_IAQ_${fromDate}_to_${toDate}.csv`;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url_obj);
    
  } catch (error) {
    console.error('Error exporting CSV:', error);
    alert('Error exporting data. Please try again.');
  }
};


  // Initialize date ranges based on report type changes
  useEffect(() => {
    if (reportType === "daily") {
      setStartDate(selectedDate);
      setEndDate(selectedDate);
    } else if (reportType === "weekly") {
      const week_start = startOfWeek(selectedDate);
      const week_end = endOfWeek(selectedDate);
      setStartDate(week_start);
      setEndDate(week_end);
    } else if (reportType === "monthly") {
      const [year, month] = currentMonth.split("-");
      const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const month_start = startOfMonth(monthDate);
      const month_end = endOfMonth(monthDate);
      setStartDate(month_start);
      setEndDate(month_end);
    }
    // Remove the custom date range setting from here to avoid circular updates
  }, [reportType, selectedDate, currentMonth]);

  // Process the IAQ data and calculate averages
  const processIAQData = useCallback((data) => {
    console.log('Processing IAQ Data:', data);
    
    if (!data || data.length === 0) {
      setAverageMetrics({
        co2: 0,
        temp: 0,
        humidity: 0,
        pm2_5: 0,
        pm10: 0,
        tvoc: 0,
        pressure: 0,
        hcho: 0,
        score: 0,
      });
      setHourlyDataPoints([]);
      setDailyDataPoints([]);
      return;
    }

    // Calculate average metrics
    let totalCO2 = 0;
    let totalTemp = 0;
    let totalHumidity = 0;
    let totalPM25 = 0;
    let totalPM10 = 0;
    let totalTVOC = 0;
    let totalPressure = 0;
    let totalHCHO = 0;
    let totalScore = 0;
    let count = data.length;

    // Process data for charts
    let processedData = [];

    data.forEach((item) => {
      totalCO2 += item.co2 || 0;
      totalTemp += item.temperature || 0;
      totalHumidity += item.humidity || 0;
      totalPM25 += item.pm2_5 || 0;
      totalPM10 += item.pm10 || 0;
      totalTVOC += item.tvoc || 0;
      totalPressure += item.pressure || 0;
      totalHCHO += item.hcho || 0;
      totalScore += item.score || 0;

      if (reportType === "daily") {
        // For daily reports, process hourly data
        const timestamp = new Date(item.timestamp);
        const actualHour = timestamp.getHours();
        // Map hours 5-14 to 8-17
        const mappedHour = actualHour + 3;
        const displayTime = `${String(mappedHour).padStart(2, "0")}:00`;
        
        processedData.push({
          hour: item.timestamp,
          displayTime: displayTime,
          co2: item.co2 || 0,
          temp: item.temperature || 0,
          humidity: item.humidity || 0,
          pm2_5: item.pm2_5 || 0,
          pm10: item.pm10 || 0,
          tvoc: getTVOCLevel(item.tvoc || 0),
          pressure: item.pressure || 0,
          hcho: item.hcho || 0,
          score: item.score || 0,
          rawTimestamp: timestamp,
        });
      } else {
        // For other reports, process non-hourly data
        const timestamp = new Date(item.timestamp);
        const displayDate = formatDateDisplay(timestamp);
        
        processedData.push({
          date: displayDate,
          day: timestamp.toISOString().split("T")[0],
          co2: item.co2 || 0,
          temp: item.temperature || 0,
          humidity: item.humidity || 0,
          pm2_5: item.pm2_5 || 0,
          pm10: item.pm10 || 0,
          tvoc: getTVOCLevel(item.tvoc || 0),
          pressure: item.pressure || 0,
          hcho: item.hcho || 0,
          score: item.score || 0,
          rawTimestamp: timestamp,
        });
      }
    });

    // Sort data by timestamp
    processedData.sort((a, b) => a.rawTimestamp - b.rawTimestamp);
    
    if (reportType === "daily") {
      setHourlyDataPoints(processedData);
      setDailyDataPoints([]);
    } else {
      setDailyDataPoints(processedData);
      setHourlyDataPoints([]);
    }

    // Set average metrics
    setAverageMetrics({
      co2: count > 0 ? totalCO2 / count : 0,
      temp: count > 0 ? totalTemp / count : 0,
      humidity: count > 0 ? totalHumidity / count : 0,
      pm2_5: count > 0 ? totalPM25 / count : 0,
      pm10: count > 0 ? totalPM10 / count : 0,
      tvoc: count > 0 ? getTVOCLevel(totalTVOC / count) : 0,
      pressure: count > 0 ? totalPressure / count : 0,
      hcho: count > 0 ? totalHCHO / count : 0,
      score: count > 0 ? totalScore / count : 0,
    });
  }, [reportType]);

  // Fetch IAQ data based on report type
  const fetchIAQData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dateRange = getDateRange();
      let url;
      
      if (reportType === "daily") {
        // Use hourly endpoint for daily reports
        url = `https://api.powerworkplace.com/api:P-MhDvE_/9_in_1_based_on_hour?from=${dateRange.fromDate}&to=${dateRange.toDate}&areaId=office`;
      } else {
        // Use non-hourly endpoint for other reports
        url = `https://api.powerworkplace.com/api:P-MhDvE_/9_in_1?from=${dateRange.fromDate}&to=${dateRange.toDate}&areaId=office`;
      }

      console.log('Fetching from URL:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);

      if (Array.isArray(data)) {
        processIAQData(data);
      } else {
        console.warn('API response is not an array:', data);
        processIAQData([]);
      }
    } catch (err) {
      console.error("Error fetching IAQ data:", err);
      setError(`Failed to fetch IAQ data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [getDateRange, processIAQData, reportType]);


  // Auto-refresh functionality
  const refreshIAQDataSilently = useCallback(async () => {
    try {
      const dateRange = getDateRange();
      let url;
      
      if (reportType === "daily") {
        url = `https://api.powerworkplace.com/api:P-MhDvE_/9_in_1_based_on_hour?from=${dateRange.fromDate}&to=${dateRange.toDate}&areaId=office`;
      } else {
        url = `https://api.powerworkplace.com/api:P-MhDvE_/9_in_1?from=${dateRange.fromDate}&to=${dateRange.toDate}&areaId=office`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          processIAQData(data);
        }
      }
    } catch (err) {
      console.error("Error refreshing IAQ data:", err);
    }
  }, [getDateRange, processIAQData, reportType]);

  // Initial data fetch when component mounts and when dates change
  useEffect(() => {
    fetchIAQData();
  }, [reportType, selectedDate, currentMonth, customStartDate, customEndDate]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing data...");
      refreshIAQDataSilently();
    }, REFRESH_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [refreshIAQDataSilently]);

  // Get date display string based on report type
const getDateDisplayString = () => {
  const dateRange = getDateRange();
  let dateString = "";

  if (reportType === "daily") {
    const date = new Date(dateRange.fromDate);
    dateString = `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  } else if (reportType === "weekly") {
    const fromDate = new Date(dateRange.fromDate);
    const toDate = new Date(dateRange.toDate);
    dateString = `${formatDateDisplay(fromDate)} to ${formatDateDisplay(
      toDate
    )} (Weekly)`;
  } else if (reportType === "monthly") {
    const [year, month] = dateRange.month.split("-");
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    dateString = `${monthNames[parseInt(month) - 1]} ${year} (Monthly)`;
  } else {
    const fromDate = new Date(dateRange.fromDate);
    const toDate = new Date(dateRange.toDate);
    dateString = `${formatDateDisplay(fromDate)} to ${formatDateDisplay(
      toDate
    )} (Custom)`;
  }

  return `${dateString} - Office Area`;
};


  // Get chart data based on report type
  const chartData = reportType === "daily" ? hourlyDataPoints : dailyDataPoints;
  const xAxisKey = reportType === "daily" ? "displayTime" : "date";

  return (
    <div className="space-y-6">
      {/* Controls Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Report Type */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Report Type
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-2 rounded-md text-sm ${
                    reportType === "daily"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                  onClick={() => setReportType("daily")}
                >
                  Daily
                </button>
                <button
                  className={`px-3 py-2 rounded-md text-sm ${
                    reportType === "weekly"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                  onClick={() => setReportType("weekly")}
                >
                  Weekly
                </button>
                <button
                  className={`px-3 py-2 rounded-md text-sm ${
                    reportType === "monthly"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                  onClick={() => setReportType("monthly")}
                >
                  Monthly
                </button>
                <button
                  className={`px-3 py-2 rounded-md text-sm ${
                    reportType === "custom"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                  onClick={() => setReportType("custom")}
                >
                  Custom
                </button>
              </div>
            </div>

          {/* Date Selection */}
          <div>
            {(reportType === "daily" || reportType === "weekly") && (
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  {reportType === "daily" ? "Select Date" : "Select Week"}
                </label>
                <div className="flex items-center relative">
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-auto pr-10"
                  />
                  <Calendar className="h-4 w-4 text-gray-500 absolute right-3" />
                </div>
              </div>
            )}

            {reportType === "monthly" && (
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Select Month
                </label>
                <div className="flex items-center relative">
                  <input
                    type="month"
                    value={currentMonth}
                    onChange={(e) => setCurrentMonth(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-auto"
                  />
                  
                </div>
              </div>
            )}


            {reportType === "custom" && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <label className="text-sm text-gray-600 mb-1 block">
                    Start Date
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={customStartDate}
                      onChange={(date) => setCustomStartDate(date)}
                      selectsStart
                      startDate={customStartDate}
                      endDate={customEndDate}
                      dateFormat="yyyy-MM-dd"
                      className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-auto pr-10"
                    />
                    <Calendar className="h-4 w-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>
                <div className="relative">
                  <label className="text-sm text-gray-600 mb-1 block">
                    End Date
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={customEndDate}
                      onChange={(date) => setCustomEndDate(date)}
                      selectsEnd
                      startDate={customStartDate}
                      endDate={customEndDate}
                      minDate={customStartDate}
                      dateFormat="yyyy-MM-dd"
                      className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-auto pr-10"
                    />
                    <Calendar className="h-4 w-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              onClick={applyDateRange}
            >
              Apply
            </button>
            <button
              className="px-4 py-2 rounded-md bg-transparent border-[2px] border-blue-500 text-blue-600 font-medium hover:bg-blue-600 hover:text-white text-sm"
              onClick={exportToCSV}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Banner */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
        <p className="text-blue-800 flex items-center">
          <Wind className="h-5 w-5 mr-2" />
          Showing IAQ data for: {getDateDisplayString()}
        </p>
      </div>

      {/* IAQ Dashboard Content */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-8 flex justify-center">
          <p className="text-lg">Loading IAQ data...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <>
              {/* Metrics Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <SensorMetricCard
                  title="CO2 Level"
                  value={averageMetrics.co2}
                  unit="ppm"
                  type="co2"
                  color={getCO2Color(averageMetrics.co2)}
                  icon={<Wind className="h-6 w-6 text-gray-500" />}
                />
                <SensorMetricCard
                  title="Temperature"
                  value={averageMetrics.temp}
                  unit="°C"
                  type="temp"
                  color={getTempColor(averageMetrics.temp)}
                  icon={<ThermometerSun className="h-6 w-6 text-gray-500" />}
                />
                <SensorMetricCard
                  title="Humidity"
                  value={averageMetrics.humidity}
                  unit="%"
                  type="humidity"
                  color={getHumidityColor(averageMetrics.humidity)}
                  icon={<Droplets className="h-6 w-6 text-gray-500" />}
                />
              </div>

              {/* Main IAQ Charts */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  {reportType === "daily" ? "Hourly" : "Daily"} IAQ Trends
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* CO2 Chart */}
                  <div>
                    <ChartHeader 
                      title="CO2 Levels (ppm)" 
                      average={averageMetrics.co2} 
                      unit=" ppm" 
                    />
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey={xAxisKey}
                          interval={
                            reportType === "monthly"
                              ? 4
                              : reportType === "custom"
                              ? Math.floor(chartData.length / 10)
                              : 0
                          }
                          tick={{ fontSize: 13 }}
                          tickFormatter={(value) =>
                            reportType === "daily"
                              ? value.split(":")[0].replace(/^0+/, "")
                              : value
                          }
                        />
                        <YAxis domain={["auto", "auto"]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="co2"
                          name="CO2"
                          stroke="#654236"
                          strokeWidth={2}
                          dot={false}
                          activeDot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Temperature Chart */}
                  <div>
                    <ChartHeader 
                      title="Temperature (°C)" 
                      average={averageMetrics.temp} 
                      unit="°C" 
                    />
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey={xAxisKey}
                          interval={
                            reportType === "monthly"
                              ? 4
                              : reportType === "custom"
                              ? Math.floor(chartData.length / 10)
                              : 0
                          }
                          tick={{ fontSize: 13 }}
                          tickFormatter={(value) =>
                            reportType === "daily"
                              ? value.split(":")[0].replace(/^0+/, "")
                              : value
                          }
                        />
                        <YAxis domain={["auto", "auto"]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="temp"
                          name="Temperature"
                          stroke="#E25D31"
                          strokeWidth={2}
                          dot={false}
                          activeDot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Humidity Chart */}
                  <div>
                    <ChartHeader 
                      title="Humidity (%)" 
                      average={averageMetrics.humidity} 
                      unit="%" 
                    />
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey={xAxisKey}
                          interval={
                            reportType === "monthly"
                              ? 4
                              : reportType === "custom"
                              ? Math.floor(chartData.length / 10)
                              : 0
                          }
                          tick={{ fontSize: 13 }}
                          tickFormatter={(value) =>
                            reportType === "daily"
                              ? value.split(":")[0].replace(/^0+/, "")
                              : value
                          }
                        />
                        <YAxis domain={["auto", "auto"]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="humidity"
                          name="Humidity"
                          stroke="#197BBD"
                          strokeWidth={2}
                          dot={false}
                          activeDot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Additional Air Quality Metrics */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Additional Air Quality Metrics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* PM2.5 Chart */}
                  <div>
                    <ChartHeader 
                      title="PM2.5 (µg/m³)" 
                      average={averageMetrics.pm2_5} 
                      unit=" µg/m³" 
                    />
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey={xAxisKey}
                          interval={
                            reportType === "monthly"
                              ? 4
                              : reportType === "custom"
                              ? Math.floor(chartData.length / 10)
                              : 0
                          }
                          tick={{ fontSize: 13 }}
                          tickFormatter={(value) =>
                            reportType === "daily"
                              ? value.split(":")[0].replace(/^0+/, "")
                              : value
                          }
                        />
                        <YAxis domain={["auto", "auto"]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="pm2_5"
                          name="PM2.5"
                          stroke="#8884d8"
                          strokeWidth={2}
                          dot={false}
                          activeDot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* PM10 Chart */}
                  <div>
                    <ChartHeader 
                      title="PM10 (µg/m³)" 
                      average={averageMetrics.pm10} 
                      unit=" µg/m³" 
                    />
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey={xAxisKey}
                          interval={
                            reportType === "monthly"
                              ? 4
                              : reportType === "custom"
                              ? Math.floor(chartData.length / 10)
                              : 0
                          }
                          tick={{ fontSize: 13 }}
                          tickFormatter={(value) =>
                            reportType === "daily"
                              ? value.split(":")[0].replace(/^0+/, "")
                              : value
                          }
                        />
                        <YAxis domain={["auto", "auto"]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="pm10"
                          name="PM10"
                          stroke="#FFBB28"
                          strokeWidth={2}
                          dot={false}
                          activeDot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                 
                  {/* TVOC Chart */}
<div>
  <div className="flex justify-between items-center mb-2">
    <h3 className="text-base font-medium flex items-center">
      TVOC
      <div className="relative group mr-1 ml-2">
        <Info className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-help" />
        <div className="absolute z-10 hidden text-left group-hover:block bg-white border border-gray-400 text-grey-700 leading-4 text-xs rounded-lg p-2 w-64 -bottom-48 left-1/2 transform -translate-x-40 mb-2">
          <div className="text-left flex">
            <div className="text-left space-y-1 mb-3">
              <div className="text-amber-700 font-medium">
                Displayed Number = TVOC Level
              </div>
              <div>1: 100-199 </div>
              <div>2: 200-299 </div>
              <div>3: 300-399 </div>
              <div>4: 400-499 </div>
              <div>5: 500-599 </div>
            </div>
            <div className="text-left space-y-1 rota border-l border-gray-300 pl-4">
              <div className="font-medium text-left text-blue-800">
                Air Quality:
              </div>
              <div>1: Very Good</div>
              <div>2: Good</div>
              <div>3: Medium</div>
              <div>4: Poor</div>
              <div>5-6: Bad</div>
            </div>
          </div>
          <div className="absolute w-2 h-2 block bg-white transform border-l border-t border-gray-400 rotate-45 -top-1 left-[64%] -translate-x-1/2"></div>
        </div>
      </div>
    </h3>
    <span className="text-sm text-gray-600 font-medium">
      Avg: {typeof averageMetrics.tvoc === 'number' ? averageMetrics.tvoc.toFixed(1) : 'N/A'}
    </span>
  </div>
  
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey={xAxisKey}
                          interval={
                            reportType === "monthly"
                              ? 4
                              : reportType === "custom"
                              ? Math.floor(chartData.length / 10)
                              : 0
                          }
                          tick={{ fontSize: 13 }}
                          tickFormatter={(value) =>
                            reportType === "daily"
                              ? value.split(":")[0].replace(/^0+/, "")
                              : value
                          }
                        />
                        <YAxis domain={["auto", "auto"]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="tvoc"
                          name="TVOC"
                          stroke="#DD7373"
                          strokeWidth={2}
                          dot={false}
                          activeDot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* New Additional Metrics - Pressure, HCHO, Score */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Extended Air Quality Metrics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Pressure Chart */}
                  <div>
                    <ChartHeader 
                      title="Pressure (hPa)" 
                      average={averageMetrics.pressure} 
                      unit=" hPa" 
                    />
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey={xAxisKey}
                          interval={
                            reportType === "monthly"
                              ? 4
                              : reportType === "custom"
                              ? Math.floor(chartData.length / 10)
                              : 0
                          }
                          tick={{ fontSize: 13 }}
                          tickFormatter={(value) =>
                            reportType === "daily"
                              ? value.split(":")[0].replace(/^0+/, "")
                              : value
                          }
                        />
                        <YAxis domain={["auto", "auto"]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="pressure"
                          name="Pressure"
                          stroke="#9333EA"
                          strokeWidth={2}
                          dot={false}
                          activeDot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* HCHO Chart */}
                  <div>
                    <ChartHeader 
                      title="HCHO (mg/m³)" 
                      average={averageMetrics.hcho} 
                      unit=" mg/m³" 
                    />
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey={xAxisKey}
                          interval={
                            reportType === "monthly"
                              ? 4
                              : reportType === "custom"
                              ? Math.floor(chartData.length / 10)
                              : 0
                          }
                          tick={{ fontSize: 13 }}
                          tickFormatter={(value) =>
                            reportType === "daily"
                              ? value.split(":")[0].replace(/^0+/, "")
                              : value
                          }
                        />
                        <YAxis domain={["auto", "auto"]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="hcho"
                          name="HCHO"
                          stroke="#F97316"
                          strokeWidth={2}
                          dot={false}
                          activeDot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Score Chart */}
                  <div>
                    <ChartHeader 
                      title="Air Quality Score" 
                      average={averageMetrics.score} 
                      unit="" 
                    />
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey={xAxisKey}
                          interval={
                            reportType === "monthly"
                              ? 4
                              : reportType === "custom"
                              ? Math.floor(chartData.length / 10)
                              : 0
                          }
                          tick={{ fontSize: 13 }}
                          tickFormatter={(value) =>
                            reportType === "daily"
                              ? value.split(":")[0].replace(/^0+/, "")
                              : value
                          }
                        />
                        <YAxis domain={["auto", "auto"]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="score"
                          name="Score"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={false}
                          activeDot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
    </div>
  );
};

export default IndoorAirQuality;