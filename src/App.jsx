import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

import Technician from "./pages/Technician";
import TechnicianProfile from "./pages/TechnicianProfile";
import TechnicianOwnProfile from "./pages/TechnicianOwnProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================================
            HOME
        ================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* ================================
            AUTH
        ================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* ================================
            CUSTOMER
        ================================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* ================================
            TECHNICIAN DASHBOARD
        ================================= */}

        <Route
          path="/technician"
          element={<Technician />}
        />

        {/* ================================
            TECHNICIAN OWN PROFILE

            IMPORTANT:
            This must come before /technician/:id
        ================================= */}

        <Route
          path="/technician/profile"
          element={
            <TechnicianOwnProfile />
          }
        />

        {/* ================================
            PUBLIC TECHNICIAN PROFILE
        ================================= */}

        <Route
          path="/technician/:id"
          element={
            <TechnicianProfile />
          }
        />

        {/* ================================
            FALLBACK
        ================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;