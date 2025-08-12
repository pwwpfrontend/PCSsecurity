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
  BarChart,
  Bar,
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
import { Calendar, CalendarX, Users, Clock } from "lucide-react";

const REFRESH_INTERVAL = 30000;

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium text-gray-800">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Format date for display (DD-MM)
const formatDateDisplay = (date) => {
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
};

const CancelledMeetings = () => {
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
  const [resourceType, setResourceType] = useState("all");

  // Applied filter states (only updated when Apply is clicked)
  const [appliedReportType, setAppliedReportType] = useState("daily");
  const [appliedSelectedDate, setAppliedSelectedDate] = useState(new Date());
  const [appliedCurrentMonth, setAppliedCurrentMonth] = useState(format(new Date(), "yyyy-MM"));
  const [appliedCustomStartDate, setAppliedCustomStartDate] = useState(new Date());
  const [appliedCustomEndDate, setAppliedCustomEndDate] = useState(new Date());
  const [appliedResourceType, setAppliedResourceType] = useState("all");

  // Data states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancelledMeetingsData, setCancelledMeetingsData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [summaryMetrics, setSummaryMetrics] = useState({
    totalCancelled: 0,
    averagePerDay: 0,
    mostCancelledTime: "N/A",
    cancellationRate: 0,
  });

  // Helper: convert number / numeric-string / ISO date-string to ms
  const parseToMs = (value) => {
    if (value === null || value === undefined) return undefined;
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const str = value.trim();
      // Check if it's a pure number string
      if (/^\d+$/.test(str)) {
        const n = Number(str);
        return Number.isFinite(n) ? n : undefined;
      }
      // Try to parse as ISO date string or any valid date format
      const parsed = Date.parse(str);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  };

  // Normalize API meeting item to expected shapes and numeric timestamps
  const normalizeMeeting = (item, idx) => {
    // Parse timestamp (now comes as ISO string from new API)
    const ts = parseToMs(item?.timestamp);
    const startTs = parseToMs(item?.start_timestamp ?? item?.startTime ?? item?.start);
    const endTs = parseToMs(item?.end_timestamp ?? item?.endTime ?? item?.end);
    const resourceType = (item?.resourceType ?? item?.resource_type ?? '').toString().toLowerCase();

    return {
      ...item,
      // Generate a unique ID if not present, using timestamp and index
      id: item?.id ?? `${ts || Date.now()}-${idx}`,
      resourceType: resourceType || 'unknown',
      timestamp: typeof ts === 'number' ? ts : Date.now(),
      start_timestamp: typeof startTs === 'number' ? startTs : (typeof ts === 'number' ? ts : Date.now()),
      end_timestamp: typeof endTs === 'number' ? endTs : (typeof startTs === 'number' ? startTs : (typeof ts === 'number' ? ts : Date.now())),
    };
  };

  // Format dates for API call - convert to timestamp
  const formatDateForAPI = (date) => {
    return date.getTime();
  };

  // Format timestamp to readable date
  const formatTimestampToDate = (timestamp) => {
    const ms = parseToMs(timestamp);
    if (ms === undefined) return '';
    const hktString = new Date(ms).toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' });
    const hktDate = new Date(hktString);
    const day = String(hktDate.getDate()).padStart(2, '0');
    const month = String(hktDate.getMonth() + 1).padStart(2, '0');
    const year = hktDate.getFullYear();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayShortName = dayNames[hktDate.getDay()];
    return `${day}/${month}/${year} ${dayShortName}`;
  };

  // Format timestamp to readable time
  const formatTimestampToTime = (timestamp) => {
    const ms = parseToMs(timestamp);
    if (ms === undefined) return '';
    return new Date(ms).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Hong_Kong'
    });
  };

  // Calculate duration in hours and minutes
  const calculateDuration = (startTimestamp, endTimestamp) => {
    const durationMs = endTimestamp - startTimestamp;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Fetch cancelled meetings data from API
  const fetchCancelledMeetings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('http://optimus-india-njs-01.netbird.cloud:3005/pcs/optimus/canceled_meetings');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const arr = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
      const normalized = arr.map((item, idx) => normalizeMeeting(item, idx));
      setCancelledMeetingsData(normalized);
      
    } catch (err) {
      console.error('Error fetching cancelled meetings:', err);
      setError('Failed to fetch cancelled meetings data. Please try again.');
      // Fallback to mock data for demonstration using the new API response format
      const mockData = [
        {
          resource_name: "Einstein",
          customerId: "pcs",
          resourceType: "room",
          subject: "Booked",
          start_timestamp: 1754956800000,
          end_timestamp: 1754989200000,
          organizer_name: "Alayne Pang",
          organizer_email: "alayne_pang@pcs-security.com",
          timestamp: "2025-08-12T00:00:00.000000Z"
        },
        {
          resource_name: "Nobel",
          customerId: "pcs",
          resourceType: "room",
          subject: "Booked",
          start_timestamp: 1754956800000,
          end_timestamp: 1754989200000,
          organizer_name: "Alayne Pang",
          organizer_email: "alayne_pang@pcs-security.com",
          timestamp: "2025-08-12T00:00:00.000000Z"
        },
        {
          resource_name: "Edison",
          customerId: "pcs",
          resourceType: "room",
          subject: "Smart Auto Book Meeting",
          start_timestamp: 1754932500000,
          end_timestamp: 1754934300000,
          organizer_name: "alan.yeung",
          organizer_email: "alan.yeung@powerworkplace.com",
          timestamp: "2025-08-11T17:15:00.000000Z"
        }
      ];
      setCancelledMeetingsData(mockData.map((m, i) => normalizeMeeting(m, i)));
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data based on applied resource type and date range
  const getFilteredData = () => {
    let filteredData = cancelledMeetingsData;
    
    // Filter by applied resource type
    if (appliedResourceType !== 'all') {
      filteredData = filteredData.filter(item => 
        item.resourceType.toLowerCase() === appliedResourceType.toLowerCase()
      );
    }
    
    // Filter by applied date range using timestamp
    const dateRange = getAppliedDateRange();
    filteredData = filteredData.filter(item => {
      const itemDate = typeof item.timestamp === 'number' ? item.timestamp : parseToMs(item.timestamp);
      return typeof itemDate === 'number' && itemDate >= dateRange.fromDate && itemDate <= dateRange.toDate;
    });
    
    return filteredData;
  };

  // Get date range based on applied report type
  const getAppliedDateRange = useCallback(() => {
    if (appliedReportType === "daily") {
      const startOfDay = new Date(appliedSelectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(appliedSelectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      return {
        fromDate: formatDateForAPI(startOfDay),
        toDate: formatDateForAPI(endOfDay),
      };
    } else if (appliedReportType === "weekly") {
      const weekStart = startOfWeek(appliedSelectedDate);
      const weekEnd = endOfWeek(appliedSelectedDate);
      return {
        fromDate: formatDateForAPI(weekStart),
        toDate: formatDateForAPI(weekEnd),
      };
    } else if (appliedReportType === "monthly") {
      const [year, month] = appliedCurrentMonth.split("-");
      const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      return {
        fromDate: formatDateForAPI(monthStart),
        toDate: formatDateForAPI(monthEnd),
        month: appliedCurrentMonth,
      };
    } else {
      return {
        fromDate: formatDateForAPI(appliedCustomStartDate),
        toDate: formatDateForAPI(appliedCustomEndDate),
      };
    }
  }, [appliedReportType, appliedSelectedDate, appliedCurrentMonth, appliedCustomStartDate, appliedCustomEndDate]);

  // Get date range based on current (not applied) report type - for display purposes only
  const getDateRange = useCallback(() => {
    if (reportType === "daily") {
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
      return {
        fromDate: formatDateForAPI(customStartDate),
        toDate: formatDateForAPI(customEndDate),
      };
    }
  }, [reportType, selectedDate, currentMonth, customStartDate, customEndDate]);

  // Apply all filters (date range and resource type)
  const applyFilters = useCallback(() => {
    // Update all applied filter states
    setAppliedReportType(reportType);
    setAppliedSelectedDate(selectedDate);
    setAppliedCurrentMonth(currentMonth);
    setAppliedCustomStartDate(customStartDate);
    setAppliedCustomEndDate(customEndDate);
    setAppliedResourceType(resourceType);
    
    // Update legacy date states if custom
    if (reportType === "custom") {
      setStartDate(customStartDate);
      setEndDate(customEndDate);
    }
  }, [reportType, selectedDate, currentMonth, customStartDate, customEndDate, resourceType]);

  // Export CSV function
  const exportToCSV = () => {
    try {
      const filteredData = getFilteredData();
      if (filteredData.length === 0) {
        alert('No data available for export');
        return;
      }

      const csvData = filteredData.map(meeting => ({
        'Organizer': meeting.organizer_name || '',
        'Customer': meeting.organizer_email || '',
        'Venue': meeting.resource_name || '',
        'Type': meeting.resourceType || '',
        'Meeting Date': formatTimestampToDate(meeting.start_timestamp),
        'Start Time': formatTimestampToTime(meeting.start_timestamp),
        'End Time': formatTimestampToTime(meeting.end_timestamp),
        'Cancel Time': formatTimestampToTime(meeting.timestamp),
        'Duration': calculateDuration(meeting.start_timestamp, meeting.end_timestamp),
        'Subject': meeting.subject || ''
      }));

      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const dateRange = getAppliedDateRange();
      const fromDate = new Date(dateRange.fromDate).toISOString().split('T')[0];
      const toDate = new Date(dateRange.toDate).toISOString().split('T')[0];
      const filename = `Cancelled_Meetings_${fromDate}_to_${toDate}.csv`;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  // Generate mock data for demonstration
  const generateMockData = useCallback(() => {
    const dateRange = getDateRange();
    const data = [];
    let totalCancelled = 0;
    let totalMeetings = 0;

    if (reportType === "daily") {
      // Generate hourly data for the selected day
      for (let hour = 0; hour < 24; hour++) {
        const cancelled = Math.floor(Math.random() * 5);
        const total = cancelled + Math.floor(Math.random() * 10) + 1;
        const cancellationRate = (cancelled / total) * 100;
        
        totalCancelled += cancelled;
        totalMeetings += total;
        
        data.push({
          displayTime: `${String(hour).padStart(2, "0")}:00`,
          cancelled: cancelled,
          total: total,
          cancellationRate: cancellationRate,
        });
      }
    } else {
      // Generate daily data for other report types
      const startDate = new Date(dateRange.fromDate);
      const endDate = new Date(dateRange.toDate);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i <= daysDiff; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const cancelled = Math.floor(Math.random() * 8);
        const total = cancelled + Math.floor(Math.random() * 15) + 1;
        const cancellationRate = (cancelled / total) * 100;
        
        totalCancelled += cancelled;
        totalMeetings += total;
        
        data.push({
          date: formatDateDisplay(currentDate),
          cancelled: cancelled,
          total: total,
          cancellationRate: cancellationRate,
        });
      }
    }

    setChartData(data);
    setSummaryMetrics({
      totalCancelled: totalCancelled,
      averagePerDay: totalMeetings > 0 ? (totalCancelled / data.length).toFixed(1) : 0,
      mostCancelledTime: reportType === "daily" ? "14:00" : "Monday",
      cancellationRate: totalMeetings > 0 ? ((totalCancelled / totalMeetings) * 100).toFixed(1) : 0,
    });
  }, [getDateRange, reportType]);

  // Initialize date ranges based on report type changes
  useEffect(() => {
    if (reportType === "daily") {
      setStartDate(selectedDate);
      setEndDate(selectedDate);
    } else if (reportType === "weekly") {
      const weekStart = startOfWeek(selectedDate);
      const weekEnd = endOfWeek(selectedDate);
      setStartDate(weekStart);
      setEndDate(weekEnd);
    } else if (reportType === "monthly") {
      const [year, month] = currentMonth.split("-");
      const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      setStartDate(monthStart);
      setEndDate(monthEnd);
    }
  }, [reportType, selectedDate, currentMonth]);

  // Fetch data only when component mounts (not when filters change)
  useEffect(() => {
    fetchCancelledMeetings();
  }, []);

  // Get date display string based on report type
  const getDateDisplayString = () => {
    const dateRange = getAppliedDateRange();
    let dateString = "";

    if (appliedReportType === "daily") {
      const date = new Date(dateRange.fromDate);
      dateString = `${String(date.getDate()).padStart(2, "0")}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${date.getFullYear()}`;
    } else if (appliedReportType === "weekly") {
      const fromDate = new Date(dateRange.fromDate);
      const toDate = new Date(dateRange.toDate);
      dateString = `${formatDateDisplay(fromDate)} to ${formatDateDisplay(
        toDate
      )} (Weekly)`;
    } else if (appliedReportType === "monthly") {
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

    return `${dateString} - Cancelled Meetings`;
  };

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
                <input
                  type="date"
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-auto"
                />
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
                    style={{
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none'
                    }}
                  />
                  
                </div>
              </div>
            )}

            {reportType === "custom" && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={format(customStartDate, "yyyy-MM-dd")}
                    onChange={(e) => setCustomStartDate(new Date(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-auto"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={format(customEndDate, "yyyy-MM-dd")}
                    onChange={(e) => setCustomEndDate(new Date(e.target.value))}
                    min={format(customStartDate, "yyyy-MM-dd")}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-auto"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Resource Type Filter */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Resource Type
            </label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-auto"
            >
              <option value="all">All</option>
              <option value="room">Room</option>
              <option value="desk">Desk</option>
            </select>
          </div>
        </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              onClick={applyFilters}
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
      <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
        <p className="text-red-800 flex items-center">
          <CalendarX className="h-5 w-5 mr-2" />
          Showing cancelled meetings data for: {getDateDisplayString()}
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-8 flex justify-center">
          <p className="text-lg">Loading cancelled meetings data...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <>
          {/* Cancelled Meetings Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Cancelled Meetings ({getFilteredData().length} records)
              </h2>
            </div>
            
            {getFilteredData().length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No cancelled meetings found for the selected criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-center text-md font-medium text-gray-700">
                        Organizer
                      </th>
                      <th className="px-6 py-3 text-center text-md font-medium text-gray-700">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-center text-md font-medium text-gray-700">
                        Venue
                      </th>
                      <th className="px-6 py-3 text-center text-md font-medium text-gray-700">
                        Type
                      </th>
                      <th className="px-6 py-3 text-center text-md font-medium text-gray-700">
                        Meeting date
                      </th>
                      <th className="px-6 py-3 text-center text-md font-medium text-gray-700">
                        Start time
                      </th>
                      <th className="px-6 py-3 text-center text-md font-medium text-gray-700">
                        End time
                      </th>
                      <th className="px-6 py-3 text-center text-md font-medium text-gray-700">
                        Cancel time
                      </th>
                      <th className="px-6 py-3 text-center text-md font-medium text-gray-700">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredData().map((meeting, idx) => (
                      <tr key={meeting.id ?? `${meeting.timestamp}-${idx}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                          {meeting.organizer_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {meeting.organizer_email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {meeting.resource_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            (meeting.resourceType || '').toLowerCase() === 'room' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {(meeting.resourceType || '').charAt(0).toUpperCase() + (meeting.resourceType || '').slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {formatTimestampToDate(meeting.start_timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {formatTimestampToTime(meeting.start_timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {formatTimestampToTime(meeting.end_timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {formatTimestampToTime(meeting.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {calculateDuration(meeting.start_timestamp, meeting.end_timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CancelledMeetings;