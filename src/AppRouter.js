// AppRouter.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import DailyViewPage from "./pages/DailyViewPage";

function PrivateRoute({ children, ...rest }) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);
  if (isLoading) return null;
  return isAuthenticated ? children : null;
}

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DailyViewPage />
            </PrivateRoute>
          }
        />
        {/* Optionally add other routes here */}
      </Routes>
    </Router>
  );
}
