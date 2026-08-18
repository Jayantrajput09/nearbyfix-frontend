import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.email || !form.password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      console.log("LOGIN RESPONSE:", data);
      console.log("LOGIN ROLE:", data?.user?.role);

      if (!data?.success || !data?.token || !data?.user) {
        setError(
          data?.message || "Login failed."
        );
        return;
      }

      // =====================================
      // SAVE TOKEN
      // =====================================

      localStorage.setItem(
        "nearbyfix_token",
        data.token
      );

      // =====================================
      // SAVE USER
      // =====================================

      localStorage.setItem(
        "nearbyfix_user",
        JSON.stringify(data.user)
      );

      console.log(
        "TOKEN SAVED:",
        !!localStorage.getItem(
          "nearbyfix_token"
        )
      );

      console.log(
        "USER SAVED:",
        localStorage.getItem(
          "nearbyfix_user"
        )
      );

      // =====================================
      // ROLE BASED REDIRECT
      // =====================================

      const role = data.user.role;

      if (role === "technician") {
        console.log(
          "TECHNICIAN LOGIN -> /technician"
        );

        navigate("/technician", {
          replace: true,
        });

        return;
      }

      if (role === "admin") {
        console.log(
          "ADMIN LOGIN -> /admin"
        );

        navigate("/admin", {
          replace: true,
        });

        return;
      }

      console.log(
        "USER LOGIN -> /dashboard"
      );

      navigate("/dashboard", {
        replace: true,
      });

    } catch (err) {
      console.error(
        "LOGIN ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Invalid email or password."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        <div className="text-center mb-8">

          <Link
            to="/"
            className="text-3xl font-bold"
          >
            Nearby
            <span className="text-blue-400">
              Fix
            </span>
          </Link>

          <p className="text-slate-400 mt-2">
            Welcome back
          </p>

        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>

              <label className="block mb-2 text-sm">
                Email
              </label>

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-blue-500"
              />

            </div>

            <div>

              <label className="block mb-2 text-sm">
                Password
              </label>

              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-blue-500"
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

          <p className="text-center text-slate-400 mt-6">

            Don't have an account?{" "}

            <Link
              to="/signup"
              className="text-blue-400 hover:underline"
            >
              Create account
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
};

export default Login;