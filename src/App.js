import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import HistoricalData from "./components/HistoricalData";
import DeviceManagement from "./components/DeviceManagement";
import Login from "./components/Login";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login route without sidebar */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes with sidebar layout */}
        <Route path="/*" element={
          <Sidebar>
            <Routes>
              {/* Redirect root (/) directly to /dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/historical-data" element={<HistoricalData />} />
              <Route path="/device-management" element={<DeviceManagement />} />
            </Routes>
          </Sidebar>
        } />
      </Routes>
    </Router>
  );
}

export default App;
