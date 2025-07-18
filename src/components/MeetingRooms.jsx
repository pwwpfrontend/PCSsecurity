// File: src/components/Dashboard/MeetingRooms.jsx
import React, { useEffect, useState } from "react";
import meetingRoomStatus from "../data/meetingRoomStatus";
import { Monitor } from "lucide-react"; // Use appropriate icon

const MeetingRooms = () => {
  const [rooms, setRooms] = useState(meetingRoomStatus);

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = rooms.map((room) => ({
        ...room,
        available: Math.random() > 0.5,
      }));
      setRooms(updated);
    }, 10000);
    return () => clearInterval(interval);
  }, [rooms]);

  return (
    <div className="bg-white p-5 rounded-xl shadow w-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <Monitor size={16} className="text-gray-700" />
          <h2 className="text-sm font-semibold">Meeting Rooms</h2>
        </div>
        <div className="text-xs text-right">
          <p className="text-gray-600">Max Load: <span className="font-medium">50</span></p>
          <p className="text-green-600 font-medium">Status: Low</p>
        </div>
      </div>

      {/* Grid of Rooms */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {rooms.map((room) => (
          <div
            key={room.name}
            className={`py-4 rounded-md text-center text-sm font-medium shadow-sm ${
              room.available
                ? "bg-green-400 text-green-800"
                : "bg-red-400 text-red-800"
            }`}
          >
            {room.name}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-end mt-4 text-xs text-gray-600 space-x-6">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
          <span>Unavailable</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
          <span>Available</span>
        </div>
      </div>
    </div>
  );
};

export default MeetingRooms;
