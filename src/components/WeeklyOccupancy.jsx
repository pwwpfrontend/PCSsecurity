import React from 'react';

const WeeklyOccupancy = () => {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Weekly Occupancy Report</h3>
        <p className="text-sm text-gray-600">Weekly analysis of space utilization and occupancy patterns.</p>
      </div>

      {/* Weekly Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-blue-600 text-xl mr-3">👥</div>
            <div>
              <p className="text-sm font-medium text-blue-900">Avg Occupancy</p>
              <p className="text-lg font-bold text-blue-800">32 people</p>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 text-xl mr-3">📈</div>
            <div>
              <p className="text-sm font-medium text-red-900">Peak Occupancy</p>
              <p className="text-lg font-bold text-red-800">48 people</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-green-600 text-xl mr-3">📊</div>
            <div>
              <p className="text-sm font-medium text-green-900">Utilization</p>
              <p className="text-lg font-bold text-green-800">64%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-purple-600 text-xl mr-3">🏢</div>
            <div>
              <p className="text-sm font-medium text-purple-900">Capacity</p>
              <p className="text-lg font-bold text-purple-800">50 people</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Occupancy Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Daily Occupancy Summary</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
              <span className="font-medium text-gray-900">Monday</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <span>Avg: 38 people</span>
              <span>Peak: 45 people</span>
              <span>Utilization: 76%</span>
              <span className="text-yellow-600 font-medium">High</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
              <span className="font-medium text-gray-900">Tuesday</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <span>Avg: 42 people</span>
              <span>Peak: 48 people</span>
              <span>Utilization: 84%</span>
              <span className="text-red-600 font-medium">Very High</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
              <span className="font-medium text-gray-900">Wednesday</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <span>Avg: 35 people</span>
              <span>Peak: 47 people</span>
              <span>Utilization: 70%</span>
              <span className="text-yellow-600 font-medium">High</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
              <span className="font-medium text-gray-900">Thursday</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <span>Avg: 40 people</span>
              <span>Peak: 46 people</span>
              <span>Utilization: 80%</span>
              <span className="text-red-600 font-medium">Very High</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
              <span className="font-medium text-gray-900">Friday</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <span>Avg: 28 people</span>
              <span>Peak: 38 people</span>
              <span>Utilization: 56%</span>
              <span className="text-green-600 font-medium">Moderate</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              <span className="font-medium text-gray-900">Saturday</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <span>Avg: 15 people</span>
              <span>Peak: 25 people</span>
              <span>Utilization: 30%</span>
              <span className="text-green-600 font-medium">Low</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              <span className="font-medium text-gray-900">Sunday</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <span>Avg: 12 people</span>
              <span>Peak: 20 people</span>
              <span>Utilization: 24%</span>
              <span className="text-green-600 font-medium">Low</span>
            </div>
          </div>
        </div>
      </div>

      {/* Peak Hours Analysis */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Peak Hours Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h5 className="font-medium text-red-900 mb-2">Morning Peak</h5>
            <p className="text-2xl font-bold text-red-800">9:00 - 10:00 AM</p>
            <p className="text-sm text-red-700">Avg: 42 people</p>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h5 className="font-medium text-orange-900 mb-2">Afternoon Peak</h5>
            <p className="text-2xl font-bold text-orange-800">2:00 - 3:00 PM</p>
            <p className="text-sm text-orange-700">Avg: 38 people</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-medium text-green-900 mb-2">Low Activity</h5>
            <p className="text-2xl font-bold text-green-800">6:00 - 8:00 AM</p>
            <p className="text-sm text-green-700">Avg: 8 people</p>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Weekly Occupancy Trends</h4>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p className="font-medium">Weekly Occupancy Trend Chart</p>
            <p className="text-sm">7-day occupancy pattern visualization</p>
          </div>
        </div>
      </div>

      {/* Room Utilization */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Room Utilization This Week</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Conference Hall</p>
              <p className="text-sm text-gray-600">Most utilized space</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-red-600">92%</p>
              <p className="text-sm text-red-500">Utilization</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Meeting Room A</p>
              <p className="text-sm text-gray-600">High demand</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-yellow-600">78%</p>
              <p className="text-sm text-yellow-500">Utilization</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Meeting Room B</p>
              <p className="text-sm text-gray-600">Moderate usage</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600">65%</p>
              <p className="text-sm text-blue-500">Utilization</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Lounge Area</p>
              <p className="text-sm text-gray-600">Low usage</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">32%</p>
              <p className="text-sm text-green-500">Utilization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-3">Weekly Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-700 mb-2">
              <strong>Busiest Days:</strong> Tuesday & Thursday with 80%+ utilization
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Peak Time:</strong> 9:00-10:00 AM weekdays (42 avg people)
            </p>
          </div>
          <div>
            <p className="text-gray-700 mb-2">
              <strong>Weekend Activity:</strong> Significantly lower (24-30% utilization)
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Recommendation:</strong> Consider flexible seating on peak days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyOccupancy;
