import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PCSLayout from "./PCSLayout";
import Dashboard from "./components/Dashboard";
import HistoricalData from "./components/HistoricalData";
import DeviceManagement from "./components/DeviceManagement";
import PCSLogin from "./components/Login";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Login route without sidebar/header */}
        <Route path="/login" element={<PCSLogin />} />

        {/* Root: go to dashboard if logged in, otherwise to login */}
        <Route
          path="/"
          element={
            <Navigate
              to={localStorage.getItem("user") ? "/dashboard" : "/login"}
              replace
            />
          }
        />
        
        {/* Protected routes with sidebar layout */}
        <Route path="/*" element={
          <ProtectedRoute>
            <PCSLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/historical-data" element={<HistoricalData />} />
                <Route path="/device-management" element={<DeviceManagement />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </PCSLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;