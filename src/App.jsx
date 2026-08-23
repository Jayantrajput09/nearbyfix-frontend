import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

import Technician from "./pages/Technician";
import TechnicianProfile from "./pages/TechnicianProfile";
import TechnicianOwnProfile from "./pages/TechnicianOwnProfile";

import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================================
            HOME / LANDING PAGE
        ================================= */}

        <Route
          path="/"
          element={<Home />}
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
            FORGOT PASSWORD
        ================================= */}

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* ================================
            RESET PASSWORD
        ================================= */}

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
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
            ADMIN
        ================================= */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
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

            Keep before /technician/:id
        ================================= */}

        <Route
          path="/technician/profile"
          element={<TechnicianOwnProfile />}
        />

        {/* ================================
            PUBLIC TECHNICIAN PROFILE
        ================================= */}

        <Route
          path="/technician/:id"
          element={<TechnicianProfile />}
        />

        {/* ================================
            FALLBACK
        ================================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;