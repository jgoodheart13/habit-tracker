// AppRouter.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import DailyViewPage from "./pages/DailyViewPage";

function getToken() {
  return localStorage.getItem("b2c_token");
}

function PrivateRoute({ children, ...rest }) {
  return getToken() ? children : <Navigate to="/auth" replace />;
}

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<LandingPage />} />
        <Route path="/" element={
          <PrivateRoute>
            <DailyViewPage />
          </PrivateRoute>
        } />
        {/* Catch-all: redirect to /auth if not logged in */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}
