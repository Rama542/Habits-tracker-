import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import TimetablePage from "./pages/TimetablePage";
import CalendarPage from "./pages/CalendarPage";
import Navbar from "./components/Navbar";

function AppContent() {
  const location = useLocation();
  const showNavbar = !["/", "/auth"].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  console.log("App mounted");
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
