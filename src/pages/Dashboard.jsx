import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import LiveLocation from "../components/LiveLocation";

import {
  getProfile,
  getMyRequests,
  createServiceRequest,
  searchTechnicians,
  getAISuggestion,
  updateProfile,
  createReview,
  getMyReviews,
} from "../services/api";

// =====================================================
// SERVICES
// =====================================================

const SERVICES = [
  {
    id: "electrician",
    name: "Electrician",
    icon: "⚡",
    color:
      "from-yellow-400 to-orange-500",
    description:
      "Lights, fans, switches & wiring",
  },

  {
    id: "plumber",
    name: "Plumber",
    icon: "🔧",
    color:
      "from-cyan-400 to-blue-500",
    description:
      "Pipes, taps, leaks & drainage",
  },

  {
    id: "ac-repair",
    name: "AC Repair",
    icon: "❄️",
    color:
      "from-cyan-300 to-indigo-500",
    description:
      "Cooling, servicing & installation",
  },

  {
    id: "carpenter",
    name: "Carpenter",
    icon: "🪚",
    color:
      "from-orange-400 to-red-500",
    description:
      "Furniture, doors & woodwork",
  },

  {
    id: "mechanic",
    name: "Mechanic",
    icon: "🚗",
    color:
      "from-red-400 to-pink-500",
    description:
      "Vehicle repair & maintenance",
  },

  {
    id: "appliance-repair",
    name: "Appliance Repair",
    icon: "🔌",
    color:
      "from-violet-400 to-purple-600",
    description:
      "Fridge, washing machine & appliances",
  },
];

// =====================================================
// STATUS
// =====================================================

const STATUS_STYLES = {
  pending:
    "bg-amber-400/10 text-amber-300 border-amber-400/20",

  accepted:
    "bg-blue-400/10 text-blue-300 border-blue-400/20",

  "in-progress":
    "bg-purple-400/10 text-purple-300 border-purple-400/20",

  completed:
    "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",

  cancelled:
    "bg-red-400/10 text-red-300 border-red-400/20",
};

// =====================================================
// THEMES
// =====================================================

const THEMES = {
  blue: {
    primary: "#3b82f6",
    primaryDark: "#2563eb",
    primaryLight: "#60a5fa",
    primaryBg:
      "rgba(59,130,246,0.08)",
    primaryBorder:
      "rgba(59,130,246,0.2)",
    primaryText: "#93c5fd",
  },

  purple: {
    primary: "#8b5cf6",
    primaryDark: "#7c3aed",
    primaryLight: "#a78bfa",
    primaryBg:
      "rgba(139,92,246,0.08)",
    primaryBorder:
      "rgba(139,92,246,0.2)",
    primaryText: "#c4b5fd",
  },

  green: {
    primary: "#22c55e",
    primaryDark: "#16a34a",
    primaryLight: "#4ade80",
    primaryBg:
      "rgba(34,197,94,0.08)",
    primaryBorder:
      "rgba(34,197,94,0.2)",
    primaryText: "#86efac",
  },

  orange: {
    primary: "#f97316",
    primaryDark: "#ea580c",
    primaryLight: "#fb923c",
    primaryBg:
      "rgba(249,115,22,0.08)",
    primaryBorder:
      "rgba(249,115,22,0.2)",
    primaryText: "#fdba74",
  },

  red: {
    primary: "#ef4444",
    primaryDark: "#dc2626",
    primaryLight: "#f87171",
    primaryBg:
      "rgba(239,68,68,0.08)",
    primaryBorder:
      "rgba(239,68,68,0.2)",
    primaryText: "#fca5a5",
  },

  pink: {
    primary: "#ec4899",
    primaryDark: "#db2777",
    primaryLight: "#f472b6",
    primaryBg:
      "rgba(236,72,153,0.08)",
    primaryBorder:
      "rgba(236,72,153,0.2)",
    primaryText: "#f9a8d4",
  },

  teal: {
    primary: "#14b8a6",
    primaryDark: "#0d9488",
    primaryLight: "#2dd4bf",
    primaryBg:
      "rgba(20,184,166,0.08)",
    primaryBorder:
      "rgba(20,184,166,0.2)",
    primaryText: "#5eead4",
  },

  indigo: {
    primary: "#6366f1",
    primaryDark: "#4f46e5",
    primaryLight: "#818cf8",
    primaryBg:
      "rgba(99,102,241,0.08)",
    primaryBorder:
      "rgba(99,102,241,0.2)",
    primaryText: "#a5b4fc",
  },
};

// =====================================================
// DASHBOARD
// =====================================================

function Dashboard() {
  const navigate = useNavigate();

  // =====================================================
  // THEME
  // =====================================================

  const [themeName, setThemeName] =
    useState(() => {
      return (
        localStorage.getItem(
          "nearbyfix_theme"
        ) || "blue"
      );
    });
    const [showThemePicker, setShowThemePicker] =
  useState(false);

  useEffect(() => {
    const theme =
      THEMES[themeName];

    const root =
      document.documentElement;

    Object.entries(theme).forEach(
      ([key, value]) => {
        root.style.setProperty(
          `--theme-${key}`,
          value
        );
      }
    );

    localStorage.setItem(
      "nearbyfix_theme",
      themeName
    );
  }, [themeName]);

  // =====================================================
  // USER
  // =====================================================

  const [user, setUser] =
    useState(null);

  // =====================================================
  // LIVE LOCATION
  // =====================================================

  const [liveLocation, setLiveLocation] =
    useState(null);

  // =====================================================
  // REQUESTS
  // =====================================================

  const [requests, setRequests] =
    useState([]);

      // =====================================================
  // REVIEWS
  // =====================================================

  const [reviewOpen, setReviewOpen] =
    useState(false);

  const [selectedRequestForReview, setSelectedRequestForReview] =
    useState(null);

  const [reviewRating, setReviewRating] =
    useState(0);

  const [reviewComment, setReviewComment] =
    useState("");

  const [reviewSubmitting, setReviewSubmitting] =
    useState(false);

  const [reviewedRequestIds, setReviewedRequestIds] =
    useState(new Set());

  const [selectedService, setSelectedService] =
    useState(null);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  // =====================================================
  // SEARCH
  // =====================================================

  const [search, setSearch] =
    useState("");

  const [technicians, setTechnicians] =
    useState([]);

  const [searching, setSearching] =
    useState(false);

  const [showSearchResults, setShowSearchResults] =
    useState(false);

  // =====================================================
  // AI
  // =====================================================

  const [aiOpen, setAiOpen] =
    useState(false);

  const [aiMessage, setAiMessage] =
    useState("");

  const [aiLoading, setAiLoading] =
    useState(false);

  const [aiMessages, setAiMessages] =
    useState([
      {
        role: "ai",
        text:
          "Namaste 👋 Main NearbyFix AI hoon. Aap apni problem Hinglish ya English mein bata sakte ho. Main bataunga ki kaunsa technician best rahega.",
      },
    ]);

  // =====================================================
  // GENERAL
  // =====================================================

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = useCallback(() => {
    localStorage.removeItem(
      "nearbyfix_token"
    );

    localStorage.removeItem(
      "nearbyfix_user"
    );

    navigate("/login", {
      replace: true,
    });
  }, [navigate]);

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  const loadDashboard =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem(
            "nearbyfix_token"
          );

        if (!token) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        const profile =
          await getProfile();

        if (!profile?.user) {
          throw new Error(
            "User profile could not be loaded."
          );
        }

        setUser(profile.user);

        const requestResponse =
          await getMyRequests();

        setRequests(
          requestResponse?.requests ||
            []
        );

                // =================================================
        // LOAD MY REVIEWS
        // =================================================

        try {
          const reviewResponse =
            await getMyReviews();

          const myReviews =
            reviewResponse?.reviews || [];

          setReviewedRequestIds(
            new Set(
              myReviews
                .map(
                  (review) =>
                    review.serviceRequestId?._id ||
                    review.serviceRequestId
                )
                .filter(Boolean)
                .map(String)
            )
          );
        } catch (reviewErr) {
          console.warn(
            "REVIEWS LOAD ERROR:",
            reviewErr
          );

          setReviewedRequestIds(
            new Set()
          );
        }
      } catch (err) {
        console.error(
          "DASHBOARD ERROR:",
          err
        );

        if (
          err.response?.status ===
          401
        ) {
          logout();
          return;
        }

        setError(
          err.response?.data
            ?.message ||
            err.message ||
            "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    }, [navigate, logout]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // =====================================================
  // LOCATION CALLBACK
  // =====================================================

  const handleLocationChange =
    useCallback(
      (location) => {
        setLiveLocation(
          location
        );

        // Immediately keep frontend user state
        // synchronized with GPS.
        setUser((prev) => {
          if (!prev) return prev;

          return {
            ...prev,

            location: {
              ...(prev.location || {}),

              coordinates: {
                lat: location.lat,
                lng: location.lng,
              },
            },
          };
        });
      },
      []
    );

  // =====================================================
  // SEARCH
  // =====================================================

  useEffect(() => {
    const timer =
      setTimeout(() => {
        performSearch(search);
      }, 500);

    return () =>
      clearTimeout(timer);
  }, [search]);

  const performSearch =
    async (value) => {
      const query =
        value.trim();

      if (!query) {
        setTechnicians([]);
        setShowSearchResults(false);
        return;
      }

      try {
        setSearching(true);
        setShowSearchResults(true);

        const response =
          await searchTechnicians(
            query
          );

        console.log(
          "TECHNICIAN SEARCH RESPONSE:",
          response
        );

        setTechnicians(
          response?.technicians ||
            []
        );
      } catch (err) {
        console.error(
          "TECHNICIAN SEARCH ERROR:",
          err
        );

        setTechnicians([]);
      } finally {
        setSearching(false);
      }
    };

  // =====================================================
  // SELECT SERVICE
  // =====================================================

  const selectService =
    (service) => {
      setSelectedService(
        service
      );

      setTitle(
        `${service.name} required`
      );

      setDescription("");

      setSuccess("");
      setError("");

      setTimeout(() => {
        document
          .getElementById(
            "request-form"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }, 100);
    };

  // =====================================================
  // CREATE REQUEST
  // =====================================================

  const handleCreateRequest =
    async (e) => {
      e.preventDefault();

      if (!selectedService) {
        setError(
          "Please select a service."
        );
        return;
      }

      if (!title.trim()) {
        setError(
          "Please enter a problem title."
        );
        return;
      }

      if (!description.trim()) {
        setError(
          "Please describe your problem."
        );
        return;
      }

      try {
        setSubmitting(true);
        setError("");
        setSuccess("");

        // =================================================
        // GET LATEST GPS LOCATION
        // =================================================

        let currentLocation =
          liveLocation;

        if (!currentLocation) {
          if (
            !navigator.geolocation
          ) {
            throw new Error(
              "Your browser does not support location."
            );
          }

          currentLocation =
            await new Promise(
              (
                resolve,
                reject
              ) => {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    resolve({
                      lat: Number(
                        position.coords
                          .latitude
                      ),

                      lng: Number(
                        position.coords
                          .longitude
                      ),

                      accuracy:
                        Number(
                          position.coords
                            .accuracy
                        ),
                    });
                  },

                  reject,

                  {
                    enableHighAccuracy: true,
                    timeout: 20000,
                    maximumAge: 0,
                  }
                );
              }
            );

          setLiveLocation(
            currentLocation
          );
        }

        // =================================================
        // VALIDATE GPS
        // =================================================

        if (
          currentLocation.lat ===
            null ||
          currentLocation.lat ===
            undefined ||
          currentLocation.lng ===
            null ||
          currentLocation.lng ===
            undefined
        ) {
          throw new Error(
            "Valid GPS coordinates could not be detected."
          );
        }

        // =================================================
        // SAVE LOCATION TO PROFILE
        // =================================================

        await updateProfile({
          location: {
            coordinates: {
              lat: Number(
                currentLocation.lat
              ),

              lng: Number(
                currentLocation.lng
              ),
            },
          },
        });

        // =================================================
        // UPDATE FRONTEND USER
        // =================================================

        setUser((prev) => ({
          ...prev,

          location: {
            ...(prev?.location ||
              {}),

            coordinates: {
              lat: Number(
                currentLocation.lat
              ),

              lng: Number(
                currentLocation.lng
              ),
            },
          },
        }));

        // =================================================
        // EXISTING PROFILE LOCATION
        // =================================================

        const profileLocation =
          user?.location || {};

        // =================================================
        // REQUEST DATA
        // =================================================

        const requestData = {
          serviceType:
            selectedService.id,

          title:
            title.trim(),

          description:
            description.trim(),

          location: {
            address:
              profileLocation.address ||
              "",

            city:
              profileLocation.city ||
              "",

            state:
              profileLocation.state ||
              "",

            pincode:
              profileLocation.pincode ||
              "",

            coordinates: {
              lat: Number(
                currentLocation.lat
              ),

              lng: Number(
                currentLocation.lng
              ),
            },
          },
        };

        console.log(
          "REQUEST LOCATION:",
          requestData.location
        );

        // =================================================
        // CREATE REQUEST
        // =================================================

        const response =
          await createServiceRequest(
            requestData
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Request creation failed."
          );
        }

        // =================================================
        // UPDATE REQUEST LIST
        // =================================================

        if (
          response.request
        ) {
          setRequests(
            (prev) => [
              response.request,
              ...prev,
            ]
          );
        } else {
          const refreshed =
            await getMyRequests();

          setRequests(
            refreshed?.requests ||
              []
          );
        }

        // =================================================
        // RESET
        // =================================================

        setSelectedService(
          null
        );

        setTitle("");
        setDescription("");

        setSuccess(
          "Service request created successfully! 🎉"
        );

        setTimeout(() => {
          document
            .getElementById(
              "my-requests"
            )
            ?.scrollIntoView({
              behavior: "smooth",
            });
        }, 400);
      } catch (err) {
        console.error(
          "CREATE REQUEST ERROR:",
          err
        );

        if (
          err.response?.status ===
          401
        ) {
          logout();
          return;
        }

        if (
          err.code === 1
        ) {
          setError(
            "Location permission denied. Please allow location access."
          );
        } else if (
          err.code === 2
        ) {
          setError(
            "Unable to detect your location."
          );
        } else if (
          err.code === 3
        ) {
          setError(
            "Location request timed out. Please try again."
          );
        } else {
          setError(
            err.response?.data
              ?.message ||
              err.message ||
              "Failed to create request."
          );
        }
      } finally {
        setSubmitting(false);
      }
    };

  // =====================================================
  // AI
  // =====================================================

  const sendAIMessage =
    async (
      customMessage = null
    ) => {
      const message = (
        customMessage ||
        aiMessage
      ).trim();

      if (!message) return;

      setAiMessages(
        (prev) => [
          ...prev,
          {
            role: "user",
            text: message,
          },
        ]
      );

      setAiMessage("");
      setAiLoading(true);

      try {
        const response =
          await getAISuggestion(
            message
          );

        const answer =
          response?.reply ||
          response?.suggestion ||
          response?.message ||
          response?.answer ||
          "Sorry, abhi AI response nahi mil pa raha.";

        setAiMessages(
          (prev) => [
            ...prev,
            {
              role: "ai",
              text: answer,
            },
          ]
        );

        // If backend suggests a service,
        // automatically select it.
        if (
          response?.suggestedService
        ) {
          const suggested =
            SERVICES.find(
              (service) =>
                service.id ===
                response.suggestedService
            );

          if (suggested) {
            setSelectedService(
              suggested
            );

            setTitle(
              `${suggested.name} required`
            );

            setAiOpen(false);

            setTimeout(() => {
              document
                .getElementById(
                  "request-form"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                });
            }, 300);
          }
        }
      } catch (err) {
        console.error(
          "AI ERROR:",
          err
        );

        setAiMessages(
          (prev) => [
            ...prev,
            {
              role: "ai",
              text:
                "AI service abhi available nahi hai. Aap directly Electrician, Plumber, AC Repair jaise service select kar sakte ho.",
            },
          ]
        );
      } finally {
        setAiLoading(false);
      }
    };

      // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  const handleSubmitReview =
    async () => {
      if (!selectedRequestForReview) {
        return;
      }

      if (!reviewRating) {
        setError(
          "Please select a rating."
        );
        return;
      }

      if (!reviewComment.trim()) {
        setError(
          "Please write a review."
        );
        return;
      }

      const technicianId =
        selectedRequestForReview
          ?.technician?._id ||
        selectedRequestForReview
          ?.technician;

      if (!technicianId) {
        setError(
          "Technician information not found."
        );
        return;
      }

      try {
        setReviewSubmitting(true);
        setError("");
        setSuccess("");

        const response =
          await createReview({
            serviceRequestId:
              selectedRequestForReview._id,

            technicianId,

            rating: reviewRating,

            comment:
              reviewComment.trim(),
          });

        console.log(
          "CREATE REVIEW RESPONSE:",
          response
        );

        // Mark this request as reviewed
        setReviewedRequestIds(
          (prev) => {
            const updated =
              new Set(prev);

            updated.add(
              String(
                selectedRequestForReview._id
              )
            );

            return updated;
          }
        );

        setReviewOpen(false);
        setSelectedRequestForReview(
          null
        );
        setReviewRating(0);
        setReviewComment("");

        setSuccess(
          "Review submitted successfully! ⭐ Thank you."
        );
      } catch (err) {
        console.error(
          "CREATE REVIEW ERROR:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            err.message ||
            "Failed to submit review."
        );
      } finally {
        setReviewSubmitting(false);
      }
    };

  // =====================================================
  // HELPERS
  // =====================================================

  const getService =
    (serviceType) =>
      SERVICES.find(
        (service) =>
          service.id ===
          serviceType
      );

  const formatDate =
    (date) => {
      if (!date) return "";

      try {
        return new Date(
          date
        ).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );
      } catch {
        return "";
      }
    };

  const getTechnicianPhoto =
    (technician) => {
      return (
        technician?.photo ||
        technician?.profilePhoto ||
        technician?.avatar ||
        technician?.image ||
        technician?.user?.photo ||
        technician?.user
          ?.profilePhoto ||
        technician?.user?.avatar ||
        null
      );
    };

  const getTechnicianSkills =
    (technician) => {
      if (
        Array.isArray(
          technician?.skills
        )
      ) {
        return technician.skills
          .map((skill) => {
            if (
              typeof skill ===
              "string"
            ) {
              return skill;
            }

            return (
              skill?.name ||
              skill?.title ||
              skill?.service ||
              ""
            );
          })
          .filter(Boolean);
      }

      if (
        typeof technician?.skills ===
        "string"
      ) {
        return [
          technician.skills,
        ];
      }

      if (
        technician?.serviceType
      ) {
        return [
          technician.serviceType,
        ];
      }

      return [
        "Professional Technician",
      ];
    };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07111f] text-white flex items-center justify-center px-5">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center text-2xl animate-pulse">
            🛠️
          </div>

          <p className="mt-4 text-slate-400">
            Loading NearbyFix...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div className="min-h-screen bg-[#07111f] text-white">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#07111f]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8 py-3 sm:py-4 flex items-center justify-between">

          <button
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
            className="text-xl sm:text-2xl font-black tracking-tight"
          >
            Nearby
            <span className="text-[var(--theme-primary)]">
              Fix
            </span>
          </button>

          <div className="flex items-center gap-2">

            {/* THEME */}

<div className="relative">
  <button
    type="button"
    onClick={() =>
      setShowThemePicker(
        (prev) => !prev
      )
    }
    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all ${
      showThemePicker
        ? "bg-white/10 border-white/20 scale-105"
        : "bg-white/[0.04] border-white/10"
    }`}
    aria-label="Change theme"
    aria-expanded={showThemePicker}
  >
    🎨
  </button>

  {showThemePicker && (
    <div className="absolute right-0 top-full mt-2 w-48 p-3 rounded-2xl bg-[#0b1728] border border-white/10 shadow-2xl z-[100]">

      <p className="text-xs text-slate-500 mb-3 px-1">
        Choose theme
      </p>

      <div className="grid grid-cols-4 gap-3">
        {Object.keys(THEMES).map(
          (name) => (
            <button
              type="button"
              key={name}
              onClick={() => {
                setThemeName(name);
                setShowThemePicker(false);
              }}
              aria-label={`Select ${name} theme`}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                themeName === name
                  ? "border-white scale-110 shadow-lg"
                  : "border-transparent hover:scale-105"
              }`}
              style={{
                backgroundColor:
                  THEMES[name].primary,
              }}
            />
          )
        )}
      </div>
    </div>
  )}
</div>

            {/* AI */}

            <button
              onClick={() =>
                setAiOpen(true)
              }
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--theme-primaryBg)] border border-[var(--theme-primaryBorder)] text-[var(--theme-primaryText)]"
            >
              🤖 Ask AI
            </button>

            {/* PROFILE */}

            <button
              onClick={() =>
                navigate(
                  "/profile"
                )
              }
              className="px-3 sm:px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10"
            >
              👤
            </button>

            {/* LOGOUT */}

            <button
              onClick={logout}
              className="hidden sm:block px-4 py-2.5 rounded-xl text-red-300 bg-red-400/5 border border-red-400/10"
            >
              Logout
            </button>

          </div>
        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8 py-6 sm:py-8">

        {/* ALERT */}

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            {success}
          </div>
        )}

        {/* =================================================
            HERO
        ================================================= */}

        {!showSearchResults && (
          <section className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-[var(--theme-primary)]/[0.14] via-transparent to-purple-500/[0.08] p-6 sm:p-7 md:p-10">

            <div className="absolute -right-24 -top-24 w-72 h-72 bg-[var(--theme-primary)]/10 blur-3xl rounded-full" />

            <div className="relative max-w-4xl">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--theme-primaryBg)] border border-[var(--theme-primaryBorder)] text-[var(--theme-primaryText)] text-sm mb-5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />

                Nearby professionals available
              </div>

              <p className="text-[var(--theme-primaryText)] font-medium">
                Welcome back
              </p>

              <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mt-2 break-words">
                Hello,{" "}
                {user?.name ||
                  "there"}
                <span className="text-[var(--theme-primary)]">
                  .
                </span>
              </h1>

              <p className="text-slate-400 mt-4 text-base sm:text-lg">
                Ghar ki problem ho ya urgent repair,
                <br className="hidden md:block" />
                right professional ko easily find karo.
              </p>

              {/* SEARCH */}

              <div className="relative mt-8">
                <div className="flex items-center gap-3 rounded-2xl bg-[#0b1728] border border-white/10 px-4 sm:px-5 py-4 shadow-2xl">

                  <span className="text-xl">
                    🔎
                  </span>

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search technician, service or city..."
                    className="min-w-0 flex-1 bg-transparent outline-none text-white placeholder:text-slate-500"
                  />

                  {searching && (
                    <span className="hidden sm:block text-sm text-[var(--theme-primaryText)]">
                      Searching...
                    </span>
                  )}
                </div>
              </div>

            </div>
          </section>
        )}

        {/* =================================================
            SEARCH RESULTS
        ================================================= */}

        {showSearchResults && (
          <section className="min-h-[70vh]">

            <div className="rounded-[28px] border border-white/[0.08] bg-[#0b1728] p-4 sm:p-5 md:p-7">

              <div className="flex flex-col md:flex-row gap-4 items-center">

                <div className="flex items-center gap-3 flex-1 w-full">

                  <button
                    onClick={() => {
                      setSearch("");
                      setShowSearchResults(
                        false
                      );
                    }}
                    className="w-11 h-11 shrink-0 rounded-xl bg-white/[0.04] border border-white/10"
                  >
                    ←
                  </button>

                  <div className="flex items-center gap-3 flex-1 rounded-xl bg-[#07111f] border border-white/10 px-4 py-3">

                    <span>
                      🔎
                    </span>

                    <input
                      autoFocus
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search technician, service or city..."
                      className="min-w-0 flex-1 bg-transparent outline-none"
                    />

                    {searching && (
                      <span className="hidden sm:block text-xs text-[var(--theme-primaryText)]">
                        Searching...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-8 mb-5">

              <div>
                <h2 className="text-2xl md:text-3xl font-bold">
                  Technicians
                </h2>

                <p className="text-slate-500 mt-1">
                  {searching
                    ? "Finding professionals..."
                    : `${technicians.length} professional${
                        technicians.length !==
                        1
                          ? "s"
                          : ""
                      } found for "${search}"`}
                </p>
              </div>

              <button
                onClick={() => {
                  setSearch("");
                  setTechnicians([]);
                  setShowSearchResults(
                    false
                  );
                }}
                className="self-start px-4 py-2 rounded-xl border border-white/10 text-sm text-slate-400"
              >
                Clear
              </button>
            </div>

            {/* SEARCH LOADING */}

            {searching && (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">

                {[1, 2, 3].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-[24px] border border-white/10 bg-white/[0.025] p-6 animate-pulse"
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-white/10" />

                        <div className="flex-1">
                          <div className="h-5 bg-white/10 rounded w-2/3" />

                          <div className="h-4 bg-white/10 rounded w-1/2 mt-3" />

                          <div className="h-3 bg-white/10 rounded w-1/3 mt-3" />
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* NO RESULTS */}

            {!searching &&
              technicians.length ===
                0 && (
                <div className="min-h-[400px] rounded-[28px] border border-dashed border-white/10 flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="text-6xl">
                      🔍
                    </div>

                    <h3 className="text-2xl font-bold mt-5">
                      No technician found
                    </h3>

                    <p className="text-slate-500 mt-2">
                      Try searching for electrician,
                      plumber, AC repair or a city.
                    </p>
                  </div>
                </div>
              )}

            {/* TECHNICIANS */}

            {!searching &&
              technicians.length >
                0 && (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">

                  {technicians.map(
                    (technician) => {
                      const photo =
                        getTechnicianPhoto(
                          technician
                        );

                      const skills =
                        getTechnicianSkills(
                          technician
                        );

                      const city =
                        technician
                          ?.location
                          ?.city ||
                        technician?.city ||
                        "Location not added";

                      const rating =
                        technician?.rating ||
                        technician?.averageRating ||
                        0;

                      return (
                        <div
                          key={
                            technician._id
                          }
                          className="group rounded-[26px] border border-white/[0.08] bg-white/[0.025] overflow-hidden hover:border-[var(--theme-primaryBorder)] hover:bg-[var(--theme-primaryBg)] transition-all duration-300"
                        >

                          <div className="p-5 sm:p-6">

                            <div className="flex items-start gap-4">

                              <div className="relative shrink-0">

                                {photo ? (
                                  <img
                                    src={
                                      photo
                                    }
                                    alt={
                                      technician.name ||
                                      "Technician"
                                    }
                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-white/10 shadow-xl"
                                    onError={(
                                      e
                                    ) => {
                                      e.currentTarget.style.display =
                                        "none";

                                      if (
                                        e.currentTarget
                                          .nextSibling
                                      ) {
                                        e.currentTarget.nextSibling.style.display =
                                          "flex";
                                      }
                                    }}
                                  />
                                ) : null}

                                <div
                                  style={{
                                    display:
                                      photo
                                        ? "none"
                                        : "flex",
                                  }}
                                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 items-center justify-center text-4xl"
                                >
                                  👨‍🔧
                                </div>

                                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0b1728] flex items-center justify-center">
                                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                                </span>
                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex items-center gap-2">

                                  <h3 className="text-lg font-bold truncate">
                                    {technician.name ||
                                      "Technician"}
                                  </h3>

                                  <span className="text-blue-400 text-sm">
                                    ✓
                                  </span>
                                </div>

                                <p className="text-sm text-[var(--theme-primaryText)] mt-1">
                                  Professional Technician
                                </p>

                                <div className="flex items-center gap-1 mt-3">
                                  <span className="text-yellow-400">
                                    ★
                                  </span>

                                  <span className="font-semibold">
                                    {rating
                                      ? Number(
                                          rating
                                        ).toFixed(
                                          1
                                        )
                                      : "New"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mt-5 text-sm text-slate-400">
                              <span>
                                📍
                              </span>

                              <span className="truncate">
                                {city}
                              </span>
                            </div>

                            <div className="mt-5">

                              <p className="text-xs text-slate-500 mb-2">
                                SERVICES
                              </p>

                              <div className="flex flex-wrap gap-2">

                                {skills
                                  .slice(
                                    0,
                                    4
                                  )
                                  .map(
                                    (
                                      skill,
                                      index
                                    ) => (
                                      <span
                                        key={
                                          index
                                        }
                                        className="px-2.5 py-1 rounded-lg bg-[var(--theme-primaryBg)] border border-[var(--theme-primaryBorder)] text-xs text-[var(--theme-primaryText)]"
                                      >
                                        {
                                          skill
                                        }
                                      </span>
                                    )
                                  )}
                              </div>
                            </div>

                            {(technician.phone ||
                              technician.email) && (
                              <div className="mt-5 pt-4 border-t border-white/[0.06] space-y-2">

                                {technician.phone && (
                                  <div className="text-sm text-slate-400">
                                    📞{" "}
                                    {
                                      technician.phone
                                    }
                                  </div>
                                )}

                                {technician.email && (
                                  <div className="text-sm text-slate-500 truncate">
                                    ✉️{" "}
                                    {
                                      technician.email
                                    }
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                            <button
                              onClick={() =>
                                navigate(
                                  `/technician/${technician._id}`
                                )
                              }
                              className="w-full py-3 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primaryDark)] font-semibold transition"
                            >
                              View Full Profile →
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
          </section>
        )}

        {/* =================================================
            NORMAL DASHBOARD
        ================================================= */}

        {!showSearchResults && (
          <>
            {/* =================================================
                SERVICES
            ================================================= */}

            <section className="mt-10">

              <div className="flex items-end justify-between mb-5">

                <div>
                  <h2 className="text-2xl font-bold">
                    What do you need?
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Start with a service or ask AI.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setAiOpen(true)
                  }
                  className="text-sm text-[var(--theme-primaryText)]"
                >
                  Ask AI →
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">

                {SERVICES.map(
                  (service) => (
                    <button
                      key={
                        service.id
                      }
                      onClick={() =>
                        selectService(
                          service
                        )
                      }
                      className="group text-left rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 hover:-translate-y-1 hover:border-[var(--theme-primaryBorder)] hover:bg-[var(--theme-primaryBg)] transition-all"
                    >

                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-2xl`}
                      >
                        {
                          service.icon
                        }
                      </div>

                      <h3 className="font-semibold mt-4">
                        {
                          service.name
                        }
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        {
                          service.description
                        }
                      </p>
                    </button>
                  )
                )}
              </div>
            </section>

            {/* =================================================
                REQUEST FORM
            ================================================= */}

            {selectedService && (
              <section
                id="request-form"
                className="mt-10"
              >

                <div className="rounded-[24px] border border-white/[0.08] bg-[#0b1728] p-5 sm:p-6 md:p-8">

                  <div className="flex items-center gap-4 mb-7">

                    <div
                      className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br ${selectedService.color} flex items-center justify-center text-3xl`}
                    >
                      {
                        selectedService.icon
                      }
                    </div>

                    <div>
                      <p className="text-[var(--theme-primaryText)] text-sm">
                        New service request
                      </p>

                      <h2 className="text-2xl font-bold">
                        {
                          selectedService.name
                        }
                      </h2>
                    </div>
                  </div>

                  <form
                    onSubmit={
                      handleCreateRequest
                    }
                    className="space-y-5"
                  >

                    {/* TITLE */}

                    <div>
                      <label className="text-sm text-slate-300">
                        Problem title
                      </label>

                      <input
                        value={title}
                        onChange={(e) =>
                          setTitle(
                            e.target.value
                          )
                        }
                        placeholder="e.g. AC cooling nahi kar raha"
                        className="mt-2 w-full px-4 py-3.5 rounded-xl bg-[#07111f] border border-white/10 outline-none"
                        required
                      />
                    </div>

                    {/* DESCRIPTION */}

                    <div>
                      <label className="text-sm text-slate-300">
                        Explain your problem
                      </label>

                      <textarea
                        value={
                          description
                        }
                        onChange={(e) =>
                          setDescription(
                            e.target.value
                          )
                        }
                        rows="5"
                        placeholder="Problem ko detail mein batao..."
                        className="mt-2 w-full px-4 py-3.5 rounded-xl bg-[#07111f] border border-white/10 outline-none resize-none"
                        required
                      />
                    </div>

                    {/* LIVE LOCATION */}

                    <LiveLocation
                      onLocationChange={
                        handleLocationChange
                      }
                    />

                    {/* PROFILE ADDRESS */}

                    <div className="flex items-start gap-3 rounded-xl bg-[var(--theme-primaryBg)] border border-[var(--theme-primaryBorder)] p-4">

                      <span className="text-xl">
                        🏠
                      </span>

                      <div className="flex-1 min-w-0">

                        <p className="text-sm font-medium">
                          Service address
                        </p>

                        <p className="text-xs text-slate-500 mt-1 break-words">
                          {user?.location
                            ?.address ||
                          user?.location
                            ?.city
                            ? [
                                user
                                  ?.location
                                  ?.address,

                                user
                                  ?.location
                                  ?.city,

                                user
                                  ?.location
                                  ?.state,

                                user
                                  ?.location
                                  ?.pincode,
                              ]
                                .filter(
                                  Boolean
                                )
                                .join(
                                  ", "
                                )
                            : "Address profile mein add karo"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            "/profile"
                          )
                        }
                        className="text-sm text-[var(--theme-primaryText)] shrink-0"
                      >
                        Edit
                      </button>
                    </div>

                    {/* BUTTONS */}

                    <div className="flex flex-col sm:flex-row gap-3">

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedService(
                            null
                          );

                          setTitle("");

                          setDescription(
                            ""
                          );

                          setError("");
                        }}
                        className="px-5 py-3 rounded-xl border border-white/10"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={
                          submitting
                        }
                        className="flex-1 px-5 py-3 rounded-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primaryDark)] disabled:opacity-50 font-semibold"
                      >
                        {submitting
                          ? "Getting location & creating..."
                          : "Create Service Request"}
                      </button>
                    </div>

                  </form>
                </div>
              </section>
            )}

            {/* =================================================
                REQUESTS
            ================================================= */}

            <section
              id="my-requests"
              className="mt-12 pb-20"
            >

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">

                <div>
                  <h2 className="text-2xl font-bold">
                    Your requests
                  </h2>

                  <p className="text-slate-500 mt-1">
                    Track everything in one place.
                  </p>
                </div>

                <div className="self-start px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-sm">
                  {
                    requests.length
                  }{" "}
                  total
                </div>
              </div>

              {requests.length ===
              0 ? (
                <div className="rounded-[24px] border border-dashed border-white/10 p-10 sm:p-12 text-center">

                  <div className="text-5xl">
                    🧰
                  </div>

                  <h3 className="text-xl font-semibold mt-4">
                    No requests yet
                  </h3>

                  <p className="text-slate-500 mt-2">
                    Select a service above and get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">

                  {requests.map(
                    (request) => {
                      const service =
                        getService(
                          request.serviceType
                        );

                      return (
                        <div
                          key={
                            request._id
                          }
                          className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
                        >

                          <div className="flex flex-col md:flex-row md:items-center gap-4">

                            <div
                              className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${
                                service?.color ||
                                "from-blue-400 to-indigo-500"
                              } flex items-center justify-center text-xl`}
                            >
                              {
                                service?.icon ||
                                "🛠️"
                              }
                            </div>

                            <div className="flex-1 min-w-0">

                              <div className="flex flex-wrap items-center gap-2">

                                <h3 className="font-semibold break-words">
                                  {
                                    request.title
                                  }
                                </h3>

                                <span
                                  className={`px-2.5 py-1 rounded-full border text-[11px] ${
                                    STATUS_STYLES[
                                      request
                                        .status
                                    ] ||
                                    "bg-white/5 text-slate-300 border-white/10"
                                  }`}
                                >
                                  {(
                                    request.status ||
                                    "pending"
                                  ).replace(
                                    "-",
                                    " "
                                  )}
                                </span>
                              </div>

                              <p className="text-sm text-[var(--theme-primaryText)] mt-1">
                                {service?.name ||
                                  request.serviceType}
                              </p>

                              <p className="text-sm text-slate-500 mt-2 break-words">
                                {
                                  request.description
                                }
                              </p>

                              {request.location
                                ?.coordinates && (
                                <p className="text-xs text-slate-600 mt-2">
                                  📍 GPS location saved
                                </p>
                              )}
                            </div>

                            <div className="text-sm text-slate-600">
                              {formatDate(
                                request.createdAt
                              )}
                            </div>
                          </div>

                          
                      {request.technician && (
  <div className="mt-4 pt-4 border-t border-white/[0.06]">

    <div className="flex items-center gap-3">

      <div className="w-10 h-10 rounded-full bg-[var(--theme-primaryBg)] flex items-center justify-center">
        👨‍🔧
      </div>

      <div className="flex-1 min-w-0">

        <p className="text-xs text-slate-500">
          Assigned technician
        </p>

        <p className="text-sm font-medium">
          {request.technician.name}
        </p>

      </div>

    </div>

    {/* RATE TECHNICIAN */}

    {request.status === "completed" && (
      <div className="mt-4">

        {reviewedRequestIds.has(
          String(request._id)
        ) ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-sm">
            <span>✓</span>
            <span>
              You reviewed this service
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setSelectedRequestForReview(
                request
              );

              setReviewRating(0);

              setReviewComment("");

              setError("");

              setReviewOpen(true);
            }}
            className="w-full py-3 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-400/20 text-yellow-300 font-semibold transition"
          >
            ⭐ Rate Technician
          </button>
        )}

      </div>
    )}

  </div>
)}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* =================================================
          MOBILE LOGOUT
      ================================================= */}

      <button
        onClick={logout}
        className="sm:hidden fixed bottom-6 left-6 z-40 px-4 py-3 rounded-xl bg-red-500/90 text-white shadow-2xl"
      >
        Logout
      </button>

      {/* =================================================
          FLOATING AI
      ================================================= */}

      <button
        onClick={() =>
          setAiOpen(true)
        }
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[var(--theme-primary)] hover:bg-[var(--theme-primaryDark)] shadow-2xl flex items-center justify-center text-2xl transition hover:scale-105"
      >
        🤖
      </button>

      {/* =================================================
          AI PANEL
      ================================================= */}

      {aiOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">

          <div className="w-full max-w-lg h-[90vh] sm:h-[650px] sm:max-h-[90vh] rounded-t-[28px] sm:rounded-[28px] bg-[#0b1728] border border-white/10 shadow-2xl flex flex-col overflow-hidden">

            {/* HEADER */}

            <div className="p-5 border-b border-white/[0.07] flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-[var(--theme-primaryBg)] flex items-center justify-center text-xl">
                🤖
              </div>

              <div className="flex-1">
                <h3 className="font-bold">
                  NearbyFix AI
                </h3>

                <p className="text-xs text-emerald-400">
                  Hinglish • English
                </p>
              </div>

              <button
                onClick={() =>
                  setAiOpen(false)
                }
                
                className="text-slate-500 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* MESSAGES */}

            <div className="flex-1 overflow-y-auto p-5 space-y-4">

              {aiMessages.map(
                (
                  message,
                  index
                ) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role ===
                      "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        message.role ===
                        "user"
                          ? "bg-[var(--theme-primary)] rounded-br-md"
                          : "bg-white/[0.05] border border-white/[0.07] text-slate-300 rounded-bl-md"
                      }`}
                    >
                      {
                        message.text
                      }
                    </div>
                  </div>
                )
              )}

              {aiLoading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl bg-white/[0.05] text-slate-500">
                    AI soch raha hai...
                  </div>
                </div>
              )}

                    
            </div>

            {/* QUICK QUESTIONS */}

            <div className="px-5 pb-3 flex gap-2 overflow-x-auto">

              <button
                onClick={() =>
                  sendAIMessage(
                    "Mere AC mein cooling nahi ho rahi, kaunsa technician chahiye?"
                  )
                }
                className="shrink-0 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs"
              >
                AC problem
              </button>

              <button
                onClick={() =>
                  sendAIMessage(
                    "Kitchen sink se paani leak ho raha hai"
                  )
                }
                className="shrink-0 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs"
              >
                Water leak
              </button>

              <button
                onClick={() =>
                  sendAIMessage(
                    "Fan kaam nahi kar raha"
                  )
                }
                className="shrink-0 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs"
              >
                Fan issue
              </button>
            </div>

            {/* INPUT */}

            <div className="p-4 border-t border-white/[0.07]">

              <div className="flex gap-2">

                <input
                  value={
                    aiMessage
                  }
                  onChange={(e) =>
                    setAiMessage(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key ===
                      "Enter"
                    ) {
                      sendAIMessage();
                    }
                  }}
                  placeholder="Apni problem batao..."
                  className="min-w-0 flex-1 px-4 py-3 rounded-xl bg-[#07111f] border border-white/10 outline-none text-sm"
                />

                <button
                  onClick={() =>
                    sendAIMessage()
                  }
                  disabled={
                    aiLoading ||
                    !aiMessage.trim()
                  }
                  className="w-12 shrink-0 rounded-xl bg-[var(--theme-primary)] disabled:opacity-40"
                >
                  ➤
                  
                </button>
              </div>
            </div>


          </div>
        </div>
      )}
      {/* =================================================
          REVIEW MODAL
      ================================================= */}

      {reviewOpen && (
        <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-md rounded-[28px] bg-[#0b1728] border border-white/10 shadow-2xl overflow-hidden">

            <div className="p-5 border-b border-white/[0.07] flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-xl">
                ⭐
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-lg">
                  Rate Technician
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  {selectedRequestForReview?.technician?.name ||
                    "Technician"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setReviewOpen(false);
                  setSelectedRequestForReview(null);
                }}
                className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 hover:text-white"
              >
                ✕
              </button>

            </div>

            <div className="p-5">

              <p className="text-sm text-slate-400 text-center">
                How was your experience?
              </p>

              <div className="flex justify-center gap-2 mt-5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className={`text-4xl transition-transform hover:scale-110 ${
                      star <= reviewRating
                        ? "text-yellow-400"
                        : "text-slate-600"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              {reviewRating > 0 && (
                <p className="text-center text-sm text-yellow-300 mt-3">
                  {reviewRating === 1 && "Poor"}
                  {reviewRating === 2 && "Needs improvement"}
                  {reviewRating === 3 && "Good"}
                  {reviewRating === 4 && "Very good"}
                  {reviewRating === 5 && "Excellent!"}
                </p>
              )}

              <div className="mt-6">

                <label className="text-sm text-slate-300">
                  Your review
                </label>

                <textarea
                  value={reviewComment}
                  onChange={(e) =>
                    setReviewComment(e.target.value)
                  }
                  rows="5"
                  maxLength={500}
                  placeholder="Tell us about your experience..."
                  className="mt-2 w-full px-4 py-3.5 rounded-xl bg-[#07111f] border border-white/10 outline-none resize-none text-sm"
                />

                <div className="text-right text-xs text-slate-600 mt-1">
                  {reviewComment.length}/500
                </div>

              </div>

              <div className="flex gap-3 mt-5">

                <button
                  type="button"
                  onClick={() => {
                    setReviewOpen(false);
                    setSelectedRequestForReview(null);
                  }}
                  disabled={reviewSubmitting}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={
                    reviewSubmitting ||
                    !reviewRating ||
                    !reviewComment.trim()
                  }
                  className="flex-1 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold"
                >
                  {reviewSubmitting
                    ? "Submitting..."
                    : "Submit Review ⭐"}
                </button>

              </div>

            </div>
          </div>

        </div>
      )}

    </div>
    
  );
}

export default Dashboard;