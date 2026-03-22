import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import SplashScreen from "./pages/SplashScreen";
import Login from "./pages/Login";
import WelcomePage from "./pages/WelcomePage";
import Dashboard from "./pages/Dashboard";
import MedicineForm from "./pages/MedicineForm";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Settings from "./pages/Settings";
import BillGenerator from "./pages/BillGenerator";
import SalesReport from "./pages/SalesReport";
import ProtectedRoute from "./components/ProtectedRoute";
import "bootstrap/dist/css/bootstrap.min.css";

// Main App Component
function App() {
  // Apply saved dark mode preference on startup
  useEffect(() => {
    if (localStorage.getItem("darkMode") === "true") {
      document.body.classList.add("dark");
    }
  }, []);
  return (
    <Router>
      <Routes>
        {/* Splash screen is the entry point */}
        <Route path="/" element={<SplashScreen />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Welcome page (protected) */}
        <Route
          path="/welcome"
          element={
            <ProtectedRoute>
              <WelcomePage />
            </ProtectedRoute>
          }
        />

        {/* Protected pages */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicine"
          element={
            <ProtectedRoute>
              <MedicineForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bill"
          element={
            <ProtectedRoute>
              <BillGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <SalesReport />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;