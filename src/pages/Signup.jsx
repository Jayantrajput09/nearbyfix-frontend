import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // SHOW / HIDE PASSWORD
  const [showPassword, setShowPassword] =
    useState(false);

  // SHOW / HIDE CONFIRM PASSWORD
  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  // =====================================
  // INPUT CHANGE
  // =====================================

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // =====================================
  // SUBMIT
  // =====================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError(
        "Please fill all required fields."
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

    if (form.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const data = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
      });

      console.log(
        "REGISTER RESPONSE:",
        data
      );

      if (
        !data.success ||
        !data.token ||
        !data.user
      ) {
        setError(
          data.message ||
          "Registration failed."
        );
        return;
      }

      // SAVE TOKEN
      localStorage.setItem(
        "nearbyfix_token",
        data.token
      );

      // SAVE USER
      localStorage.setItem(
        "nearbyfix_user",
        JSON.stringify(data.user)
      );

      console.log(
        "REGISTERED ROLE:",
        data.user.role
      );

      setSuccess(
        "Account created successfully!"
      );

      // ROLE BASED REDIRECT
      setTimeout(() => {
        if (
          data.user.role ===
          "technician"
        ) {
          navigate("/technician");
        } else {
          navigate("/dashboard");
        }
      }, 500);

    } catch (err) {
      console.error(
        "REGISTER ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">

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
            Create your NearbyFix account
          </p>

        </div>

        {/* CARD */}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* NAME */}

            <div>

              <label className="block mb-2 text-sm">
                Full Name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                type="text"
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-blue-500"
              />

            </div>

            {/* EMAIL */}

            <div>

              <label className="block mb-2 text-sm">
                Email
              </label>

              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-blue-500"
              />

            </div>

            {/* PHONE */}

            <div>

              <label className="block mb-2 text-sm">
                Phone
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                type="tel"
                placeholder="Enter phone number"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-blue-500"
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label className="block mb-2 text-sm">
                Password
              </label>

              <div className="relative">

                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create password"
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-blue-500"
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
                  {showPassword ? "🙈" : "👁️"}
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
                  value={
                    form.confirmPassword
                  }
                  onChange={handleChange}
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 pr-12 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-blue-500"
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

            {/* ROLE */}

            <div>

              <label className="block mb-2 text-sm">
                I am
              </label>

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 outline-none"
              >

                <option value="user">
                  Customer
                </option>

                <option value="technician">
                  Technician
                </option>

              </select>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          <p className="text-center text-slate-400 mt-6">

            Already have an account?{" "}

            <Link
              to="/login"
              className="text-blue-400 hover:underline"
            >
              Login
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
};

export default Signup;