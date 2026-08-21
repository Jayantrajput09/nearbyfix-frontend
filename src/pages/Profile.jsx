import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getProfile,
  updateProfile,
  getTechnicianReviews,
} from "../services/api";

const SERVICES = [
  {
    id: "electrician",
    name: "Electrician",
    icon: "⚡",
  },
  {
    id: "plumber",
    name: "Plumber",
    icon: "🔧",
  },
  {
    id: "ac-repair",
    name: "AC Repair",
    icon: "❄️",
  },
  {
    id: "carpenter",
    name: "Carpenter",
    icon: "🪚",
  },
  {
    id: "mechanic",
    name: "Mechanic",
    icon: "🚗",
  },
  {
    id: "appliance-repair",
    name: "Appliance Repair",
    icon: "🔌",
  },
];

function Profile() {
  const navigate = useNavigate();

  // =====================================
  // STATES
  // =====================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gettingLocation, setGettingLocation] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [currentUser, setCurrentUser] =
    useState(null);

  const [photoPreview, setPhotoPreview] =
    useState("");

  const [skillInput, setSkillInput] =
    useState("");

  // REVIEWS
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] =
    useState(false);
  const [reviewsError, setReviewsError] =
    useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",

    profilePhoto: "",

    bio: "",
    skills: [],
    experience: 0,
    serviceTypes: [],
    isAvailable: true,

    address: "",
    city: "",
    state: "",
    pincode: "",

    lat: null,
    lng: null,
  });

  // =====================================
  // LOAD PROFILE
  // =====================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

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

      console.log(
        "================================="
      );
      console.log("LOADING PROFILE");
      console.log(
        "================================="
      );

      const data = await getProfile();

      console.log(
        "GET PROFILE RESPONSE:",
        data
      );

      if (
        !data?.success ||
        !data?.user
      ) {
        throw new Error(
          data?.message ||
            "Profile data not found."
        );
      }

      const user = data.user;

      console.log(
        "CURRENT USER:",
        user
      );

      console.log(
        "CURRENT USER ID:",
        user._id
      );

      console.log(
        "CURRENT USER ROLE:",
        user.role
      );

      setCurrentUser(user);

      // Keep localStorage updated
      localStorage.setItem(
        "nearbyfix_user",
        JSON.stringify(user)
      );

      const coordinates =
        user.location?.coordinates ||
        {};

      const lat =
        coordinates.lat !== undefined &&
        coordinates.lat !== null
          ? Number(coordinates.lat)
          : null;

      const lng =
        coordinates.lng !== undefined &&
        coordinates.lng !== null
          ? Number(coordinates.lng)
          : null;

      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",

        profilePhoto:
          user.profilePhoto || "",

        bio: user.bio || "",

        skills: Array.isArray(
          user.skills
        )
          ? user.skills
          : [],

        experience:
          Number(user.experience) || 0,

        serviceTypes:
          Array.isArray(
            user.serviceTypes
          )
            ? user.serviceTypes
            : [],

        isAvailable:
          user.isAvailable !== false,

        address:
          user.location?.address || "",

        city:
          user.location?.city || "",

        state:
          user.location?.state || "",

        pincode:
          user.location?.pincode || "",

        lat,
        lng,
      });

      setPhotoPreview(
        user.profilePhoto || ""
      );

      // =================================
      // LOAD REVIEWS FOR TECHNICIAN
      // =================================

      if (
        user.role === "technician" &&
        user._id
      ) {
        await loadTechnicianReviews(
          user._id
        );
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error(
        "PROFILE LOAD ERROR:",
        err
      );

      const status =
        err.response?.status;

      if (status === 401) {
        localStorage.removeItem(
          "nearbyfix_token"
        );

        localStorage.removeItem(
          "nearbyfix_user"
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // LOAD TECHNICIAN REVIEWS
  // =====================================

  const loadTechnicianReviews = async (
    technicianId
  ) => {
    if (!technicianId) {
      console.error(
        "TECHNICIAN ID MISSING"
      );

      setReviews([]);
      return;
    }

    try {
      setReviewsLoading(true);
      setReviewsError("");

      console.log(
        "================================="
      );
      console.log(
        "LOADING TECHNICIAN REVIEWS"
      );
      console.log(
        "TECHNICIAN ID:",
        technicianId
      );
      console.log(
        "================================="
      );

      const response =
        await getTechnicianReviews(
          technicianId
        );

      console.log(
        "GET TECHNICIAN REVIEWS RESPONSE:",
        response
      );

      // ---------------------------------
      // Different possible backend shapes
      // ---------------------------------

      let reviewList = [];

      if (
        Array.isArray(response)
      ) {
        reviewList = response;
      } else if (
        Array.isArray(
          response?.reviews
        )
      ) {
        reviewList =
          response.reviews;
      } else if (
        Array.isArray(
          response?.data?.reviews
        )
      ) {
        reviewList =
          response.data.reviews;
      }

      console.log(
        "REVIEWS FOUND:",
        reviewList.length
      );

      console.log(
        "REVIEWS:",
        reviewList
      );

      setReviews(reviewList);
    } catch (err) {
      console.error(
        "TECHNICIAN REVIEWS ERROR:",
        err
      );

      console.error(
        "STATUS:",
        err.response?.status
      );

      console.error(
        "SERVER RESPONSE:",
        err.response?.data
      );

      setReviews([]);
      setReviewsError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load reviews."
      );
    } finally {
      setReviewsLoading(false);
    }
  };

  // =====================================
  // INPUT CHANGE
  // =====================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // =====================================
  // PHOTO CHANGE
  // =====================================

  const handlePhotoChange = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith("image/")
    ) {
      setError(
        "Please select an image file."
      );
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setError(
        "Image is too large. Please select an image under 10MB."
      );
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const img =
        new Image();

      img.onload = () => {
        const canvas =
          document.createElement(
            "canvas"
          );

        const MAX_SIZE = 500;

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (
            width > MAX_SIZE
          ) {
            height =
              (height *
                MAX_SIZE) /
              width;

            width = MAX_SIZE;
          }
        } else {
          if (
            height > MAX_SIZE
          ) {
            width =
              (width *
                MAX_SIZE) /
              height;

            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx =
          canvas.getContext(
            "2d"
          );

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        const compressed =
          canvas.toDataURL(
            "image/jpeg",
            0.75
          );

        setPhotoPreview(
          compressed
        );

        setForm((prev) => ({
          ...prev,
          profilePhoto:
            compressed,
        }));

        setMessage(
          "Photo selected. Click Save Profile to save it."
        );

        setError("");
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  };

  // =====================================
  // REMOVE PHOTO
  // =====================================

  const removePhoto = () => {
    setPhotoPreview("");

    setForm((prev) => ({
      ...prev,
      profilePhoto: "",
    }));

    setMessage("");
  };

  // =====================================
  // SERVICE SELECT
  // =====================================

  const toggleService = (
    serviceId
  ) => {
    setForm((prev) => {
      const exists =
        prev.serviceTypes.includes(
          serviceId
        );

      return {
        ...prev,

        serviceTypes: exists
          ? prev.serviceTypes.filter(
              (item) =>
                item !== serviceId
            )
          : [
              ...prev.serviceTypes,
              serviceId,
            ],
      };
    });

    setMessage("");
  };

  // =====================================
  // SKILLS
  // =====================================

  const addSkill = () => {
    const skill =
      skillInput.trim();

    if (!skill) return;

    const alreadyExists =
      form.skills.some(
        (item) =>
          item.toLowerCase() ===
          skill.toLowerCase()
      );

    if (alreadyExists) {
      setSkillInput("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        skill,
      ],
    }));

    setSkillInput("");
  };

  const removeSkill = (
    skill
  ) => {
    setForm((prev) => ({
      ...prev,
      skills:
        prev.skills.filter(
          (item) =>
            item !== skill
        ),
    }));
  };

  // =====================================
  // LOCATION
  // =====================================

  const getLocation = () => {
    if (
      !navigator.geolocation
    ) {
      setError(
        "Location is not supported by your browser."
      );

      return;
    }

    setGettingLocation(true);
    setError("");
    setMessage(
      "Getting your current location..."
    );

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat =
          Number(
            position.coords.latitude
          );

        const lng =
          Number(
            position.coords.longitude
          );

        setForm((prev) => ({
          ...prev,
          lat,
          lng,
        }));

        try {
          const response =
            await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              {
                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          if (!response.ok) {
            throw new Error(
              "Unable to find address."
            );
          }

          const data =
            await response.json();

          const address =
            data.address || {};

          setForm((prev) => ({
            ...prev,

            lat,
            lng,

            address:
              data.display_name ||
              prev.address,

            city:
              address.city ||
              address.town ||
              address.village ||
              address.municipality ||
              "",

            state:
              address.state ||
              "",

            pincode:
              address.postcode ||
              "",
          }));

          setMessage(
            "Location detected successfully."
          );
        } catch (err) {
          console.error(
            "REVERSE LOCATION ERROR:",
            err
          );

          setMessage(
            "Coordinates detected, but address could not be found."
          );
        } finally {
          setGettingLocation(false);
        }
      },

      (err) => {
        console.error(
          "GEOLOCATION ERROR:",
          err
        );

        setGettingLocation(false);

        if (err.code === 1) {
          setError(
            "Location permission denied."
          );
        } else if (
          err.code === 2
        ) {
          setError(
            "Location could not be determined."
          );
        } else if (
          err.code === 3
        ) {
          setError(
            "Location request timed out."
          );
        } else {
          setError(
            "Unable to determine location."
          );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // =====================================
  // SAVE PROFILE
  // =====================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (!form.name.trim()) {
        throw new Error(
          "Name is required."
        );
      }

      const payload = {
        name:
          form.name.trim(),

        phone:
          form.phone.trim(),

        profilePhoto:
          form.profilePhoto,

        bio:
          form.bio.trim(),

        skills:
          form.skills,

        experience:
          Number(
            form.experience
          ) || 0,

        serviceTypes:
          form.serviceTypes,

        isAvailable:
          form.isAvailable,

        location: {
          address:
            form.address.trim(),

          city:
            form.city.trim(),

          state:
            form.state.trim(),

          pincode:
            form.pincode.trim(),

          coordinates: {
            lat:
              form.lat !== null
                ? Number(form.lat)
                : null,

            lng:
              form.lng !== null
                ? Number(form.lng)
                : null,
          },
        },
      };

      console.log(
        "================================="
      );

      console.log(
        "UPDATING PROFILE"
      );

      console.log(
        "PAYLOAD:",
        payload
      );

      console.log(
        "================================="
      );

      const data =
        await updateProfile(
          payload
        );

      console.log(
        "UPDATE PROFILE RESPONSE:",
        data
      );

      if (
        !data?.success ||
        !data?.user
      ) {
        throw new Error(
          data?.message ||
            "Profile update failed."
        );
      }

      const updatedUser =
        data.user;

      setCurrentUser(
        updatedUser
      );

      localStorage.setItem(
        "nearbyfix_user",
        JSON.stringify(
          updatedUser
        )
      );

      setForm((prev) => ({
        ...prev,

        name:
          updatedUser.name ||
          "",

        email:
          updatedUser.email ||
          "",

        phone:
          updatedUser.phone ||
          "",

        profilePhoto:
          updatedUser.profilePhoto ||
          "",

        bio:
          updatedUser.bio ||
          "",

        skills:
          Array.isArray(
            updatedUser.skills
          )
            ? updatedUser.skills
            : [],

        experience:
          Number(
            updatedUser.experience
          ) || 0,

        serviceTypes:
          Array.isArray(
            updatedUser.serviceTypes
          )
            ? updatedUser.serviceTypes
            : [],

        isAvailable:
          updatedUser.isAvailable !==
          false,

        address:
          updatedUser.location
            ?.address || "",

        city:
          updatedUser.location
            ?.city || "",

        state:
          updatedUser.location
            ?.state || "",

        pincode:
          updatedUser.location
            ?.pincode || "",

        lat:
          updatedUser.location
            ?.coordinates?.lat ??
          null,

        lng:
          updatedUser.location
            ?.coordinates?.lng ??
          null,
      }));

      setPhotoPreview(
        updatedUser.profilePhoto ||
          ""
      );

      setMessage(
        "Profile updated successfully."
      );

      // Reload reviews after profile update
      if (
        updatedUser.role ===
          "technician" &&
        updatedUser._id
      ) {
        await loadTechnicianReviews(
          updatedUser._id
        );
      }
    } catch (err) {
      console.error(
        "PROFILE UPDATE ERROR:",
        err
      );

      if (
        err.response?.status ===
        413
      ) {
        setError(
          "Photo is too large. Please choose another image."
        );
      } else {
        setError(
          err.response?.data
            ?.message ||
            err.message ||
            "Failed to update profile."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // NAVIGATION
  // =====================================

  const goBack = () => {
    if (
      currentUser?.role ===
      "technician"
    ) {
      navigate("/technician");
    } else {
      navigate("/dashboard");
    }
  };

  // =====================================
  // RATING
  // =====================================

  const calculateAverageRating = () => {
    if (!reviews.length) {
      return Number(
        currentUser?.rating || 0
      );
    }

    const total =
      reviews.reduce(
        (sum, review) =>
          sum +
          Number(
            review.rating || 0
          ),
        0
      );

    return total / reviews.length;
  };

  const averageRating =
    calculateAverageRating();

  const totalReviews =
    reviews.length ||
    Number(
      currentUser?.totalReviews || 0
    );

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl">
            👤
          </div>

          <p className="mt-4 text-slate-400">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  // =====================================
  // UI
  // =====================================

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">

          <button
            onClick={goBack}
            className="text-slate-300 hover:text-white"
          >
            ← Back
          </button>

          <div className="font-black text-xl">
            Nearby
            <span className="text-blue-400">
              Fix
            </span>
          </div>

          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-10">

        {/* TITLE */}

        <div className="mb-8">
          <p className="text-blue-400 text-sm font-semibold">
            ACCOUNT SETTINGS
          </p>

          <h1 className="text-4xl font-black mt-2">
            My Profile
          </h1>

          <p className="text-slate-500 mt-2">
            Manage your personal information,
            technician details and location.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
            {error}
          </div>
        )}

        {/* MESSAGE */}

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
            {message}
          </div>
        )}

        {/* =====================================
            PROFILE FORM
        ===================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* PHOTO */}

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

              <div className="relative">

                {photoPreview ? (
                  <img
                    src={
                      photoPreview
                    }
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-500/30 shadow-2xl"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-5xl">
                    👤
                  </div>
                )}

                {photoPreview && (
                  <button
                    type="button"
                    onClick={
                      removePhoto
                    }
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white text-sm"
                  >
                    ✕
                  </button>
                )}

              </div>

              <div className="flex-1 text-center sm:text-left">

                <h2 className="text-xl font-bold">
                  Profile Photo
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Add a clear photo so customers
                  can recognize you.
                </p>

                <label className="inline-flex mt-5 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 cursor-pointer font-semibold transition">

                  📷 Choose Photo

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handlePhotoChange
                    }
                    className="hidden"
                  />

                </label>

                <p className="text-xs text-slate-600 mt-2">
                  Image will automatically be
                  resized before upload.
                </p>

              </div>

            </div>

          </section>

          {/* PERSONAL */}

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">

            <h2 className="text-xl font-bold mb-6">
              Personal Information
            </h2>

            <div className="grid md:grid-cols-2 gap-5">

              <div>
                <label className="text-sm text-slate-400">
                  Full Name
                </label>

                <input
                  name="name"
                  value={
                    form.name
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="mt-2 w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-white/10 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">
                  Email
                </label>

                <input
                  value={
                    form.email
                  }
                  disabled
                  className="mt-2 w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-slate-500"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">
                  Phone
                </label>

                <input
                  name="phone"
                  value={
                    form.phone
                  }
                  onChange={
                    handleChange
                  }
                  required
                  className="mt-2 w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-white/10 outline-none focus:border-blue-500"
                />
              </div>

            </div>

          </section>

          {/* =====================================
              TECHNICIAN SECTION
          ===================================== */}

          {currentUser?.role ===
            "technician" && (

            <section className="rounded-3xl border border-blue-500/20 bg-blue-500/[0.03] p-6 md:p-8">

              <div className="flex items-center justify-between mb-6">

                <div>
                  <p className="text-blue-400 text-sm font-semibold">
                    TECHNICIAN PROFILE
                  </p>

                  <h2 className="text-2xl font-bold mt-1">
                    Professional Details
                  </h2>
                </div>

                <div className="text-4xl">
                  🛠️
                </div>

              </div>

              {/* SERVICES */}

              <div>

                <label className="text-sm text-slate-300 font-medium">
                  What services do you provide?
                </label>

                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Select one or more services.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

                  {SERVICES.map(
                    (service) => {

                      const selected =
                        form.serviceTypes.includes(
                          service.id
                        );

                      return (
                        <button
                          type="button"
                          key={
                            service.id
                          }
                          onClick={() =>
                            toggleService(
                              service.id
                            )
                          }
                          className={`p-4 rounded-2xl border text-left transition ${
                            selected
                              ? "border-blue-500 bg-blue-500/15"
                              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                          }`}
                        >

                          <div className="text-2xl">
                            {
                              service.icon
                            }
                          </div>

                          <div className="font-semibold mt-2">
                            {
                              service.name
                            }
                          </div>

                          {selected && (
                            <div className="text-xs text-blue-400 mt-1">
                              ✓ Selected
                            </div>
                          )}

                        </button>
                      );
                    }
                  )}

                </div>

              </div>

              {/* EXPERIENCE */}

              <div className="mt-7">

                <label className="text-sm text-slate-300">
                  Experience
                </label>

                <div className="flex items-center gap-3 mt-2">

                  <input
                    type="number"
                    min="0"
                    max="60"
                    name="experience"
                    value={
                      form.experience
                    }
                    onChange={
                      handleChange
                    }
                    className="w-32 px-4 py-3 rounded-xl bg-[#0f172a] border border-white/10 outline-none focus:border-blue-500"
                  />

                  <span className="text-slate-500">
                    years
                  </span>

                </div>

              </div>

              {/* BIO */}

              <div className="mt-7">

                <label className="text-sm text-slate-300">
                  About you
                </label>

                <textarea
                  name="bio"
                  value={
                    form.bio
                  }
                  onChange={
                    handleChange
                  }
                  rows="4"
                  maxLength="1000"
                  placeholder="Example: I am an experienced electrician specializing in home wiring, fans, switches and electrical repairs."
                  className="mt-2 w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-white/10 outline-none focus:border-blue-500 resize-none"
                />

                <p className="text-xs text-slate-600 mt-1 text-right">
                  {
                    form.bio.length
                  }
                  /1000
                </p>

              </div>

              {/* SKILLS */}

              <div className="mt-7">

                <label className="text-sm text-slate-300">
                  Skills
                </label>

                <div className="flex gap-2 mt-2">

                  <input
                    value={
                      skillInput
                    }
                    onChange={(e) =>
                      setSkillInput(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key ===
                        "Enter"
                      ) {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="e.g. Home Wiring"
                    className="flex-1 px-4 py-3 rounded-xl bg-[#0f172a] border border-white/10 outline-none focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={
                      addSkill
                    }
                    className="px-5 rounded-xl bg-white/10 hover:bg-white/15"
                  >
                    Add
                  </button>

                </div>

                {form.skills.length >
                  0 && (
                  <div className="flex flex-wrap gap-2 mt-3">

                    {form.skills.map(
                      (skill) => (
                        <button
                          type="button"
                          key={
                            skill
                          }
                          onClick={() =>
                            removeSkill(
                              skill
                            )
                          }
                          className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm"
                        >
                          {
                            skill
                          }{" "}
                          ×
                        </button>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* AVAILABILITY */}

              <div className="mt-7 flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">

                <div>

                  <p className="font-semibold">
                    Available for jobs
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Customers can find you when
                    you are available.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setForm(
                      (prev) => ({
                        ...prev,
                        isAvailable:
                          !prev.isAvailable,
                      })
                    )
                  }
                  className={`w-14 h-8 rounded-full p-1 transition ${
                    form.isAvailable
                      ? "bg-emerald-500"
                      : "bg-slate-700"
                  }`}
                >

                  <div
                    className={`w-6 h-6 rounded-full bg-white transition ${
                      form.isAvailable
                        ? "translate-x-6"
                        : ""
                    }`}
                  />

                </button>

              </div>

            </section>
          )}

          {/* =====================================
              LOCATION
          ===================================== */}

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">

            <h2 className="text-xl font-bold">
              Service Location
            </h2>

            <p className="text-sm text-slate-500 mt-1 mb-6">
              Your location helps NearbyFix find
              nearby professionals.
            </p>

            <div className="space-y-4">

              <input
                name="address"
                value={
                  form.address
                }
                onChange={
                  handleChange
                }
                placeholder="House / Street / Area"
                className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-white/10 outline-none focus:border-blue-500"
              />

              <div className="grid md:grid-cols-3 gap-4">

                <input
                  name="city"
                  value={
                    form.city
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="City"
                  className="px-4 py-3 rounded-xl bg-[#0f172a] border border-white/10 outline-none focus:border-blue-500"
                />

                <input
                  name="state"
                  value={
                    form.state
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="State"
                  className="px-4 py-3 rounded-xl bg-[#0f172a] border border-white/10 outline-none focus:border-blue-500"
                />

                <input
                  name="pincode"
                  value={
                    form.pincode
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Pincode"
                  className="px-4 py-3 rounded-xl bg-[#0f172a] border border-white/10 outline-none focus:border-blue-500"
                />

              </div>

              <button
                type="button"
                onClick={
                  getLocation
                }
                disabled={
                  gettingLocation
                }
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-semibold"
              >
                {gettingLocation
                  ? "📍 Detecting..."
                  : "📍 Use My Current Location"}
              </button>

              {form.lat !== null &&
                form.lng !== null && (

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">

                  <p className="font-semibold">
                    📍 Location detected
                  </p>

                  <p className="text-sm mt-1">
                    {
                      form.address
                    }
                  </p>

                  <p className="text-xs text-slate-500 mt-2">
                    {Number(
                      form.lat
                    ).toFixed(6)}
                    ,{" "}
                    {Number(
                      form.lng
                    ).toFixed(6)}
                  </p>

                </div>
              )}

            </div>

          </section>

          {/* SAVE */}

          <div className="flex flex-col sm:flex-row gap-3">

            <button
              type="button"
              onClick={
                goBack
              }
              className="px-6 py-4 rounded-xl border border-white/10 hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-bold"
            >
              {saving
                ? "Saving Profile..."
                : "Save Profile"}
            </button>

          </div>

        </form>

        {/* =================================================
            TECHNICIAN REVIEWS
        ================================================= */}

        {currentUser?.role ===
          "technician" && (

          <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">

            {/* HEADER */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div>

                <p className="text-blue-400 text-sm font-semibold">
                  CUSTOMER FEEDBACK
                </p>

                <h2 className="text-2xl font-bold mt-1">
                  My Reviews
                </h2>

                <p className="text-slate-500 mt-2">
                  Reviews submitted by customers
                  after completed services.
                </p>

              </div>

              {/* RATING */}

              <div className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[150px]">

                <div className="text-3xl font-black">

                  {Number(
                    averageRating || 0
                  ).toFixed(1)}

                  <span className="text-yellow-400 ml-1">
                    ★
                  </span>

                </div>

                <p className="text-sm text-slate-400 mt-1">

                  {totalReviews}{" "}

                  {totalReviews === 1
                    ? "review"
                    : "reviews"}

                </p>

              </div>

            </div>

            {/* REVIEW ERROR */}

            {reviewsError && (
              <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
                {reviewsError}
              </div>
            )}

            {/* LOADING */}

            {reviewsLoading ? (

              <div className="mt-8 py-10 text-center">

                <div className="text-4xl">
                  ⭐
                </div>

                <p className="text-slate-400 mt-3">
                  Loading reviews...
                </p>

              </div>

            ) : reviews.length ===
              0 ? (

              /* NO REVIEWS */

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">

                <div className="text-5xl">
                  ⭐
                </div>

                <h3 className="text-lg font-semibold mt-4">
                  No reviews yet
                </h3>

                <p className="text-slate-500 mt-2">
                  Customer reviews will appear
                  here after completed services.
                </p>

              </div>

            ) : (

              /* REVIEWS */

              <div className="mt-8 space-y-4">

                {reviews.map(
                  (review) => {

                    const rating =
                      Number(
                        review.rating ||
                          0
                      );

                    const customer =
                      review.user ||
                      review.customer ||
                      {};

                    return (

                      <div
                        key={
                          review._id ||
                          Math.random()
                        }
                        className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                      >

                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                          {/* CUSTOMER */}

                          <div className="flex items-center gap-3">

                            {customer.profilePhoto ? (

                              <img
                                src={
                                  customer.profilePhoto
                                }
                                alt={
                                  customer.name ||
                                  "Customer"
                                }
                                className="w-12 h-12 rounded-full object-cover border border-white/10"
                              />

                            ) : (

                              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl">
                                👤
                              </div>

                            )}

                            <div>

                              <p className="font-semibold">
                                {
                                  customer.name ||
                                  review.userName ||
                                  "Customer"
                                }
                              </p>

                              <p className="text-xs text-slate-500 mt-1">

                                {review.createdAt
                                  ? new Date(
                                      review.createdAt
                                    ).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )
                                  : ""}

                              </p>

                            </div>

                          </div>

                          {/* STARS */}

                          <div className="flex items-center gap-1">

                            {[1, 2, 3, 4, 5].map(
                              (star) => (

                                <span
                                  key={
                                    star
                                  }
                                  className={
                                    star <=
                                    rating
                                      ? "text-yellow-400 text-lg"
                                      : "text-slate-600 text-lg"
                                  }
                                >
                                  ★
                                </span>

                              )
                            )}

                            <span className="ml-2 text-sm text-slate-400">
                              {rating}/5
                            </span>

                          </div>

                        </div>

                        {/* COMMENT */}

                        {review.comment && (

                          <p className="mt-4 text-slate-300 leading-relaxed">
                            "{review.comment}"
                          </p>

                        )}

                      </div>

                    );
                  }
                )}

              </div>

            )}

          </section>

        )}

      </main>
    </div>
  );
}

export default Profile;