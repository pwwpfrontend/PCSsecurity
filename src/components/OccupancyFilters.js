import React from "react";

const OccupancyFilters = ({
  reportType,
  setReportType,
  dateRange,
  setDateRange,
  selectedArea,
  setSelectedArea,
  onGenerateReport,
  isLoading,
  tableData,
  formatHour

}) => {
  // Helper function to get week range (7 days ending on selected date)
  const getWeekRange = (endDate) => {
    const end = new Date(endDate);
    const start = new Date(end);
    start.setDate(end.getDate() - 6); // 6 days before to make it exactly 7 days total
    
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0]
    };
  };

  // Helper function to get month range (proper month days)
  const getMonthRange = (selectedDate) => {
    const date = new Date(selectedDate);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0); // Last day of the month
    
    return {
      startDate: startOfMonth.toISOString().split("T")[0],
      endDate: endOfMonth.toISOString().split("T")[0]
    };
  };

  // Handle date change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    if (reportType === "weekly" && name === "selectedDate") {
      // For weekly reports, calculate the week range
      const weekRange = getWeekRange(value);
      setDateRange(prev => ({
        ...prev,
        selectedDate: value,
        startDate: weekRange.startDate,
        endDate: weekRange.endDate
      }));
    } else if (reportType === "monthly" && name === "selectedDate") {
      // For monthly reports, calculate the month range
      const selectedDate = new Date(value);
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).toISOString().split('T')[0];
      setDateRange(prev => ({
        ...prev,
        selectedDate: value,
        startDate: startOfMonth,
        endDate: endOfMonth
      }));
    } else {
      setDateRange(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle report type change
  const handleReportTypeChange = (newReportType) => {
    setReportType(newReportType);

    // Update date range based on report type
    const today = new Date().toISOString().split("T")[0];
    
    if (newReportType === "daily") {
      setDateRange({
        selectedDate: today,
        startDate: today,
        endDate: today
      });
    } else if (newReportType === "weekly") {
      const weekRange = getWeekRange(today);
      setDateRange({
        selectedDate: today,
        startDate: weekRange.startDate,
        endDate: weekRange.endDate
      });
    } else if (newReportType === "monthly") {
      // For monthly, set to current month range
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];
      setDateRange({
        selectedDate: today,
        startDate: startOfMonth,
        endDate: endOfMonth
      });
    } else if (newReportType === "custom") {
      setDateRange({
        selectedDate: today,
        startDate: today,
        endDate: today
      });
    }
  };

  // Get date display string for weekly and monthly
  const getDateRangeDisplay = () => {
    if (reportType === "weekly" && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      const startMonth = String(startDate.getMonth() + 1).padStart(2, '0');
      const startDay = String(startDate.getDate()).padStart(2, '0');
      const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
      const endDay = String(endDate.getDate()).padStart(2, '0');
      const year = endDate.getFullYear();
      return `(Showing: ${year}-${startMonth}-${startDay} to ${year}-${endMonth}-${endDay})`;
    }
    
    if (reportType === "monthly" && dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      const startMonth = String(startDate.getMonth() + 1).padStart(2, '0');
      const startDay = String(startDate.getDate()).padStart(2, '0');
      const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
      const endDay = String(endDate.getDate()).padStart(2, '0');
      const year = endDate.getFullYear();
      return `(Showing: ${year}-${startMonth}-${startDay} to ${year}-${endMonth}-${endDay})`;
    }
    
    return "";
  };

return (
  <div className="bg-white rounded-lg shadow-md p-4 mb-6 w-full">
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onGenerateReport();
      }}
    >
    <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-y-6 xl:gap-x-8">
        {/* Filter Controls */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end flex-wrap md:gap-x-6 lg:gap-x-4 xl:gap-x-9 flex-1">
          {/* Report Type */}
          <div className="min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <div className="flex flex-wrap gap-2">
              {["daily", "weekly", "monthly", "custom"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleReportTypeChange(type)}
                  className={`px-5 py-2.5 text-sm font-medium transition-colors rounded-md ${
                    reportType === type
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          {reportType === "custom" ? (
            <div className="flex gap-3 min-w-[180px]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateChange}
                  className="w-32 lg:w-36 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateChange}
                  className="w-32 lg:w-36 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col min-w-[180px]">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  {reportType === "weekly" ? "Select Week" : reportType === "monthly" ? "Select Month" : "Select Date"}
                </label>
                {(reportType === "weekly" || reportType === "monthly") && (
                  <span className="text-xs text-gray-500 ml-2">
                    {getDateRangeDisplay()}
                  </span>
                )}
              </div>
              <input
                type="date"
                name="selectedDate"
                value={dateRange.selectedDate}
                onChange={handleDateChange}
                className={`${
                  reportType === "weekly" || reportType === "monthly" ? "w-56" : "w-44"
                } md:w-48 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
            </div>
          )}

          {/* Select Area */}
          <div className="min-w-[160px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Area
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-40 lg:w-44 px-3 py-2.5 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="All Areas">All Areas</option>
              <option value="Zone A">Zone A</option>
              <option value="Zone B">Zone B</option>
              <option value="Zone C">Zone C</option>
              <option value="Office">Office</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-end gap-3 mt-4 lg:mt-0 flex-shrink-0 min-w-fit">
          {tableData && tableData.length > 0 && (
            <button
              type="button"
              onClick={() => {
                let csvContent = "data:text/csv;charset=utf-8,";
                if (reportType === "Daily") {
                  csvContent += "Area,Average Occupancy,Occupancy Percentage\n";
                  csvContent += tableData.map(row =>
                    `${row.zone},${row.occupancy || 0},${row.occupancyPercentage || '0.00%'}`
                  ).join("\n");
                } else {
                  csvContent += "Area,Average Occupancy,Occupancy Percentage\n";
                  csvContent += tableData.map(row =>
                    `${row.zone},${row.occupancy || 0},${row.occupancyPercentage || '0.00%'}`
                  ).join("\n");
                }
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `occupancy_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-md text-sm font-medium transition"
            >
              Export CSV
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md text-sm font-medium transition disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>
    </form>
  </div>
);
};

export default OccupancyFilters;