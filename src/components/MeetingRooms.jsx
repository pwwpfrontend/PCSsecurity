import React, { useEffect, useState } from "react";
import { Monitor } from "lucide-react";

const ROOM_MEETINGS_API_URL = "https://api.powerworkplace.com/api:lToIpusH/humlylivemeetings?customerId=pcs";

// Define all meeting rooms
const ALL_MEETING_ROOMS = [
  "Edison", "Nobel", "Einstein", "Morse",
  "Bell", "Hopper", "Kilburn"
];

const MeetingRooms = () => {
  const [rooms, setRooms] = useState(ALL_MEETING_ROOMS.map(name => ({ name, available: true })));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMeetingRoomData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      console.log("Fetching data from:", ROOM_MEETINGS_API_URL);

      const response = await fetch(ROOM_MEETINGS_API_URL);
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiResponse = await response.json();
      console.log("API Response:", apiResponse);

      // Extract liveMeetings array from the response
      let liveMeetings = [];
      
      if (Array.isArray(apiResponse)) {
        // If response is array, find the first item with liveMeetings
        const dataItem = apiResponse.find(item => item.liveMeetings && Array.isArray(item.liveMeetings));
        if (dataItem) {
          liveMeetings = dataItem.liveMeetings;
        }
      } else if (apiResponse.liveMeetings && Array.isArray(apiResponse.liveMeetings)) {
        // If response is object with liveMeetings property
        liveMeetings = apiResponse.liveMeetings;
      } else {
        console.error("API response doesn't contain liveMeetings array:", apiResponse);
        throw new Error("Invalid API response format - missing liveMeetings");
      }

      console.log("Extracted liveMeetings:", liveMeetings);

      // Current timestamp
      const now = Date.now();
      console.log("Current timestamp:", now, "->", new Date(now).toISOString());

      // Filter currently active meetings
      const occupiedRoomNames = liveMeetings
        .filter(meeting => {
          // Check if meeting object has required properties
          if (!meeting.startTimeTimestamp || !meeting.endTimeTimestamp || !meeting.area) {
            console.warn("Meeting object missing required properties:", meeting);
            return false;
          }

          const start = Number(meeting.startTimeTimestamp);
          const end = Number(meeting.endTimeTimestamp);

          // Check if timestamps are valid numbers
          if (isNaN(start) || isNaN(end)) {
            console.warn("Invalid timestamps:", meeting);
            return false;
          }

          const isActive = now >= start && now <= end;

          console.log(`Checking room: ${meeting.area}`, {
            startTimeTimestamp: meeting.startTimeTimestamp,
            endTimeTimestamp: meeting.endTimeTimestamp,
            startUTC: new Date(start).toISOString(),
            endUTC: new Date(end).toISOString(),
            nowUTC: new Date(now).toISOString(),
            isActive
          });

          return isActive;
        })
        .map(meeting => meeting.area);

      console.log("Currently occupied rooms:", occupiedRoomNames);

      // Build room statuses
      const roomStatuses = ALL_MEETING_ROOMS.map(name => ({
        name,
        available: !occupiedRoomNames.includes(name)
      }));

      console.log("Final room statuses:", roomStatuses);

      setRooms(roomStatuses);
      setError(null);
    } catch (err) {
      console.error("Error fetching meeting room data:", err);
      setError(`Failed to load meeting room data: ${err.message}`);

      // Keep existing data if any, don't override with fallback
      if (rooms.length === 0) {
        // Only set fallback if no existing data
        setRooms(ALL_MEETING_ROOMS.map(name => ({ name, available: true })));
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchMeetingRoomData(); // Initial fetch with loading
    const interval = setInterval(() => {
      fetchMeetingRoomData(false); // Silent updates without loading
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Only show loading on initial load
  if (loading && rooms.every(room => room.available)) {
    return (
      <div className="bg-white p-5 rounded-xl shadow w-full border border-gray-300">
        <div className="flex justify-center items-center h-48">
          <div className="text-gray-500">Loading meeting rooms...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow w-full border border-gray-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <Monitor size={20} className="text-gray-700" />
          <h2 className="text-lg font-semibold">Meeting Rooms</h2>
        </div>
        <div className="text-sm text-right">
          <p className="text-gray-600">
            Available: <span className="font-medium">{rooms.filter(r => r.available).length}/{rooms.length}</span>
          </p>
          <p className="text-green-600 font-medium">Status: Live</p>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      </div>

      {/* Room Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {rooms.map(room => (
          <div
            key={room.name}
            className={`h-[104px] w-full rounded-md text-md font-medium shadow-md flex items-center justify-center text-white transition-colors duration-300
              ${room.available ? "bg-[rgb(164,221,180)]" : "bg-[rgb(228,122,124)]"}
            `}
          >
            {room.name}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-end mt-4 text-xs text-gray-600 space-x-6">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[rgb(228,122,124)] inline-block"></span>
          <span>Occupied</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[rgb(164,221,180)] inline-block"></span>
          <span>Available</span>
        </div>
      </div>
    </div>
  );
};

export default MeetingRooms;