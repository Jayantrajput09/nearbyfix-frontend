import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  updateProfile,
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

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [gettingLocation, setGettingLocation] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [photoPreview, setPhotoPreview] =
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
  // LOAD
  // =====================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const data =
        await getProfile();

      if (!data?.success || !data?.user) {
        throw new Error(
          data?.message ||
            "Profile data not found"
        );
      }

      const user = data.user;

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
          user.experience || 0,

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

        lat:
          user.location?.coordinates
            ?.lat ?? null,

        lng:
          user.location?.coordinates
            ?.lng ?? null,
      });

      setPhotoPreview(
        user.profilePhoto || ""
      );
    } catch (error) {
      console.error(
        "PROFILE LOAD ERROR:",
        error
      );

      if (
        error.response?.status === 401
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

      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // INPUT
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
  };

  // =====================================
  // PHOTO RESIZE
  // =====================================

  const handlePhotoChange = (
    e
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith("image/")
    ) {
      setMessage(
        "Please select an image file."
      );
      return;
    }

    if (
      file.size > 10 * 1024 * 1024
    ) {
      setMessage(
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

        let width =
          img.width;

        let height =
          img.height;

        if (width > height) {
          if (
            width > MAX_SIZE
          ) {
            height =
              (height *
                MAX_SIZE) /
              width;

            width =
              MAX_SIZE;
          }
        } else {
          if (
            height > MAX_SIZE
          ) {
            width =
              (width *
                MAX_SIZE) /
              height;

            height =
              MAX_SIZE;
          }
        }

        canvas.width =
          width;

        canvas.height =
          height;

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
      };

      img.src =
        reader.result;
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
  };

  // =====================================
  // SKILLS
  // =====================================

  const [skillInput, setSkillInput] =
    useState("");

  const addSkill = () => {
    const skill =
      skillInput.trim();

    if (!skill) return;

    if (
      form.skills.includes(
        skill
      )
    ) {
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
      setMessage(
        "Location is not supported by your browser."
      );

      return;
    }

    setGettingLocation(true);

    setMessage(
      "Getting your current location..."
    );

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;

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
        } catch (error) {
          console.error(
            "LOCATION ERROR:",
            error
          );

          setMessage(
            "Coordinates detected, but address could not be found."
          );
        } finally {
          setGettingLocation(
            false
          );
        }
      },

      (error) => {
        console.error(
          error
        );

        setGettingLocation(
          false
        );

        if (
          error.code === 1
        ) {
          setMessage(
            "Location permission denied."
          );
        } else {
          setMessage(
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
  // SAVE
  // =====================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const payload = {
        name: form.name,
        phone: form.phone,

        profilePhoto:
          form.profilePhoto,

        bio: form.bio,

        skills:
          form.skills,

        experience:
          Number(
            form.experience
          ),

        serviceTypes:
          form.serviceTypes,

        isAvailable:
          form.isAvailable,

        location: {
          address:
            form.address,

          city:
            form.city,

          state:
            form.state,

          pincode:
            form.pincode,

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
        "PROFILE UPDATE:",
        payload
      );

      const data =
        await updateProfile(
          payload
        );

      if (
        !data?.success ||
        !data?.user
      ) {
        throw new Error(
          data?.message ||
            "Profile update failed"
        );
      }

      localStorage.setItem(
        "nearbyfix_user",
        JSON.stringify(
          data.user
        )
      );

      setForm((prev) => ({
        ...prev,

        profilePhoto:
          data.user
            .profilePhoto ||
          "",
      }));

      setPhotoPreview(
        data.user.profilePhoto ||
          ""
      );

      setMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "PROFILE UPDATE ERROR:",
        error
      );

      if (
        error.response?.status ===
        413
      ) {
        setMessage(
          "Photo is too large. Please choose another image."
        );
      } else {
        setMessage(
          error.response?.data
            ?.message ||
            error.message ||
            "Failed to update profile."
        );
      }
    } finally {
      setSaving(false);
    }
  };

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
            onClick={() => {
              if (
                form.serviceTypes.length >
                0
              ) {
                navigate(
                  "/technician"
                );
              } else {
                navigate(
                  "/dashboard"
                );
              }
            }}
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

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
            {message}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-6"
        >

          {/* =====================================
              PROFILE PHOTO
          ===================================== */}

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

              {/* PHOTO */}

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

          {/* =====================================
              PERSONAL
          ===================================== */}

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

          {form.serviceTypes !==
            undefined &&
            localStorage.getItem(
              "nearbyfix_user"
            ) &&
            JSON.parse(
              localStorage.getItem(
                "nearbyfix_user"
              )
            )?.role ===
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

                {/* SERVICE TYPE */}

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

                  {form.skills
                    .length >
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

              {form.lat !==
                null &&
                form.lng !==
                  null && (
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
                      {form.lat.toFixed(
                        6
                      )}
                      ,{" "}
                      {form.lng.toFixed(
                        6
                      )}
                    </p>

                  </div>
                )}

            </div>

          </section>

          {/* =====================================
              SAVE
          ===================================== */}

          <div className="flex flex-col sm:flex-row gap-3">

            <button
              type="button"
              onClick={() =>
                navigate(
                  form.serviceTypes.length
                    ? "/technician"
                    : "/dashboard"
                )
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

      </main>
    </div>
  );
}

export default Profile;