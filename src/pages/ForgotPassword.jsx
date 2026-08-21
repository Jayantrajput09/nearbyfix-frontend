import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      const data = await forgotPassword(cleanEmail);

      if (data?.success) {
        setMessage(
          data.message ||
            "If an account exists with this email, a password reset link has been sent."
        );
      } else {
        setError(
          data?.message ||
            "Unable to send password reset link."
        );
      }
    } catch (err) {
      console.error(
        "FORGOT PASSWORD ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to process your request."
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
            Reset your password
          </p>

        </div>

        {/* CARD */}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">

          <h1 className="text-xl font-semibold mb-2">
            Forgot Password?
          </h1>

          <p className="text-slate-400 text-sm mb-6">
            Enter your registered email address and
            we'll send you a password reset link.
          </p>

          {/* SUCCESS */}

          {message && (
            <div className="mb-5 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {message}
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

            {/* EMAIL */}

            <div>

              <label className="block mb-2 text-sm">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-blue-500 disabled:opacity-50"
              />

            </div>

            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
            >
              {loading
                ? "Sending..."
                : "Send Reset Link"}
            </button>

          </form>

          {/* BACK TO LOGIN */}

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

export default ForgotPassword;