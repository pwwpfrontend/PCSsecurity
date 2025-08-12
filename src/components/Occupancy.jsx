import React, { useState, useEffect, useCallback } from "react";
import OccupancyFilters from "./OccupancyFilters";
import OccupancyCharts from "./OccupancyCharts";
import { ChevronDown, ChevronUp } from "lucide-react";

const HistoricalOccupancy = () => {
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportType, setReportType] = useState("daily");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [chartDataMap, setChartDataMap] = useState({});
  const [apiError, setApiError] = useState(null);
  
  // Initialize date range
  const today = new Date().toISOString().split("T")[0];
  const [dateRange, setDateRange] = useState({
    selectedDate: today,
    startDate: today,
    endDate: today
  });

  const rowsPerPage = 10;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tableData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(tableData.length / rowsPerPage);

  // API base URLs
  const API_BASE_URL = "http://optimus-india-njs-01.netbird.cloud:3005/pcs/optimus";

  // Enhanced logging function
  const logApiResponse = (endpoint, data) => {
    console.log(`=== API Response from ${endpoint} ===`);
    console.log("Raw data:", data);
    if (Array.isArray(data) && data.length > 0) {
      console.log("First item structure:", data[0]);
      console.log("Available keys:", Object.keys(data[0]));
    } else if (data && typeof data === 'object') {
      console.log("Data structure:", data);
      console.log("Available keys:", Object.keys(data));
    }
    console.log("=====================================");
  };

  // Helper function to safely parse numeric values
  const safeParseNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove % sign if present
      const cleanValue = value.replace('%', '').trim();
      const parsed = parseFloat(cleanValue);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Convert timestamps to readable format
  const convertTimestamp = (timestamp) => {
    if (!timestamp) return new Date().toISOString();
    if (typeof timestamp === 'string') return timestamp;
    // Convert Unix timestamp if it's a number
    const date = new Date(timestamp);
    return date.toISOString();
  };

  // Helper function to format hour display
  const formatHour = (hour) => {
    const hourNum = safeParseNumber(hour);
    return `${String(hourNum).padStart(2, '0')}:00`;
  };

  // Helper function to format date for display in charts
  const formatDateForChart = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  // Helper function to fetch data for the given range (new API returns all areas)
  const fetchAllZonesData = async (startTimestamp, endTimestamp, apiType) => {
    try {
      const startStr = typeof startTimestamp === 'string'
        ? startTimestamp
        : new Date(startTimestamp).toISOString().split('T')[0];
      const endStr = typeof endTimestamp === 'string'
        ? endTimestamp
        : new Date(endTimestamp).toISOString().split('T')[0];
      const url = apiType === 'daily'
        ? `${API_BASE_URL}/occupancy_hourly_summary?start=${startStr}&end=${endStr}`
        : `${API_BASE_URL}/occupancy_daily_summary?start=${startStr}&end=${endStr}`;
      
      console.log('Fetching from URL:', url);
      const response = await fetch(url);
      if (!response.ok) return [];
      const data = await response.json();
      console.log('Raw API response:', data);
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  };

  // Calculate averages for Weekly/Monthly/Custom reports
  const calculateAveragesForPeriod = (data, reportType) => {
    if (!data || data.length === 0) return [];
    
    if (selectedArea === "All Areas") {
      // Group data by zone and calculate averages for each zone
      const zoneGroups = data.reduce((acc, item) => {
        const zone = item.area || item.zone || item.originalZone || "Unknown";
        if (!acc[zone]) acc[zone] = [];
        acc[zone].push(item);
        return acc;
      }, {});
      
      return Object.keys(zoneGroups).map(zone => {
        const zoneData = zoneGroups[zone];
        const avgOccupancy = zoneData.reduce((sum, item) => sum + safeParseNumber(item.occupancy_count_avg ?? item.occupancy), 0) / zoneData.length;
        const avgPercentage = zoneData.reduce((sum, item) => sum + safeParseNumber(item.occupancy_percentage_avg ?? item.occupancyPercentage), 0) / zoneData.length;
        
        return {
          id: zone,
          zone: zone,
          occupancy: Math.round(avgOccupancy * 10) / 10,
          occupancyPercentage: Math.round(avgPercentage),
          reportLabel: getReportLabel(reportType),
          isAverage: true,
          date: new Date().toISOString().split('T')[0],
          raw_data: zoneData
        };
      });
    } else {
      // Single zone - calculate overall average
      const filtered = data.filter(d => (d.area || d.zone) === selectedArea);
      const source = filtered.length > 0 ? filtered : data;
      const avgOccupancy = source.reduce((sum, item) => sum + safeParseNumber(item.occupancy_count_avg ?? item.occupancy), 0) / source.length;
      const avgPercentage = source.reduce((sum, item) => sum + safeParseNumber(item.occupancy_percentage_avg ?? item.occupancyPercentage), 0) / source.length;
      
      return [{
        id: 0,
        zone: selectedArea,
        occupancy: Math.round(avgOccupancy * 10) / 10,
        occupancyPercentage: Math.round(avgPercentage),
        reportLabel: getReportLabel(reportType),
        isAverage: true,
        date: new Date().toISOString().split('T')[0],
        raw_data: source
      }];
    }
  };

  // Helper function to get report label
  const getReportLabel = (reportType) => {
    switch (reportType) {
      case "weekly": return "Weekly Average";
      case "monthly": return "Monthly Average";
      case "custom": return "Custom Average";
      default: return "Average";
    }
  };

  // FIXED: Process API data to match our table structure
  const processApiData = (data, type) => {
    console.log('Processing API data:', data, 'Type:', type);
    console.log('Selected Area:', selectedArea);
    
    if (!data || data.length === 0) return [];
    
    // Handle both single object and array responses
    const dataArray = Array.isArray(data) ? data : [data];
    console.log('Data array length:', dataArray.length);
    
    let processedData = [];
    
    // For daily reports, we need to group by area and show all hours for each area
    if (type === "daily") {
      // First, get all unique areas from the data
      const availableAreas = [...new Set(dataArray.map(item => item.area || item.zone || item.originalZone || "Unknown"))];
      console.log('Available areas in data:', availableAreas);
      
      // Determine which areas to process
      let areasToProcess = [];
      if (selectedArea === "All Areas") {
        areasToProcess = availableAreas;
      } else {
        // Check if the selected area exists in the data
        areasToProcess = availableAreas.includes(selectedArea) ? [selectedArea] : availableAreas;
      }
      console.log('Areas to process:', areasToProcess);
      
      // Group data by area and hour
      const areaHourMap = {};
      
      dataArray.forEach((item) => {
        const areaName = item.area || item.zone || item.originalZone || "Unknown";
        
        // Convert UTC hour to HKT hour
        let hktHour = null;
        if (item.hour !== undefined && item.hour !== null) {
          const utcHour = safeParseNumber(item.hour);
          hktHour = (((utcHour + 8) % 24) + 24) % 24;
        } else if (item.timestamp) {
          const parsedTs = Date.parse(item.timestamp);
          if (!Number.isNaN(parsedTs)) {
            const msHkt = parsedTs + 8 * 60 * 60 * 1000;
            const d = new Date(msHkt);
            hktHour = d.getUTCHours();
          }
        }
        
        // Store data with converted hour
        if (hktHour !== null) {
          const key = `${areaName}-${hktHour}`;
          areaHourMap[key] = item;
          console.log(`Mapped data for ${key}:`, {
            occupancy: item.occupancy_count_avg || item.occupancy,
            percentage: item.occupancy_percentage_avg || item.occupancyPercentage
          });
        }
      });
      
      // Generate table rows for each area and each hour (8-17)
      areasToProcess.forEach(areaName => {
        console.log(`\nProcessing area: ${areaName}`);
        
        for (let hour = 8; hour <= 17; hour++) {
          const key = `${areaName}-${hour}`;
          const item = areaHourMap[key];
          
          console.log(`  Hour ${hour}: ${item ? 'HAS DATA' : 'NO DATA'}`);
          if (item) {
            console.log(`    Occupancy: ${item.occupancy_count_avg || item.occupancy}`);
            console.log(`    Percentage: ${item.occupancy_percentage_avg || item.occupancyPercentage}`);
          }
          
          // Get date from the item or use selected date
          let baseDate = dateRange.selectedDate;
          if (item && item.day) {
            const match = item.day.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (match) {
              const y = Number(match[1]);
              const m = Number(match[2]);
              const d = Number(match[3]);
              const msUtc = Date.UTC(y, m - 1, d, 0, 0, 0);
              const msHkt = msUtc + 8 * 60 * 60 * 1000;
              baseDate = new Date(msHkt).toISOString().split('T')[0];
            } else {
              const parsed = Date.parse(item.day);
              if (!Number.isNaN(parsed)) {
                baseDate = new Date(parsed + 8 * 60 * 60 * 1000).toISOString().split('T')[0];
              }
            }
          }

          const occupancyValue = item ? safeParseNumber(item.occupancy_count_avg ?? item.occupancy) : 0;
          const percentageValue = item ? safeParseNumber(item.occupancy_percentage_avg ?? item.occupancyPercentage) : 0;

          processedData.push({
            id: `${areaName}-${hour}`,
            zone: areaName,
            occupancy: Math.round(occupancyValue * 10) / 10,
            occupancyPercentage: Math.round(percentageValue),
            hour: hour,
            date: baseDate,
            timestamp: item?.timestamp || Date.now(),
            raw_item: item || null
          });
        }
      });
      
      // Sort by area name first, then by hour
      processedData = processedData.sort((a, b) => {
        if (a.zone !== b.zone) {
          return a.zone.localeCompare(b.zone);
        }
        return a.hour - b.hour;
      });
      
      console.log('Final processed data length:', processedData.length);
      console.log('Sample processed items:', processedData.slice(0, 3));
      
    } else {
      // For non-daily reports, process normally
      processedData = dataArray.map((item, index) => {
        const hktDate = item.day ? (() => {
          const match = item.day.match(/^(\d{4})-(\d{2})-(\d{2})/);
          if (match) {
            const y = Number(match[1]);
            const m = Number(match[2]);
            const d = Number(match[3]);
            const msUtc = Date.UTC(y, m - 1, d, 0, 0, 0);
            const msHkt = msUtc + 8 * 60 * 60 * 1000;
            return new Date(msHkt).toISOString().split('T')[0];
          }
          const parsed = Date.parse(item.day);
          if (!Number.isNaN(parsed)) {
            return new Date(parsed + 8 * 60 * 60 * 1000).toISOString().split('T')[0];
          }
          return item.date || convertTimestamp(item.timestamp) || new Date().toISOString();
        })() : (item.date || convertTimestamp(item.timestamp) || new Date().toISOString());

        return {
          id: index,
          zone: item.area || item.zone || item.originalZone || selectedArea,
          occupancy: Math.round(safeParseNumber(item.occupancy_count_avg ?? item.occupancy) * 10) / 10,
          occupancyPercentage: Math.round(safeParseNumber(item.occupancy_percentage_avg ?? item.occupancyPercentage)),
          date: hktDate,
          timestamp: item.timestamp || Date.now(),
          raw_item: item
        };
      });
    }
    
    return processedData;
  };

  // Fetch chart data for expanded rows
  const fetchChartData = async (zone) => {
    try {
      let url, data;
      const startTimestamp = new Date(dateRange.selectedDate || dateRange.startDate).getTime();
      const endTimestamp = new Date(dateRange.selectedDate || dateRange.endDate).getTime() + (24 * 60 * 60 * 1000) - 1;
      
      if (reportType.toLowerCase() === "daily") {
        // For daily reports, use the historical API to get hourly data (0-23)
        const startStr = new Date(startTimestamp).toISOString().split('T')[0];
        const endStr = new Date(endTimestamp).toISOString().split('T')[0];
        url = `${API_BASE_URL}/occupancy_hourly_summary?start=${startStr}&end=${endStr}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        data = await response.json();
        
        console.log('Chart data received:', data);
        
        // Process data to create chart data for all 24 hours
        const chartData = Array(24).fill().map((_, index) => ({
          hour: index,
          hour_display: `${String(index).padStart(2, '0')}:00`,
          occupancyPercentage: 0
        }));
        
        // Fill in actual data
        if (Array.isArray(data)) {
          const filtered = data.filter(d => (d.area || d.zone) === (zone.split('-')[0] || zone));
          filtered.forEach(item => {
            const hourUtc = safeParseNumber(item.hour);
            const hourHkt = (((hourUtc + 8) % 24) + 24) % 24;
            if (hourHkt >= 0 && hourHkt <= 23) {
              chartData[hourHkt].occupancyPercentage = safeParseNumber(item.occupancy_percentage_avg ?? item.occupancyPercentage);
            }
          });
        } else if (data && data.hour !== undefined) {
          const hourUtc = safeParseNumber(data.hour);
          const hourHkt = (((hourUtc + 8) % 24) + 24) % 24;
          if (hourHkt >= 0 && hourHkt <= 23) {
            chartData[hourHkt].occupancyPercentage = safeParseNumber(data.occupancy_percentage_avg ?? data.occupancyPercentage);
          }
        }
        
        setChartDataMap(prev => ({
          ...prev,
          [zone]: chartData
        }));
      } else {
        // For other report types, use the regular API
        const startStr = new Date(startTimestamp).toISOString().split('T')[0];
        const endStr = new Date(endTimestamp).toISOString().split('T')[0];
        url = `${API_BASE_URL}/occupancy_daily_summary?start=${startStr}&end=${endStr}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        data = await response.json();
        
        // Process data for date-based charts
        const dataArray = Array.isArray(data) ? data : [data];
        const filtered = dataArray.filter(d => (selectedArea === 'All Areas') ? true : ((d.area || d.zone) === zone.split('-')[0] || (d.area || d.zone) === selectedArea));
        const chartData = filtered.map(item => {
          let dateStr = '';
          if (item.day && typeof item.day === 'string') {
            const match = item.day.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (match) {
              const y = Number(match[1]);
              const m = Number(match[2]);
              const d = Number(match[3]);
              const msUtc = Date.UTC(y, m - 1, d, 0, 0, 0);
              const msHkt = msUtc + 8 * 60 * 60 * 1000;
              dateStr = new Date(msHkt).toISOString().split('T')[0];
            } else {
              const parsed = Date.parse(item.day);
              if (!Number.isNaN(parsed)) {
                dateStr = new Date(parsed + 8 * 60 * 60 * 1000).toISOString().split('T')[0];
              }
            }
          }
          if (!dateStr) dateStr = item.date || new Date().toISOString().split('T')[0];
          return {
            date: dateStr,
            date_display: formatDateForChart(dateStr),
            occupancyPercentage: safeParseNumber(item.occupancy_percentage_avg ?? item.occupancyPercentage)
          };
        });
        
        setChartDataMap(prev => ({
          ...prev,
          [zone]: chartData
        }));
      }
    } catch (error) {
      console.error(`Error fetching chart data for ${zone}:`, error);
    }
  };

  // Test API connection function
  const testApiConnection = async () => {
    console.log("Testing API connection...");
    try {
      // Test with the new API endpoints
      const now = new Date();
      const endStr = now.toISOString().split('T')[0];
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      const startStr = start.toISOString().split('T')[0];
      const testUrl = `${API_BASE_URL}/occupancy_daily_summary?start=${startStr}&end=${endStr}`;
      console.log("Test URL:", testUrl);
      
      const response = await fetch(testUrl);
      console.log("Response status:", response.status);
      console.log("Response headers:", [...response.headers.entries()]);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Test API response:", data);
      console.log("Response type:", typeof data);
      console.log("Is array:", Array.isArray(data));
      
      if (Array.isArray(data) && data.length > 0) {
        console.log("Sample item from API:", data[0]);
        console.log("Available fields:", Object.keys(data[0]));
      } else if (data && typeof data === 'object') {
        console.log("Sample data:", data);
        console.log("Available fields:", Object.keys(data));
      }
      
      return data;
    } catch (error) {
      console.error("API test failed:", error);
      return null;
    }
  };

  // Enhanced main data fetching function
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    console.log(`\n=== Starting ${reportType} data fetch ===`);
    console.log("Date range:", dateRange);
    console.log("Selected area:", selectedArea);
    
    try {
      let data;
      
      if (reportType.toLowerCase() === "daily") {
        console.log("Fetching daily data using hourly API...");
        // For Daily reports, use hourly API data
        const startStr = dateRange.selectedDate;
        const endStr = dateRange.selectedDate;
        
        // Fetch data (all areas) - DO NOT filter here
        data = await fetchAllZonesData(startStr, endStr, "daily");
        logApiResponse("occupancy_hourly_summary", data);
        
        // Process the data - filtering will happen inside processApiData
        const processedData = processApiData(data, "daily");
        setTableData(processedData);
        
      } else {
        console.log(`Fetching ${reportType} report data...`);
        // For Weekly, Monthly, Custom reports, use regular API
        const startStr = dateRange.startDate;
        const endStr = dateRange.endDate;
        
        // Fetch data (all areas)
        data = await fetchAllZonesData(startStr, endStr, "period");
        // Apply area filter on client
        const filtered = selectedArea === "All Areas" ? data : data.filter(d => (d.area || d.zone) === selectedArea);
        logApiResponse("occupancy_daily_summary", filtered);
        // For Weekly, Monthly, Custom reports, calculate averages
        const averageData = calculateAveragesForPeriod(filtered, reportType);
        setTableData(averageData);
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      });
      setApiError(error.message);
      setTableData([]);
    } finally {
      setIsLoading(false);
      console.log("=== Data fetch completed ===\n");
    }
  }, [reportType, dateRange, selectedArea]);

  // Handle generate report
  const handleGenerateReport = () => {
    console.log("Generate report clicked with params:", {
      reportType,
      dateRange,
      selectedArea
    });
    
    // Validate date range before fetching
    if (reportType === "daily" && !dateRange.selectedDate) {
      console.error("No selected date for daily report");
      setApiError("No selected date for daily report");
      return;
    }
    
    if ((reportType === "weekly" || reportType === "monthly" || reportType === "custom") && (!dateRange.startDate || !dateRange.endDate)) {
      console.error(`Missing start or end date for ${reportType} report`);
      setApiError(`Missing start or end date for ${reportType} report`);
      return;
    }
    
    fetchData();
    setExpandedRow(null);
    setChartDataMap({});
    setCurrentPage(1);
  };

  // Toggle row expansion - only one row can be expanded at a time
  const toggleRowExpansion = (zone) => {
    // If clicking the same row that's already expanded, collapse it
    if (expandedRow === zone) {
      setExpandedRow(null);
    } else {
      // Expand the new row and collapse any previously expanded row
      setExpandedRow(zone);
      if (!chartDataMap[zone]) {
        fetchChartData(zone);
      }
    }
  };

  // Initial load
  useEffect(() => {
    fetchData();
  }, []);

  // Debug logs
  console.log("=== Current Component State ===");
  console.log("Table Data:", tableData);
  console.log("Current Rows:", currentRows);
  console.log("Report Type:", reportType);
  console.log("Date Range:", dateRange);
  console.log("Selected Area:", selectedArea);
  console.log("Is Loading:", isLoading);
  console.log("API Error:", apiError);
  console.log("===============================");

  return (
    <div className="w-full">

      {/* Filters Section */}
      <div className="w-full">
        <OccupancyFilters
          reportType={reportType}
          setReportType={setReportType}
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedArea={selectedArea}
          setSelectedArea={setSelectedArea}
          onGenerateReport={handleGenerateReport}
          isLoading={isLoading}
          tableData={tableData}
          formatHour={formatHour}
        />
      </div>

      {/* Results Table */}
      <div className="mt-6 mb-10 rounded-xl border border-gray-200 overflow-hidden bg-white w-full mx-auto">
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2">Loading data...</p>
          </div>
        ) : apiError ? (
          <div className="text-center py-16">
            <div className="text-red-500 text-lg mb-2">API Error</div>
            <p className="text-red-400 mb-4">{apiError}</p>
            <button
              onClick={handleGenerateReport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
            >
              Retry
            </button>
          </div>
        ) : tableData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto shadow-custom">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-4 py-4 font-semibold text-gray-700 w-1/4">
                    Area
                  </th>
                  {reportType === "daily" && (
                    <th className="text-center px-4 py-4 font-semibold text-gray-700 w-1/5">
                      Hour
                    </th>
                  )}
                  <th className="text-center px-4 py-4 font-semibold text-gray-700 w-1/5">
                    Average Occupancy
                  </th>
                  <th className="text-center px-4 py-4 font-semibold text-gray-700 w-1/5">
                    Occupancy Percentage
                  </th>
                  <th className="text-center px-4 py-4 font-semibold text-gray-700 w-1/5">
                    Overview
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((item, index) => (
                  <React.Fragment key={`${item.zone}-${item.hour || 'noHour'}-${index}`}>
                    <tr
                      className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                        index === currentRows.length - 1 && expandedRow !== `${item.zone}-${item.hour || 'noHour'}-${index}`
                          ? ""
                          : "border-b border-gray-200"
                      }`}
                      onClick={() => toggleRowExpansion(`${item.zone}-${item.hour || 'noHour'}-${index}`)}
                    >
                      <td className="text-left px-4 py-4 font-medium text-gray-900">
                        {item.isAverage ? `${item.zone} (${item.reportLabel})` : item.zone}
                      </td>
                      {reportType === "daily" && (
                        <td className="text-center px-4 py-4 text-gray-700 font-medium">
                          {item.hour !== undefined && item.hour !== null ? formatHour(item.hour) : '--'}
                        </td>
                      )}
                      <td className="text-center px-4 py-4 text-gray-700 font-medium">
                        {item.occupancy !== undefined && item.occupancy !== null ? item.occupancy : 0}
                      </td>
                      <td className="text-center px-4 py-4 text-gray-700 font-medium">
                        {item.occupancyPercentage !== undefined && item.occupancyPercentage !== null ? 
                          `${item.occupancyPercentage}%` : '0%'}
                      </td>
                      <td className="text-center px-4 py-4">
                        <div className="flex justify-center">
                          {expandedRow === `${item.zone}-${item.hour || 'noHour'}-${index}` ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedRow === `${item.zone}-${item.hour || 'noHour'}-${index}` && (
                      <tr>
                        <td colSpan={reportType === "daily" ? "5" : "4"} className="p-0">
                          <OccupancyCharts
                            item={item}
                            reportType={reportType}
                            chartData={chartDataMap[item.zone] || []}
                            dateRange={dateRange}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-500 text-lg mb-2">No data available</div>
            <p className="text-gray-400 mb-4">
              No data found for the selected criteria. Try adjusting your filters or check the debug panel above.
            </p>
            <button
              onClick={testApiConnection}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition mr-2"
            >
              Test API
            </button>
            <button
              onClick={handleGenerateReport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
            >
              Retry Report
            </button>
          </div>
        )}

        {/* Pagination */}
        {tableData.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-8 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstRow + 1}–{Math.min(indexOfLastRow, tableData.length)} of {tableData.length} rows
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = idx + 1;
                } else if (currentPage <= 3) {
                  pageNum = idx + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + idx;
                } else {
                  pageNum = currentPage - 2 + idx;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md border text-sm ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalOccupancy;