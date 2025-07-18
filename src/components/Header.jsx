import React from "react";

const Header = () => {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold text-blue-600">PCS Security</h1>
      </div>
      
    </header>
  );
};

export default Header;