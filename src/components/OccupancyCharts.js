import React from "react";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

const OccupancyCharts = ({ item, reportType, chartData = [], dateRange = {} }) => {
  // Updated colors for charts
  const COLORS = ['#2464EC', '#82C0CB', '#FFBB28', '#FF8042', '#8884d8'];

  // Format date for display
  const formatDisplayDate = () => {
    if (reportType === "hourly") {
      // For hourly, show current date
      const now = new Date();
      return now.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } else if (reportType === "daily") {
      // For daily, show the selected date
      if (item.date) {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      }
    } else {
      // For weekly/custom, show date range
      if (item.date_range) {
        const dates = item.date_range.split(' to ');
        if (dates.length === 2) {
          const startDate = new Date(dates[0]);
          const endDate = new Date(dates[1]);
          const formattedStart = startDate.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          });
          const formattedEnd = endDate.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
          });
          return `${formattedStart} to ${formattedEnd}`;
        }
      }
    }
    
    // Fallback to current date
    return new Date().toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Prepare pie chart data
  const preparePieChartData = () => {
    const occupancyPercentage = parseFloat(item.occupancyPercentage?.toString().replace('%', '') || item.occupancy_percentage?.toString().replace('%', '') || 0);
    const availablePercentage = Math.max(0, 100 - occupancyPercentage);
    
    return [
      { name: "Occupied", value: occupancyPercentage },
      { name: "Available", value: availablePercentage }
    ];
  };

  // Prepare bar chart data for weekly/monthly/custom reports
  const prepareBarChartData = () => {
    if (reportType.toLowerCase() === "daily") {
      return chartData.map(data => ({
        ...data,
        hour_display: `${String(data.hour).padStart(2, '0')}:00`
      }));
    } else {
      // For weekly, monthly, custom reports - use raw data from item
      if (item.raw_data && Array.isArray(item.raw_data)) {
        return item.raw_data.map(dataPoint => ({
          date: dataPoint.date || new Date().toISOString().split('T')[0],
          date_display: formatDateForChart(dataPoint.date),
          occupancyPercentage: parseFloat(dataPoint.occupancyPercentage || 0)
        }));
      }
      return [];
    }
  };

  // Helper function to format date for bar chart
  const formatDateForChart = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  // Get chart title based on report type
  const getChartTitle = () => {
    switch (reportType.toLowerCase()) {
      case "daily":
        return "Hourly Trend (0-23 Hours)";
      case "hourly":
        return "Current Hour";
      case "weekly":
        return "Daily Trend (7 Days)";
      case "custom":
        return "Daily Trend (Custom Range)";
      default:
        return "Occupancy Trend";
    }
  };

  // Get X-axis label
  const getXAxisLabel = () => {
    switch (reportType.toLowerCase()) {
      case "daily":
        return "Hour (0-23)";
      case "hourly":
        return "Current Hour";
      case "weekly":
      case "custom":
        return "Date";
      default:
        return "Time";
    }
  };

  // Format tooltip based on report type
  const formatTooltip = (value, name) => {
    if (reportType.toLowerCase() === "daily") {
      return [`${value.toFixed(2)}%`, 'Occupancy Percentage'];
    } else {
      return [`${value.toFixed(2)}%`, 'Occupancy Percentage'];
    }
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange.startDate || !dateRange.endDate) return '';
    
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Helper function to get header text based on report type
  const getHeaderText = () => {
    const zoneName = item.zone || 'Unknown';
    
    if (reportType.toLowerCase() === "daily") {
      // For daily reports, show single date
      const dateText = item.date ? new Date(item.date).toLocaleDateString('en-GB') : 'Unknown Date';
      return (
        <>
          Data for <span className="font-semibold text-blue-600">{zoneName}</span> on <span className="font-semibold text-blue-600">{dateText}</span>
        </>
      );
    } else {
      // For weekly, monthly, custom reports, show date range
      if (dateRange.startDate && dateRange.endDate) {
        const startDate = new Date(dateRange.startDate).toLocaleDateString('en-GB');
        const endDate = new Date(dateRange.endDate).toLocaleDateString('en-GB');
        return (
          <>
            Data for <span className="font-semibold text-blue-600">{zoneName}</span> on <span className="font-semibold text-blue-600">{startDate} - {endDate}</span>
          </>
        );
      } else {
        // Fallback if date range is not available
        const dateText = item.date ? new Date(item.date).toLocaleDateString('en-GB') : 'Unknown Date';
        return (
          <>
            Data for <span className="font-semibold text-blue-600">{zoneName}</span> on <span className="font-semibold text-blue-600">{dateText}</span>
          </>
        );
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 border-t border-gray-200">
      <h2 className="text-lg font-semibold mb-4">
        {getHeaderText()}
      </h2>
      
      {/* Dynamic Layout Based on Report Type */}
      {reportType.toLowerCase() === "daily" ? (
        // Daily Report: Show only Pie Chart and Occupancy Details text
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div>
            <h3 className="text-lg font-medium mb-4">Occupancy Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={preparePieChartData()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  fill="#2464EC"
                  dataKey="value"
                >
                  {preparePieChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Occupancy Details Text for Daily Only */}
          <div>
            <h3 className="text-lg font-medium mb-4">Occupancy Details</h3>
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
                <div className="space-y-3">
                  <p className="text-lg text-gray-800 leading-relaxed">
                    Occupancy percentage at hour <span className="font-semibold text-blue-600">{item.hour !== null && item.hour !== undefined ? String(item.hour).padStart(2, '0') : '00'}</span> is <span className="font-semibold text-blue-600">{item.occupancyPercentage || 0}%</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Weekly, Monthly, Custom Reports: Show only Pie Chart and Bar Chart
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div>
            <h3 className="text-lg font-medium mb-4">Occupancy Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={preparePieChartData()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  fill="#2464EC"
                  dataKey="value"
                >
                  {preparePieChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Bar Chart for Weekly/Monthly/Custom */}
          <div>
            <h3 className="text-lg font-medium mb-4">{getChartTitle()}</h3>
            {prepareBarChartData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareBarChartData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date_display"
                    label={{ value: getXAxisLabel(), position: 'insideBottom', offset: 10 }}
                    tick={{ fontSize: 12 }}
                    angle={0}
                    textAnchor="middle"
                    height={60}
                  />
                  <YAxis 
                    label={{ value: 'Occupancy Percentage(%)', angle: -90, position: 'Middle',offset:10 }} 
                  />
                  <Tooltip formatter={formatTooltip} />
                  <Legend />
                  <Bar 
                    dataKey="occupancyPercentage" 
                    name="Occupancy Percentage(%)" 
                    radius={[4, 4, 0, 0]} 
                    barSize={35} 
                    fill="#2464EC" 
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-gray-500">
                  Loading trend data...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OccupancyCharts;