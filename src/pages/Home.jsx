import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const slides = [
  {
    title: "Plumber",
    image:
      "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1600&q=85",
    tag: "Water • Pipes • Bathroom",
    color: "#0ea5e9",
  },
  {
    title: "Electrician",
    image:
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1600&q=85",
    tag: "Wiring • Power • Safety",
    color: "#f59e0b",
  },
  {
    title: "AC & Appliance",
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=85",
    tag: "AC • Fridge • Washing Machine",
    color: "#06b6d4",
  },
  {
    title: "Carpenter",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85",
    tag: "Furniture • Wood • Repair",
    color: "#8b5cf6",
  },
  {
    title: "Vehicle Mechanic",
    image:
      "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1600&q=85",
    tag: "Bike • Car • Roadside Help",
    color: "#ef4444",
  },
];

const services = [
  { icon: "🔧", name: "Plumbing", text: "Leaks, pipes & bathroom repair" },
  { icon: "⚡", name: "Electrical", text: "Wiring, switches & appliances" },
  { icon: "❄️", name: "AC Repair", text: "Cooling, servicing & installation" },
  { icon: "🚗", name: "Mechanic", text: "Vehicle repair & maintenance" },
  { icon: "🪚", name: "Carpentry", text: "Furniture & wood repair" },
  { icon: "🔩", name: "Appliances", text: "Home appliance repair" },
];

const Home = () => {
  const [current, setCurrent] = useState(0);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const activeSlide = slides[current];

  return (
    <div
      className={`min-h-screen overflow-hidden transition-all duration-700 ${
        dark
          ? "bg-slate-950 text-white"
          : "bg-slate-100 text-slate-900"
      }`}
    >
      {/* ================= BACKGROUND ================= */}

      <div className="fixed inset-0 -z-10 overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.title}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ${
              current === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover scale-110 animate-[slowZoom_12s_ease-in-out_infinite]"
            />

            <div
              className={`absolute inset-0 ${
                dark
                  ? "bg-slate-950/80"
                  : "bg-white/80"
              }`}
            />

            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(circle at 75% 30%, ${slide.color}, transparent 45%)`,
              }}
            />
          </div>
        ))}
      </div>

      {/* ================= NAVBAR ================= */}

      <nav
        className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
          dark
            ? "border-white/10 bg-slate-950/50"
            : "border-slate-300 bg-white/60"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-black sm:text-2xl"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
              style={{
                background: `linear-gradient(135deg, ${activeSlide.color}, #6366f1)`,
              }}
            >
              🔧
            </div>

            <span>
              Nearby
              <span style={{ color: activeSlide.color }}>
                Fix
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setDark(!dark)}
              className={`rounded-xl border px-3 py-2 text-lg transition hover:scale-105 ${
                dark
                  ? "border-white/20 bg-white/10"
                  : "border-slate-300 bg-white"
              }`}
            >
              {dark ? "☀️" : "🌙"}
            </button>

            <Link
              to="/login"
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition hover:scale-105 sm:px-5 ${
                dark
                  ? "border-white/20 bg-white/10 hover:bg-white/20"
                  : "border-slate-300 bg-white hover:bg-slate-100"
              }`}
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="rounded-xl px-3 py-2 text-sm font-bold text-white shadow-lg transition hover:scale-105 sm:px-5"
              style={{
                background: `linear-gradient(135deg, ${activeSlide.color}, #6366f1)`,
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="grid min-h-[680px] items-center gap-12 py-16 lg:grid-cols-2 lg:py-20">
          {/* LEFT */}

          <div className="relative z-10">
            <div
              className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-md ${
                dark
                  ? "border-white/20 bg-white/10"
                  : "border-white/50 bg-white/60"
              }`}
            >
              <span className="animate-pulse">●</span>
              Smart local services, one platform
            </div>

            <h1 className="text-4xl font-black leading-[1.05] sm:text-6xl lg:text-7xl">
              Your problem.
              <br />

              <span
                className="transition-colors duration-500"
                style={{ color: activeSlide.color }}
              >
                The right expert.
              </span>

              <br />
              One NearbyFix.
            </h1>

            <p
              className={`mt-7 max-w-xl text-base leading-7 sm:text-lg ${
                dark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              From a leaking pipe to a broken appliance, NearbyFix
              helps you connect with the right local service professional
              without wasting time searching everywhere.
            </p>

            {/* CURRENT SERVICE */}

            <div
              className={`mt-8 flex items-center gap-4 rounded-2xl border p-4 backdrop-blur-xl transition-all duration-500 ${
                dark
                  ? "border-white/15 bg-slate-900/40"
                  : "border-white/70 bg-white/60"
              }`}
            >
              <div
                className="h-3 w-3 rounded-full animate-pulse"
                style={{ backgroundColor: activeSlide.color }}
              />

              <div>
                <p className="text-xs uppercase tracking-[0.2em] opacity-60">
                  Now exploring
                </p>

                <h3 className="text-lg font-bold">
                  {activeSlide.title}
                </h3>

                <p className="text-sm opacity-70">
                  {activeSlide.tag}
                </p>
              </div>
            </div>

            {/* BUTTONS */}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/signup"
                className="rounded-2xl px-7 py-4 text-center font-bold text-white shadow-xl transition hover:-translate-y-1"
                style={{
                  background: `linear-gradient(135deg, ${activeSlide.color}, #6366f1)`,
                }}
              >
                Find a Service →
              </Link>

              <Link
                to="/login"
                className={`rounded-2xl border px-7 py-4 text-center font-bold backdrop-blur-xl transition hover:-translate-y-1 ${
                  dark
                    ? "border-white/20 bg-white/10"
                    : "border-white/70 bg-white/60"
                }`}
              >
                I am a Technician
              </Link>
            </div>

            {/* SLIDER DOTS */}

            <div className="mt-10 flex gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.title}
                  onClick={() => setCurrent(index)}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: current === index ? "35px" : "10px",
                    backgroundColor:
                      current === index
                        ? activeSlide.color
                        : dark
                        ? "#475569"
                        : "#94a3b8",
                  }}
                />
              ))}
            </div>
          </div>

          {/* RIGHT INTERACTIVE CARD */}

          <div className="relative">
            <div
              className="absolute -inset-10 rounded-full opacity-40 blur-3xl transition-all duration-700"
              style={{
                background: activeSlide.color,
              }}
            />

            <div
              className={`relative overflow-hidden rounded-[2rem] border p-3 shadow-2xl backdrop-blur-xl ${
                dark
                  ? "border-white/20 bg-slate-900/40"
                  : "border-white/70 bg-white/60"
              }`}
            >
              <div className="relative h-[420px] overflow-hidden rounded-[1.5rem] sm:h-[520px]">
                <img
                  src={activeSlide.image}
                  alt={activeSlide.title}
                  className="h-full w-full object-cover transition duration-700 hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <p className="text-sm font-semibold text-white/70">
                    FEATURED SERVICE
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-white sm:text-5xl">
                    {activeSlide.title}
                  </h2>

                  <p className="mt-2 text-white/70">
                    {activeSlide.tag}
                  </p>
                </div>
              </div>
            </div>

            {/* FLOATING BADGES */}

            <div
              className={`absolute -bottom-5 -left-2 rounded-2xl border p-4 shadow-xl backdrop-blur-xl sm:-left-8 ${
                dark
                  ? "border-white/20 bg-slate-900/80"
                  : "border-white bg-white/80"
              }`}
            >
              <p className="text-2xl">⚡</p>
              <p className="text-sm font-bold">
                Quick Service
              </p>
            </div>

            <div
              className={`absolute -right-2 top-10 rounded-2xl border p-4 shadow-xl backdrop-blur-xl sm:-right-8 ${
                dark
                  ? "border-white/20 bg-slate-900/80"
                  : "border-white bg-white/80"
              }`}
            >
              <p className="text-2xl">🤖</p>
              <p className="text-sm font-bold">
                AI Assisted
              </p>
            </div>
          </div>
        </section>

        {/* ================= SERVICES ================= */}

        <section className="py-20">
          <div className="mb-10 max-w-2xl">
            <p
              className="font-bold uppercase tracking-[0.25em]"
              style={{ color: activeSlide.color }}
            >
              Explore NearbyFix
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-5xl">
              Everyday problems.
              <br />
              One smart platform.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.name}
                to="/signup"
                className={`group rounded-3xl border p-6 transition duration-300 hover:-translate-y-2 ${
                  dark
                    ? "border-white/10 bg-white/5 hover:bg-white/10"
                    : "border-white/70 bg-white/60 hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="text-4xl">
                    {service.icon}
                  </div>

                  <span
                    className="text-xl transition-transform group-hover:translate-x-1"
                    style={{ color: activeSlide.color }}
                  >
                    →
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold">
                  {service.name}
                </h3>

                <p
                  className={`mt-2 text-sm ${
                    dark
                      ? "text-slate-400"
                      : "text-slate-600"
                  }`}
                >
                  {service.text}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ================= CTA ================= */}

        <section
          className="mb-16 overflow-hidden rounded-[2rem] p-8 sm:p-12 lg:p-16"
          style={{
            background: `linear-gradient(135deg, ${activeSlide.color}, #4f46e5, #9333ea)`,
          }}
        >
          <div className="max-w-3xl">
            <p className="text-sm font-bold tracking-[0.2em] text-white/70">
              THE FIX STARTS HERE
            </p>

            <h2 className="mt-4 text-3xl font-black text-white sm:text-5xl">
              Don't search everywhere.
              <br />
              Find the right help nearby.
            </h2>

            <p className="mt-5 max-w-xl text-white/80">
              Join NearbyFix and explore a smarter way to discover
              local service professionals.
            </p>

            <Link
              to="/signup"
              className="mt-8 inline-block rounded-2xl bg-white px-7 py-4 font-black text-slate-900 transition hover:scale-105"
            >
              Get Started Free →
            </Link>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}

      <footer
        className={`border-t px-4 py-10 text-center sm:px-6 ${
          dark
            ? "border-white/10 bg-slate-950/70"
            : "border-slate-300 bg-white/60"
        }`}
      >
        <div className="mx-auto max-w-7xl">
          <h3 className="text-xl font-black">
            Nearby
            <span style={{ color: activeSlide.color }}>
              Fix
            </span>
          </h3>

          <p
            className={`mt-3 text-sm ${
              dark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Built for everyday problems and the people who solve them.
          </p>

          <p className="mt-4 text-sm">
            <a
              href="mailto:jayantisworking1@gmail.com"
              className="font-semibold hover:underline"
              style={{ color: activeSlide.color }}
            >
              jayantisworking1@gmail.com
            </a>
          </p>

          <p
            className={`mt-6 text-xs ${
              dark ? "text-slate-500" : "text-slate-500"
            }`}
          >
            © 2026 NearbyFix • Local problems. Smarter solutions.
          </p>
        </div>
      </footer>

      {/* ================= ANIMATION ================= */}

      <style>
        {`
          @keyframes slowZoom {
            0%, 100% {
              transform: scale(1.05);
            }

            50% {
              transform: scale(1.18);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Home;