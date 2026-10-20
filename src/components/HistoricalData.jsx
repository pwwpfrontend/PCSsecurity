import React, { useState } from 'react';
import IndoorAirQuality from './IndoorAirQuality';
import Occupancy from './Occupancy';
//import WeeklyReport from './WeeklyReport';
import CancelledMeetings from './CancelledMeetings';
import { Wind, Users, FileText, CalendarX } from 'lucide-react';

const HistoricalData = () => {
  const [activeTab, setActiveTab] = useState('indoor-air-quality');

  const tabs = [
    { id: 'indoor-air-quality', label: 'Indoor Air Quality', component: IndoorAirQuality, icon: Wind },
    { id: 'occupancy', label: 'Occupancy', component: Occupancy, icon: Users },
    // { id: 'weekly-report', label: 'Weekly Report', component: WeeklyReport, icon: FileText },
    { id: 'cancelled-meetings', label: 'Cancelled Meetings', component: CancelledMeetings, icon: CalendarX },
  ];

  const renderTabContent = () => {
    const activeTabData = tabs.find(tab => tab.id === activeTab);
    if (activeTabData) {
      const Component = activeTabData.component;
      return <Component />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between px-6 pt-6 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Historical Report</h1>
        <p className="text-lg font-medium text-gray-600">
          {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" })},{" "}
          {new Date().toLocaleDateString("en-IN", { weekday: "long" })}
        </p>
      </div>
      
      <main className="px-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <IconComponent className="w-5 h-5 mr-2" />
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default HistoricalData;