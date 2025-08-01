const Header = () => {
  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-200 shadow">
      {/* Left side: Logo */}
      <img
        src="/logo192.png"
        alt="PCS Security Logo"
        className="h-10 w-auto" // Slightly increased for better visual presence
      />

      {/* Right side: (Optional - if you need something later) */}
      {/* You can add a nav menu, profile icon, etc., here if needed */}
    </header>
  );
};

export default Header;

