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

  // Format dates for API call - convert to timestamp
  const formatDateForAPI = (date) => {
    return date.getTime();
  };

  // Format timestamp to readable date
  const formatTimestampToDate = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayShortName = dayNames[date.getDay()];
    return `${day}/${month}/${year} ${dayShortName}`;
  };

  // Format timestamp to readable time
  const formatTimestampToTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
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
      
      const response = await fetch('https://api.powerworkplace.com/api:rl2yc254/auto_cancel?customerId=pcs');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCancelledMeetingsData(data);
      
    } catch (err) {
      console.error('Error fetching cancelled meetings:', err);
      setError('Failed to fetch cancelled meetings data. Please try again.');
      // Fallback to mock data for demonstration
      const mockData = [
        {
          id: 9,
          created_at: 1692416861527,
          customerId: 'pcs',
          resourceType: 'room',
          organizer_email: 'alaa.abukmeil@powerworkplace.com',
          resource_name: 'Einstein',
          start_timestamp: 1692374400000,
          end_timestamp: 1692460800000,
          organizer_name: 'Alaa Abukmeil',
          subject: ''
        },
        {
          id: 10,
          created_at: 1692416861805,
          customerId: 'pcs',
          resourceType: 'room',
          organizer_email: 'alaa.abukmeil@powerworkplace.com',
          resource_name: 'Morse',
          start_timestamp: 1692374400000,
          end_timestamp: 1692460800000,
          organizer_name: 'Alaa Abukmeil',
          subject: ''
        },
        {
          id: 11,
          created_at: 1692416862000,
          customerId: 'pcs',
          resourceType: 'desk',
          organizer_email: 'john.doe@powerworkplace.com',
          resource_name: 'Desk A1',
          start_timestamp: 1692360000000,
          end_timestamp: 1692367200000,
          organizer_name: 'John Doe',
          subject: ''
        }
      ];
      setCancelledMeetingsData(mockData);
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
    
    // Filter by applied date range
    const dateRange = getAppliedDateRange();
    filteredData = filteredData.filter(item => {
      const itemDate = item.created_at;
      return itemDate >= dateRange.fromDate && itemDate <= dateRange.toDate;
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
      if (chartData.length === 0) {
        alert('No data available for export');
        return;
      }

      const csvData = chartData.map(item => ({
        'Date/Time': item.displayTime || item.date,
        'Cancelled Meetings': item.cancelled || 0,
        'Total Meetings': item.total || 0,
        'Cancellation Rate (%)': item.cancellationRate ? item.cancellationRate.toFixed(2) : '0.00'
      }));

      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => row[header]).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const dateRange = getDateRange();
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
                    {getFilteredData().map((meeting) => (
                      <tr key={meeting.id} className="hover:bg-gray-50">
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
                            meeting.resourceType.toLowerCase() === 'room' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {meeting.resourceType.charAt(0).toUpperCase() + meeting.resourceType.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {formatTimestampToDate(meeting.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {formatTimestampToTime(meeting.start_timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {formatTimestampToTime(meeting.end_timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {formatTimestampToTime(meeting.created_at)}
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
