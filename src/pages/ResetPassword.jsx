import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { resetPassword } from "../services/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!token) {
      setError(
        "Invalid password reset link."
      );
      return;
    }

    if (!form.password || !form.confirmPassword) {
      setError(
        "Please enter both password fields."
      );
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const data = await resetPassword(
        token,
        form.password,
        form.confirmPassword
      );

      if (!data?.success) {
        setError(
          data?.message ||
            "Password reset failed."
        );
        return;
      }

      setMessage(
        data.message ||
          "Password reset successfully."
      );

      // Redirect to login after short delay
      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 2000);

    } catch (err) {
      console.error(
        "RESET PASSWORD ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Password reset failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* LOGO */}

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
            Create a new password
          </p>

        </div>

        {/* CARD */}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">

          <h1 className="text-xl font-semibold mb-2">
            Reset Password
          </h1>

          <p className="text-slate-400 text-sm mb-6">
            Enter your new password below.
          </p>

          {/* SUCCESS */}

          {message && (
            <div className="mb-5 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {message}
              <div className="mt-1 text-xs">
                Redirecting to login...
              </div>
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* NEW PASSWORD */}

            <div>

              <label className="block mb-2 text-sm">
                New Password
              </label>

              <div className="relative">

                <input
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-blue-500 disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>

            {/* CONFIRM PASSWORD */}

            <div>

              <label className="block mb-2 text-sm">
                Confirm Password
              </label>

              <div className="relative">

                <input
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    form.confirmPassword
                  }
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-blue-500 disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>

            {/* RESET BUTTON */}

            <button
              type="submit"
              disabled={loading || !!message}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
            >
              {loading
                ? "Resetting..."
                : "Reset Password"}
            </button>

          </form>

          {/* LOGIN */}

          <p className="text-center text-slate-400 mt-6">

            Remember your password?{" "}

            <Link
              to="/login"
              className="text-blue-400 hover:underline"
            >
              Back to Login
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
};

export default ResetPassword;