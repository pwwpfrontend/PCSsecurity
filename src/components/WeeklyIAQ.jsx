import React from 'react';

const WeeklyIAQ = () => {
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Weekly Indoor Air Quality Report</h3>
        <p className="text-sm text-gray-600">Weekly analysis of air quality trends and patterns.</p>
      </div>

      {/* Weekly Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-green-600 text-xl mr-3">✓</div>
            <div>
              <p className="text-sm font-medium text-green-900">Avg CO2</p>
              <p className="text-lg font-bold text-green-800">415 ppm</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-blue-600 text-xl mr-3">🌡️</div>
            <div>
              <p className="text-sm font-medium text-blue-900">Avg Temperature</p>
              <p className="text-lg font-bold text-blue-800">23.5°C</p>
            </div>
          </div>
        </div>
        
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-cyan-600 text-xl mr-3">💧</div>
            <div>
              <p className="text-sm font-medium text-cyan-900">Avg Humidity</p>
              <p className="text-lg font-bold text-cyan-800">52%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-purple-600 text-xl mr-3">⭐</div>
            <div>
              <p className="text-sm font-medium text-purple-900">Air Quality</p>
              <p className="text-lg font-bold text-purple-800">Good</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Daily Air Quality Summary</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              <span className="font-medium text-gray-900">Monday</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <span>CO2: 410 ppm</span>
              <span>Temp: 24°C</span>
              <span>Humidity: 50%</span>
              <span className="text-green-600 font-medium">Excellent</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              <span className="font-medium text-gray-900">Tuesday</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <span>CO2: 425 ppm</span>
              <span>Temp: 23°C</span>
              <span>Humidity: 55%</span>
              <span className="text-green-600 font-medium">Good</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
              <span className="font-medium text-gray-900">Wednesday</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <span>CO2: 480 ppm</span>
              <span>Temp: 25°C</span>
              <span>Humidity: 58%</span>
              <span className="text-yellow-600 font-medium">Moderate</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              <span className="font-medium text-gray-900">Thursday</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <span>CO2: 390 ppm</span>
              <span>Temp: 22°C</span>
              <span>Humidity: 48%</span>
              <span className="text-green-600 font-medium">Excellent</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              <span className="font-medium text-gray-900">Friday</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <span>CO2: 405 ppm</span>
              <span>Temp: 24°C</span>
              <span>Humidity: 52%</span>
              <span className="text-green-600 font-medium">Good</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
              <span className="font-medium text-gray-900">Saturday</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <span>CO2: 350 ppm</span>
              <span>Temp: 23°C</span>
              <span>Humidity: 45%</span>
              <span className="text-blue-600 font-medium">Excellent</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
              <span className="font-medium text-gray-900">Sunday</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <span>CO2: 370 ppm</span>
              <span>Temp: 22°C</span>
              <span>Humidity: 47%</span>
              <span className="text-blue-600 font-medium">Excellent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Weekly Air Quality Trends</h4>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p className="font-medium">Weekly IAQ Trend Chart</p>
            <p className="text-sm">7-day air quality trend visualization</p>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-3">Weekly Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-700 mb-2">
              <strong>Best Performance:</strong> Thursday & Sunday with excellent air quality
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Peak CO2:</strong> Wednesday at 480 ppm during afternoon hours
            </p>
          </div>
          <div>
            <p className="text-gray-700 mb-2">
              <strong>Optimal Temperature:</strong> Maintained within 22-25°C range
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Recommendation:</strong> Increase ventilation on weekdays
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyIAQ;
