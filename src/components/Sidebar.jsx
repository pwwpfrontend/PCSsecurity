import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon,
  ChartBarIcon,
  CogIcon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
  MagnifyingGlassIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

const Sidebar = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: HomeIcon,
    },
    {
      name: 'Historical Data',
      path: '/historical-data',
      icon: ChartBarIcon,
    },
    {
      name: 'Device Management',
      path: '/device-management',
      icon: CogIcon,
    },
  ];

  const handleLogout = () => {
    // Clear any stored authentication tokens/data
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    // Navigate to login page
    navigate('/login');
    // Close sidebar
    setSidebarOpen(false);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Implement search functionality here
      console.log('Searching for:', searchQuery);
      // You can add actual search logic here
    }
  };

  // Add keyboard shortcut functionality
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Filter menu items based on search query
  const filteredMenuItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Always toggleable on all screen sizes with increased width */}
      <div
        className={`fixed left-0 top-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header with Logo and Close Button */}
        <div className="flex items-center justify-between p-4 ">
          <div className="flex items-center space-x-3">
            <img
              src="/logo192.png"
              alt="PCS Security"
              className="h-10 w-auto"
            />
            
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
            title="Close sidebar"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full pl-10 pr-16 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-0.5 text-xs text-gray-500 bg-gray-100 border border-gray-300 rounded">
              Ctrl+K
            </kbd>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="px-4 pb-4 flex-1">
          <ul className="space-y-2">
            {(searchQuery ? filteredMenuItems : menuItems).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    onClick={() => {
                      // Close sidebar after navigation on any screen size
                      setSidebarOpen(false);
                    }}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                    <span className="font-medium text-lg">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button at Bottom */}
        <div className="px-4 pb-4 mt-auto">
          <div className="border-t border-gray-200 pt-4">
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2 w-full text-left text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 text-red-500" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative">
        {/* Grey overlay when sidebar is open */}
        {sidebarOpen && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-30 z-30 transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Header with hamburger menu and logo */}
        <header className="flex justify-between items-center p-4 border-b border-gray-200 shadow bg-white relative z-40">
          {/* Left side: Hamburger menu (all screen sizes) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <svg 
              className="h-7 w-7" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M3 7H21" 
                stroke="#000000" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />
              <path 
                d="M3 12H21" 
                stroke="#000000" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />
              <path 
                d="M3 17H21" 
                stroke="#000000" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Center: Logo */}
          <div className="flex items-center justify-center flex-1">
            <img
              src="/logo192.png"
              alt="PCS Security Logo"
              className="h-10 w-auto"
            />
          </div>

          {/* Right side: Empty space for balance */}
          <div className="w-10"></div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Sidebar;


