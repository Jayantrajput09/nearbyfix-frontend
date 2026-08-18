import { useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [location, setLocation] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        setLocation(
          `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        );

        localStorage.setItem(
          "nearbyfix_location",
          JSON.stringify({
            latitude,
            longitude,
          })
        );

        setLoadingLocation(false);
      },
      (error) => {
        setLoadingLocation(false);

        if (error.code === error.PERMISSION_DENIED) {
          alert("Please allow location permission to use this feature.");
        } else {
          alert("Unable to get your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">

        <Link to="/" className="text-2xl font-bold">
          Nearby<span className="text-blue-400">Fix</span>
        </Link>

        <div className="flex items-center gap-3">

          <button
            onClick={getLocation}
            disabled={loadingLocation}
            className="px-5 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition"
          >
            {loadingLocation ? "Getting location..." : "📍 Location"}
          </button>

          <Link
            to="/login"
            className="px-5 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
          >
            Register
          </Link>

        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-24">

        <div className="max-w-3xl">

          <p className="text-blue-400 font-semibold mb-4">
            AI POWERED LOCAL SERVICE PLATFORM
          </p>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Find the right
            <span className="text-blue-400"> technician </span>
            for your problem.
          </h1>

          <p className="mt-6 text-lg text-slate-400">
            Describe your repair problem and let NearbyFix's AI
            help diagnose the issue and connect you with the right
            local technician.
          </p>

          <div className="flex gap-4 mt-8">

            <Link
              to="/signup"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              Get Started
            </Link>

            <button
              onClick={getLocation}
              className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10"
            >
              📍 Find Technicians Near Me
            </button>

          </div>

          {location && (
            <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <p className="text-green-400 font-medium">
                ✓ Location detected
              </p>

              <p className="text-sm text-slate-400 mt-1">
                Coordinates: {location}
              </p>
            </div>
          )}

        </div>

        <div className="grid md:grid-cols-3 gap-5 mt-20">

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-3xl mb-4">🤖</div>

            <h3 className="text-xl font-semibold">
              AI Diagnosis
            </h3>

            <p className="text-slate-400 mt-2">
              Describe your problem and get intelligent suggestions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-3xl mb-4">🛠️</div>

            <h3 className="text-xl font-semibold">
              Find Technicians
            </h3>

            <p className="text-slate-400 mt-2">
              Find suitable technicians based on your problem.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-3xl mb-4">📍</div>

            <h3 className="text-xl font-semibold">
              Nearby Services
            </h3>

            <p className="text-slate-400 mt-2">
              Connect with service providers around your area.
            </p>
          </div>

        </div>

      </main>

    </div>
  );
};

export default Home;