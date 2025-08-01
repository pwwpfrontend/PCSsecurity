import React, { useEffect, useState } from "react";
import { Monitor } from "lucide-react";

const ROOM_MEETINGS_API_URL = "https://njs-01.optimuslab.space/webhook/pcs/room_meetings";

// Define all meeting rooms (static list)
const ALL_MEETING_ROOMS = [
  "Edison", "Nobel", "Einstein", "Morse", 
  "Bell", "Hopper", "Kilburn", "Curie"
];

const MeetingRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch meeting room data from API
  const fetchMeetingRoomData = async () => {
    try {
      setLoading(true);
      const response = await fetch(ROOM_MEETINGS_API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const occupiedRoomsData = await response.json();
      
      // DEBUG: Log the API response to see the structure
      console.log("API Response:", occupiedRoomsData);
      
      // Get current timestamp
      const currentTime = Date.now();
      console.log("Current timestamp:", currentTime);
      
      // Extract room names from API response (only rooms that are currently occupied)
      let occupiedRoomNames = [];
      
      if (Array.isArray(occupiedRoomsData)) {
        occupiedRoomNames = occupiedRoomsData
          .filter(meeting => {
            const startTime = parseInt(meeting.startTime);
            const endTime = parseInt(meeting.endTime);
            const isCurrentlyActive = currentTime >= startTime && currentTime <= endTime;
            
            console.log(`Meeting in ${meeting.area}:`, {
              startTime: new Date(startTime).toLocaleString(),
              endTime: new Date(endTime).toLocaleString(),
              currentTime: new Date(currentTime).toLocaleString(),
              isActive: isCurrentlyActive
            });
            
            return isCurrentlyActive;
          })
          .map(meeting => meeting.area)
          .filter(Boolean);
      }
      
      console.log("Currently occupied room names:", occupiedRoomNames);

      // Create room status array - mark rooms as unavailable if they appear in API
      const roomStatuses = ALL_MEETING_ROOMS.map(roomName => ({
        name: roomName,
        available: !occupiedRoomNames.includes(roomName)
      }));

      console.log("Final room statuses:", roomStatuses);
      setRooms(roomStatuses);
      setError(null);
    } catch (error) {
      console.error("Error fetching meeting room data:", error);
      setError("Failed to load meeting room data");
      
      // Fallback: show all rooms as available if API fails
      const fallbackRooms = ALL_MEETING_ROOMS.map(roomName => ({
        name: roomName,
        available: true
      }));
      setRooms(fallbackRooms);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingRoomData(); // initial fetch
    const interval = setInterval(fetchMeetingRoomData, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
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
            Available: <span className="font-medium">{rooms.filter(room => room.available).length}/{rooms.length}</span>
          </p>
          <p className="text-green-600 font-medium">Status: Live</p>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      </div>

      {/* Room Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {rooms.slice(0, 8).map((room, index) => (
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