import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getTechnicianProfile,
  updateTechnicianProfile,
} from "../services/api";

const SERVICE_TYPES = [
  {
    value: "electrician",
    label: "Electrician",
  },
  {
    value: "plumber",
    label: "Plumber",
  },
  {
    value: "ac-repair",
    label: "AC Repair",
  },
  {
    value: "carpenter",
    label: "Carpenter",
  },
  {
    value: "mechanic",
    label: "Mechanic",
  },
  {
    value: "appliance-repair",
    label: "Appliance Repair",
  },
];

const TechnicianOwnProfile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    profilePhoto: "",
    bio: "",
    experience: "",
    skills: "",
    serviceTypes: [],
    isAvailable: true,

    address: "",
    city: "",
    state: "",
    pincode: "",
    lat: "",
    lng: "",
  });

  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return localStorage.getItem("nearbyfix_token");
  };

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      console.log("=================================");
      console.log("LOADING OWN TECHNICIAN PROFILE");
      console.log("=================================");

      const data = await getTechnicianProfile();

      console.log(
        "TECHNICIAN OWN PROFILE RESPONSE:",
        data
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Failed to load technician profile."
        );
      }

      // Backend may return user OR technician.
      const technician =
        data.user || data.technician;

      if (!technician) {
        throw new Error(
          "Technician profile was not returned by server."
        );
      }

      setUser(technician);

      const location = technician.location || {};

      const coordinates =
        location.coordinates || {};

      setForm({
        name: technician.name || "",

        phone: technician.phone || "",

        profilePhoto:
          technician.profilePhoto || "",

        bio: technician.bio || "",

        experience:
          technician.experience ?? "",

        skills: Array.isArray(
          technician.skills
        )
          ? technician.skills.join(", ")
          : "",

        serviceTypes: Array.isArray(
          technician.serviceTypes
        )
          ? technician.serviceTypes
          : [],

        isAvailable:
          technician.isAvailable !== false,

        address:
          location.address || "",

        city:
          location.city || "",

        state:
          location.state || "",

        pincode:
          location.pincode || "",

        lat:
          coordinates.lat ??
          "",

        lng:
          coordinates.lng ??
          "",
      });
    } catch (err) {
      console.error(
        "TECHNICIAN OWN PROFILE ERROR:",
        err
      );

      const status = err.response?.status;

      const serverMessage =
        err.response?.data?.message;

      if (
        status === 401 ||
        serverMessage
          ?.toLowerCase()
          .includes("token")
      ) {
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
        serverMessage ||
          err.message ||
          "Failed to load technician profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadProfile();
  }, []);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
    setMessage("");
  };

  // =====================================================
  // SERVICE TYPE
  // =====================================================

  const toggleServiceType = (service) => {
    setForm((prev) => {
      const exists =
        prev.serviceTypes.includes(
          service
        );

      return {
        ...prev,

        serviceTypes: exists
          ? prev.serviceTypes.filter(
              (item) =>
                item !== service
            )
          : [
              ...prev.serviceTypes,
              service,
            ],
      };
    });

    setError("");
    setMessage("");
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (!form.name.trim()) {
        throw new Error(
          "Name cannot be empty."
        );
      }

      if (
        form.serviceTypes.length ===
        0
      ) {
        throw new Error(
          "Please select at least one service type."
        );
      }

      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      const payload = {
        name: form.name.trim(),

        phone: form.phone.trim(),

        profilePhoto:
          form.profilePhoto.trim(),

        bio: form.bio.trim(),

        experience:
          Number(form.experience) || 0,

        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),

        serviceTypes:
          form.serviceTypes,

        isAvailable:
          form.isAvailable,

        address:
          form.address.trim(),

        city:
          form.city.trim(),

        state:
          form.state.trim(),

        pincode:
          form.pincode.trim(),

        lat:
          form.lat === ""
            ? undefined
            : Number(form.lat),

        lng:
          form.lng === ""
            ? undefined
            : Number(form.lng),
      };

      console.log(
        "================================="
      );

      console.log(
        "UPDATING TECHNICIAN PROFILE"
      );

      console.log(
        "PAYLOAD:",
        payload
      );

      console.log(
        "================================="
      );

      const data =
        await updateTechnicianProfile(
          payload
        );

      console.log(
        "UPDATE TECHNICIAN RESPONSE:",
        data
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Failed to update profile."
        );
      }

      const updatedUser =
        data.user ||
        data.technician;

      if (updatedUser) {
        setUser(updatedUser);

        localStorage.setItem(
          "nearbyfix_user",
          JSON.stringify(
            updatedUser
          )
        );
      }

      setMessage(
        "Technician profile updated successfully ✓"
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "UPDATE TECHNICIAN PROFILE ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update technician profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07111f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl">
            🔧
          </div>

          <p className="mt-4 text-slate-400">
            Loading technician profile...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-[#07111f] text-white">

      {/* HEADER */}

      <header className="border-b border-white/10 bg-[#07111f]/95">
        <div className="max-w-5xl mx-auto px-5 py-5">
          <button
            onClick={() =>
              navigate("/technician")
            }
            className="text-slate-400 hover:text-white"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-10">

        {/* TITLE */}

        <div className="mb-8">
          <p className="text-blue-300 text-sm">
            Technician Panel
          </p>

          <h1 className="text-4xl font-black mt-2">
            My Technician Profile
          </h1>

          <p className="text-slate-400 mt-2">
            Manage your professional
            information and availability.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {message && (
          <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-300">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* BASIC INFORMATION */}

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">

            <h2 className="text-xl font-bold">
              Basic Information
            </h2>

            <div className="grid md:grid-cols-2 gap-5 mt-6">

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Phone
                </label>

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-slate-300 mb-2">
                  Profile Photo URL
                </label>

                <input
                  name="profilePhoto"
                  value={
                    form.profilePhoto
                  }
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-slate-300 mb-2">
                  Bio
                </label>

                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Tell customers about your experience..."
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 resize-none"
                />
              </div>

            </div>
          </section>

          {/* PROFESSIONAL */}

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">

            <h2 className="text-xl font-bold">
              Professional Information
            </h2>

            <div className="mt-6 space-y-5">

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Experience (Years)
                </label>

                <input
                  type="number"
                  min="0"
                  name="experience"
                  value={
                    form.experience
                  }
                  onChange={handleChange}
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Skills
                </label>

                <input
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="Wiring, AC repair, maintenance"
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />

                <p className="text-xs text-slate-500 mt-2">
                  Separate skills with commas.
                </p>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-3">
                  Services
                </label>

                <div className="grid sm:grid-cols-2 gap-3">

                  {SERVICE_TYPES.map(
                    (service) => {
                      const selected =
                        form.serviceTypes.includes(
                          service.value
                        );

                      return (
                        <button
                          type="button"
                          key={
                            service.value
                          }
                          onClick={() =>
                            toggleServiceType(
                              service.value
                            )
                          }
                          className={`text-left px-4 py-3 rounded-xl border transition ${
                            selected
                              ? "bg-blue-500/10 border-blue-500 text-blue-300"
                              : "bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20"
                          }`}
                        >
                          {selected
                            ? "✓ "
                            : ""}
                          {
                            service.label
                          }
                        </button>
                      );
                    }
                  )}

                </div>
              </div>
            </div>
          </section>

          {/* LOCATION */}

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">

            <h2 className="text-xl font-bold">
              Service Location
            </h2>

            <div className="grid md:grid-cols-2 gap-5 mt-6">

              <div className="md:col-span-2">
                <label className="block text-sm text-slate-300 mb-2">
                  Address
                </label>

                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  City
                </label>

                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  State
                </label>

                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Pincode
                </label>

                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Latitude
                </label>

                <input
                  name="lat"
                  value={form.lat}
                  onChange={handleChange}
                  placeholder="26.4499"
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Longitude
                </label>

                <input
                  name="lng"
                  value={form.lng}
                  onChange={handleChange}
                  placeholder="80.3319"
                  className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

            </div>
          </section>

          {/* AVAILABILITY */}

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">

            <div className="flex items-center justify-between gap-5">

              <div>
                <h2 className="text-xl font-bold">
                  Availability
                </h2>

                <p className="text-slate-400 mt-1">
                  Allow customers to send
                  you new service requests.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">

                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={
                    form.isAvailable
                  }
                  onChange={handleChange}
                  className="sr-only peer"
                />

                <div className="w-14 h-7 bg-slate-700 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-7" />

              </label>

            </div>

            <div className="mt-4">
              <span
                className={`inline-flex px-3 py-1.5 rounded-full text-sm border ${
                  form.isAvailable
                    ? "bg-green-500/10 border-green-500/20 text-green-300"
                    : "bg-red-500/10 border-red-500/20 text-red-300"
                }`}
              >
                {form.isAvailable
                  ? "● Available"
                  : "● Unavailable"}
              </span>
            </div>

          </section>

          {/* SAVE */}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed font-bold text-lg transition"
          >
            {saving
              ? "Saving Profile..."
              : "Save Technician Profile"}
          </button>

        </form>
      </main>
    </div>
  );
};

export default TechnicianOwnProfile;