import React, { useState } from 'react';
import PCSSidebar from './components/Sidebar';

const PCSLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    // This will be handled by the sidebar component
    console.log('Logout triggered from layout');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Component */}
      <PCSSidebar 
        isSidebarOpen={sidebarOpen} 
        setIsSidebarOpen={setSidebarOpen}
        logout={handleLogout}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header with hamburger menu and logo */}
        <header className="flex justify-between items-center p-4 border-b border-gray-200 shadow-sm bg-white relative z-10">
          {/* Left side: Hamburger menu */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <svg 
              className="h-6 w-6" 
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

          {/* Center: Logo and Title */}
          <div className="flex items-center justify-center flex-1">
            <img
              src="/logo192.png"
              alt="PCS Security Logo"
              className="h-10 w-auto mr-2"
            />
          </div>

          {/* Right side: Empty space for balance */}
          <div className="w-10"></div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PCSLayout;