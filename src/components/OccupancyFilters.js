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
  // Format a Date as local YYYY-MM-DD without UTC shifting
  const formatDateLocal = (dateLike) => {
    const d = new Date(dateLike);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // FIX 2: Corrected week range calculation (7 days ending on selected date)
  const getWeekRange = (endDate) => {
    const end = new Date(endDate);
    const start = new Date(end);
    start.setDate(end.getDate() - 6); // 6 days before to make it exactly 7 days total

    return {
      startDate: formatDateLocal(start),
      endDate: formatDateLocal(end)
    };
  };

  // FIX 2: Corrected month range calculation (actual first and last day of the month)
  const getMonthRange = (selectedDate) => {
    const date = new Date(selectedDate);
    // Use the actual first day of the selected month (no offset)
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    // Use the actual last day of the selected month (no offset)
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return {
      startDate: formatDateLocal(startOfMonth),
      endDate: formatDateLocal(endOfMonth)
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
      // For monthly reports, calculate the month range using corrected logic
      const monthRange = getMonthRange(value);
      setDateRange(prev => ({
        ...prev,
        selectedDate: value,
        startDate: monthRange.startDate,
        endDate: monthRange.endDate
      }));
    } else {
      // FIX 2: For custom reports, use exact startDate and endDate without alterations
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
    const today = formatDateLocal(new Date());

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
      // FIX 2: For monthly, set to current month range using corrected logic
      const monthRange = getMonthRange(today);
      setDateRange({
        selectedDate: today,
        startDate: monthRange.startDate,
        endDate: monthRange.endDate
      });
    } else if (newReportType === "custom") {
      // FIX 2: For custom reports, start with today's date range
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
                    className={`px-5 py-2.5 text-sm font-medium transition-colors rounded-md ${reportType === type
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
                  className={`${reportType === "weekly" || reportType === "monthly" ? "w-56" : "w-44"
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
                  // Helper function to extract time from ISO timestamp
                  const extractTime = (isoTimestamp) => {
                    if (!isoTimestamp) return '';
                    try {
                      // Extract time portion from ISO timestamp (HH:MM:SS)
                      const timePart = isoTimestamp.split('T')[1];
                      if (timePart) {
                        // Remove Z and milliseconds if present
                        return timePart.split('.')[0].replace('Z', '');
                      }
                      return '';
                    } catch (e) {
                      return '';
                    }
                  };

                  let csvContent = "data:text/csv;charset=utf-8,";
                  if (reportType === "daily") {
                    // For daily reports, include hours and timestamp
                    csvContent += "Area,Hour,Occupancy,Occupancy Percentage,UTC Timestamp\n";
                    csvContent += tableData.map(row => {
                      const timestamp = row.timestamp || row.raw_item?.timestamp || new Date().toISOString();
                      const timeOnly = extractTime(timestamp);
                      return `${row.zone},${formatHour(row.hour)},${row.occupancy || 0},${row.occupancyPercentage || '0.00%'},${timeOnly}`;
                    }).join("\n");
                  } else {
                    // For other report types (weekly, monthly, custom), export each day's data
                    csvContent += "Area,Date,Occupancy,Occupancy Percentage,UTC Timestamp\n";

                    // Helper function to normalize UTC date to HKT date
                    const normalizeDayToHktDate = (dayStr) => {
                      if (!dayStr || typeof dayStr !== 'string') return '';
                      const match = dayStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
                      if (match) {
                        const y = Number(match[1]);
                        const m = Number(match[2]);
                        const d = Number(match[3]);
                        const msUtc = Date.UTC(y, m - 1, d, 0, 0, 0);
                        const msHkt = msUtc + 8 * 60 * 60 * 1000;
                        return new Date(msHkt).toISOString().split('T')[0];
                      }
                      const parsed = Date.parse(dayStr);
                      if (!Number.isNaN(parsed)) {
                        const msHkt = parsed + 8 * 60 * 60 * 1000;
                        return new Date(msHkt).toISOString().split('T')[0];
                      }
                      return dayStr;
                    };

                    // Collect all rows from raw_data
                    const csvRows = [];
                    tableData.forEach(row => {
                      if (row.raw_data && Array.isArray(row.raw_data)) {
                        // Export each day's data from raw_data
                        row.raw_data.forEach(dayData => {
                          const dateStr = normalizeDayToHktDate(dayData.day) || dayData.date || '';
                          const occupancyMax = dayData.occupancy_count_max || dayData.occupancy_count_avg || dayData.occupancy || 0;
                          const percentageMax = dayData.occupancy_percentage_max || dayData.occupancy_percentage_avg || dayData.occupancyPercentage || 0;
                          const timestamp = dayData.timestamp || dayData.timestamp_day || new Date().toISOString();
                          const timeOnly = extractTime(timestamp);
                          csvRows.push(`${row.zone},${dateStr},${occupancyMax},${percentageMax}%,${timeOnly}`);
                        });
                      } else {
                        // Fallback: if no raw_data, use the row itself
                        const timestamp = row.timestamp || new Date().toISOString();
                        const timeOnly = extractTime(timestamp);
                        csvRows.push(`${row.zone},${row.date || dateRange.selectedDate || dateRange.startDate},${row.occupancy || 0},${row.occupancyPercentage || '0.00'}%,${timeOnly}`);
                      }
                    });

                    csvContent += csvRows.join("\n");
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