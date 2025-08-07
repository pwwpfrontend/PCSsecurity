import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Circle, Search, Users, X } from 'lucide-react';

// Custom Wind Icon for IAQ Sensors
const WindIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12.8 19.6A2 2 0 1 0 14 16H2"/>
    <path d="M17.5 8a2.5 2.5 1 1 2 4H2"/>
    <path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>
  </svg>
);

// Custom Green Circle Check Icon for Active Status
const CircleCheckIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21.801 10A10 10 0 1 1 17 3.335"/>
    <path d="m9 11 3 3L22 4"/>
  </svg>
);

const DeviceManagement = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState('occupancy'); // Default to occupancy expanded
  const [expandedDevice, setExpandedDevice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [editingDevice, setEditingDevice] = useState(null);
  const [editForm, setEditForm] = useState({
    sensorType: '',
    location: '',
    area: ''
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    filterDevices();
  }, [devices, searchTerm]);

  const fetchDevices = async () => {
    try {
      const response = await fetch('https://api.powerworkplace.com/api:XrHHMxmV/devicemanagement?customerId=pcs');
      const data = await response.json();
      
      if (data && data.length > 0) {
        const deviceData = data[0];
        const deviceList = deviceData.devices.map(deviceId => {
          const statusEntry = deviceData.devicesStatus.find(status => status[0] === deviceId);
          const deviceInfo = deviceData.devicesInfo[deviceId];
          
          // Check if device is inactive based on timestamp (3+ days)
          const isActive = statusEntry && statusEntry[1] && 
            (Date.now() - statusEntry[1]) < (3 * 24 * 60 * 60 * 1000); // 3 days in milliseconds
          
          // Extract location info from deviceInfo array: [country, city, floor, area]
          const country = deviceInfo ? deviceInfo[0] || 'Unknown' : 'Unknown';
          const city = deviceInfo ? deviceInfo[1] || 'Unknown' : 'Unknown';
          const floor = deviceInfo ? deviceInfo[2] || 'Unknown' : 'Unknown';
          const area = deviceInfo ? deviceInfo[3] || 'Unknown' : 'Unknown';
          
          return {
            id: deviceId,
            name: deviceId,
            status: isActive ? 'Active' : 'Inactive',
            lastSeen: statusEntry && statusEntry[1] ? new Date(statusEntry[1]).toLocaleString() : 'Never',
            country: country,
            city: city,
            floor: floor,
            location: `${floor}, ${city}, ${country}`, // Display as "Floor, City, Country"
            area: area,
            sensorType: getSensorType(deviceId),
            category: getDeviceCategory(deviceId)
          };
        });
        
        setDevices(deviceList);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSensorType = (deviceId) => {
    if (deviceId.includes('9in1') || deviceId.includes('IAQ')) return 'IAQ Sensor';
    if (deviceId.includes('PG')) return 'Paint Grab Occupancy';
    if (['Edison', 'Kilburn', 'Einstein', 'Bell', 'Morse', 'Hopper', 'Nobel'].includes(deviceId)) {
      return 'Meeting room Occupancy';
    }
    return 'Occupancy';
  };

  const getDeviceCategory = (deviceId) => {
    if (deviceId.includes('9in1') || deviceId.includes('IAQ')) return 'iaq';
    return 'occupancy';
  };

  const filterDevices = () => {
    if (!searchTerm) {
      setFilteredDevices(devices);
    } else {
      const filtered = devices.filter(device =>
        device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.sensorType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.area.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDevices(filtered);
    }
  };

  const toggleCategoryExpanded = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
    setExpandedDevice(null); // Close any expanded device when changing category
  };

  const toggleDeviceExpanded = (deviceId) => {
    setExpandedDevice(expandedDevice === deviceId ? null : deviceId);
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'text-green-500' : 'text-red-400';
  };

  const getStatusIcon = (status) => {
    if (status === 'Active') {
      return <CircleCheckIcon className="h-6 w-6 text-green-500" />;
    } else {
      return <Circle className="h-6 w-6 fill-current text-red-500" />;
    }
  };

  const getCategoryIcon = (category) => {
    return category === 'occupancy' ? Users : WindIcon;
  };

  const getCategoryDevices = (category) => {
    return filteredDevices.filter(device => device.category === category);
  };

  const handleEditDevice = (device) => {
    setEditingDevice(device);
    setEditForm({
      sensorType: device.sensorType,
      location: device.location,
      area: device.area
    });
  };

  const handleCloseEdit = () => {
    setEditingDevice(null);
    setEditForm({
      sensorType: '',
      location: '',
      area: ''
    });
  };

  const handleSaveChanges = () => {
    // Update the device in the devices array
    const updatedDevices = devices.map(device => {
      if (device.id === editingDevice.id) {
        return {
          ...device,
          sensorType: editForm.sensorType,
          location: editForm.location,
          area: editForm.area
        };
      }
      return device;
    });
    
    setDevices(updatedDevices);
    
    // Here you would typically make an API call to save the changes
    console.log('Saving changes for device:', editingDevice.id, editForm);
    
    handleCloseEdit();
  };

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const occupancyDevices = getCategoryDevices('occupancy');
  const iaqDevices = getCategoryDevices('iaq');

  // Get categories that have devices after filtering
  const visibleCategories = [];
  if (occupancyDevices.length > 0) {
    visibleCategories.push({
      category: 'occupancy',
      title: 'Occupancy Sensors',
      devices: occupancyDevices,
      icon: Users
    });
  }
  if (iaqDevices.length > 0) {
    visibleCategories.push({
      category: 'iaq',
      title: 'IAQ Sensors',
      devices: iaqDevices,
      icon: WindIcon
    });
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading devices...</div>
        </div>
      </div>
    );
  }

  const CategorySection = ({ category, title, devices, icon: Icon }) => (
    <div className="mb-6 bg-white rounded-xl shadow-md">
      {/* Category Header */}
      <div
        className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 cursor-pointer rounded-xl"
        onClick={() => toggleCategoryExpanded(category)}
      >
        <div className="flex items-center gap-4">
          <Icon className="h-8 w-8 text-gray-700" />
          <div>
            <div className="font-medium text-gray-900 text-2xl">{title}</div>
            <div className="text-xl text-gray-500">{devices.length} devices</div>
          </div>
        </div>
        <ChevronRight className={`h-6 w-6 text-gray-700 transition-transform ${expandedCategory === category ? 'rotate-90' : ''}`} />
      </div>

      {/* Device List */}
      {expandedCategory === category && (
        <div className="border-t border-gray-100">
          {devices.map((device) => (
            <div key={device.id} className="border-b border-gray-100 last:border-b-0">
              {/* Device Row */}
              <div
                className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleDeviceExpanded(device.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  {getStatusIcon(device.status)}
                  
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-2xl">{device.name}</div>
                    <div className="text-xl text-gray-500">{device.area}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {expandedDevice === device.id ? (
                    <ChevronDown className="h-5 w-5 text-gray-700" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-700" />
                  )}
                </div>
              </div>

              {/* Expanded Device Content */}
              {expandedDevice === device.id && (
                <div className="px-6 pb-6 bg-gray-50 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-8 py-4">
                    <div>
                      <div className="text-xl text-gray-600 mb-1">Sensor Type</div>
                      <div className="font-medium text-gray-900 text-2xl">{device.sensorType}</div>
                    </div>
                    
                    <div>
                      <div className="text-xl text-gray-600 mb-1">Status</div>
                      <div className={`font-medium text-2xl ${getStatusColor(device.status)}`}>
                        {device.status}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xl text-gray-600 mb-1">Location</div>
                      <div className="font-medium text-gray-900 text-2xl">{device.location}</div>
                    </div>
                    
                    <div>
                      <div className="text-xl text-gray-600 mb-1">Area</div>
                      <div className="font-medium text-gray-900 text-2xl">{device.area}</div>
                    </div>
                    
                    <div>
                      <div className="text-xl text-gray-600 mb-1">Last Updated</div>
                      <div className="font-medium text-gray-900 text-2xl">{device.lastSeen}</div>
                    </div>
                  </div>

                  {/* COMMENTED OUT: Edit Button */}
                  {/*
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button 
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditDevice(device);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                  */}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
   <div className="p-6 min-h-screen" style={{ backgroundColor: 'rgba(191, 191, 191, 0.2' }}>
      <div className="max-w-full mx-auto">
        {/* Header Outside */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Devices</h1>
        
        {/* Search Bar - No Background */}
        <div className="mb-4">
          <div className="relative max-w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by device ID or Type or Location or Area"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white"
            />
          </div>
        </div>

        {/* Categories - Each with Separate Background */}
        <div>
          {visibleCategories.map(({ category, title, devices, icon }) => (
            <CategorySection
              key={category}
              category={category}
              title={title}
              devices={devices}
              icon={icon}
            />
          ))}
          
          {filteredDevices.length === 0 && !loading && (
            <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
              No devices found matching your search criteria.
            </div>
          )}
        </div>

        {/* COMMENTED OUT: Edit Device Modal */}
        {/*
        {editingDevice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-gray-900">Edit Device</h2>
                <button
                  onClick={handleCloseEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xl text-gray-700 mb-1">
                    Device ID
                  </label>
                  <input
                    type="text"
                    value={editingDevice.id}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xl text-gray-700 mb-1">
                    Sensor Type
                  </label>
                  <input
                    type="text"
                    value={editForm.sensorType}
                    onChange={(e) => handleFormChange('sensorType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xl text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => handleFormChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xl text-gray-700 mb-1">
                    Area
                  </label>
                  <input
                    type="text"
                    value={editForm.area}
                    onChange={(e) => handleFormChange('area', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={handleCloseEdit}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        */}
      </div>
    </div>
  );
};

export default DeviceManagement;