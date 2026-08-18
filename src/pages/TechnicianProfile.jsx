import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getTechnicianById,
  createServiceRequest,
} from "../services/api";

const TechnicianProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [technician, setTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showRequestForm, setShowRequestForm] =
    useState(false);

  const [requestForm, setRequestForm] = useState({
    serviceType: "",
    title: "",
    description: "",
  });

  // =====================================================
  // LOAD TECHNICIAN
  // =====================================================

  useEffect(() => {
    const loadTechnician = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("TECHNICIAN PROFILE URL ID:", id);

        if (!id) {
          throw new Error(
            "Technician ID is missing. Please open the technician from the technician list."
          );
        }

        const data = await getTechnicianById(id);

        console.log(
          "PUBLIC TECHNICIAN RESPONSE:",
          data
        );

        if (!data?.success) {
          throw new Error(
            data?.message || "Technician not found"
          );
        }

        const technicianData =
          data.technician || data.user;

        if (!technicianData) {
          throw new Error(
            "Technician data was not returned by server"
          );
        }

        setTechnician(technicianData);

        const services = Array.isArray(
          technicianData.serviceTypes
        )
          ? technicianData.serviceTypes
          : [];

        setRequestForm({
          serviceType: services[0] || "",
          title: services[0]
            ? `${services[0].replace(/-/g, " ")} service`
            : "",
          description: "",
        });
      } catch (err) {
        console.error(
          "LOAD TECHNICIAN ERROR:",
          err
        );

        if (err.response?.status === 401) {
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
            "Failed to load technician"
        );
      } finally {
        setLoading(false);
      }
    };

    loadTechnician();
  }, [id, navigate]);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleRequestChange = (e) => {
    const { name, value } = e.target;

    setRequestForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // CREATE REQUEST
  // =====================================================

  const handleCreateRequest = async (e) => {
    e.preventDefault();

    try {
      setRequesting(true);
      setError("");
      setSuccess("");

      if (!technician?._id) {
        throw new Error(
          "Technician information is missing"
        );
      }

      if (!requestForm.serviceType) {
        throw new Error(
          "Please select a service"
        );
      }

      if (!requestForm.title.trim()) {
        throw new Error(
          "Please enter a request title"
        );
      }

      if (!requestForm.description.trim()) {
        throw new Error(
          "Please describe your problem"
        );
      }

      const payload = {
        technicianId: technician._id,

        serviceType:
          requestForm.serviceType,

        title:
          requestForm.title.trim(),

        description:
          requestForm.description.trim(),
      };

      console.log(
        "CREATING SERVICE REQUEST:",
        payload
      );

      const data =
        await createServiceRequest(payload);

      console.log(
        "SERVICE REQUEST RESPONSE:",
        data
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Failed to create service request"
        );
      }

      setSuccess(
        "Service request sent successfully ✓"
      );

      setRequestForm({
        serviceType:
          technician.serviceTypes?.[0] || "",

        title:
          technician.serviceTypes?.[0]
            ? `${technician.serviceTypes[0].replace(
                /-/g,
                " "
              )} service`
            : "",

        description: "",
      });

      setShowRequestForm(false);
    } catch (err) {
      console.error(
        "CREATE REQUEST ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create service request"
      );
    } finally {
      setRequesting(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07111f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl">🔧</div>

          <p className="mt-4 text-slate-400">
            Loading technician...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR / NOT FOUND
  // =====================================================

  if (!technician) {
    return (
      <div className="min-h-screen bg-[#07111f] text-white flex items-center justify-center px-5">
        <div className="max-w-lg w-full text-center">
          <div className="text-5xl mb-5">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold">
            Technician not found
          </h1>

          <p className="text-red-300 mt-3">
            {error ||
              "Unable to load technician profile"}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // DATA
  // =====================================================

  const location =
    technician.location || {};

  const coordinates =
    location.coordinates || {};

  const serviceTypes =
    Array.isArray(
      technician.serviceTypes
    )
      ? technician.serviceTypes
      : [];

  const skills =
    Array.isArray(technician.skills)
      ? technician.skills
      : [];

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-[#07111f] text-white">

      {/* HEADER */}

      <header className="border-b border-white/10 bg-[#07111f]/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 py-5">
          <div className="flex items-center justify-between">

            <button
              onClick={() => navigate(-1)}
              className="text-slate-300 hover:text-white"
            >
              ← Back
            </button>

            <div className="text-2xl font-black">
              Nearby
              <span className="text-blue-400">
                Fix
              </span>
            </div>

            <button
              onClick={() =>
                navigate("/profile")
              }
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10"
            >
              My Profile
            </button>

          </div>
        </div>
      </header>

      {/* MAIN */}

      <main className="max-w-6xl mx-auto px-5 py-10">

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

        {/* PROFILE */}

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">

          <div className="p-7 md:p-10">

            <div className="flex flex-col md:flex-row gap-7">

              {/* PHOTO */}

              <div className="shrink-0">
                {technician.profilePhoto ? (
                  <img
                    src={technician.profilePhoto}
                    alt={
                      technician.name ||
                      "Technician"
                    }
                    className="w-32 h-32 rounded-3xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-5xl">
                    🔧
                  </div>
                )}
              </div>

              {/* INFO */}

              <div className="flex-1">

                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-3xl md:text-4xl font-black">
                    {technician.name ||
                      "Technician"}
                  </h1>

                  {technician.isAvailable !==
                  false ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      ● Available
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-300 border border-red-500/20">
                      ● Unavailable
                    </span>
                  )}

                </div>

                <p className="text-slate-400 mt-3">
                  {technician.bio ||
                    "Professional service technician."}
                </p>

                <div className="flex flex-wrap gap-3 mt-5">

                  <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-slate-500 text-sm">
                      Experience
                    </span>

                    <span className="ml-2 font-semibold">
                      {technician.experience ||
                        0}{" "}
                      years
                    </span>
                  </div>

                  {technician.phone && (
                    <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                      <span className="text-slate-500 text-sm">
                        Phone
                      </span>

                      <span className="ml-2 font-semibold">
                        {technician.phone}
                      </span>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>

          {/* SERVICES */}

          <div className="border-t border-white/10 p-7 md:p-10">

            <h2 className="text-xl font-bold">
              Services
            </h2>

            <div className="flex flex-wrap gap-3 mt-4">

              {serviceTypes.length > 0 ? (
                serviceTypes.map((service) => (
                  <span
                    key={service}
                    className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 capitalize"
                  >
                    {service.replace(
                      /-/g,
                      " "
                    )}
                  </span>
                ))
              ) : (
                <p className="text-slate-500">
                  No services listed.
                </p>
              )}

            </div>
          </div>

          {/* SKILLS */}

          {skills.length > 0 && (
            <div className="border-t border-white/10 p-7 md:p-10">

              <h2 className="text-xl font-bold">
                Skills
              </h2>

              <div className="flex flex-wrap gap-3 mt-4">

                {skills.map(
                  (skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 capitalize"
                    >
                      {skill}
                    </span>
                  )
                )}

              </div>
            </div>
          )}

          {/* LOCATION */}

          <div className="border-t border-white/10 p-7 md:p-10">

            <h2 className="text-xl font-bold">
              Service Location
            </h2>

            <p className="text-slate-400 mt-3">
              {[
                location.address,
                location.city,
                location.state,
                location.pincode,
              ]
                .filter(Boolean)
                .join(", ") ||
                "Location not provided."}
            </p>

            {coordinates.lat != null &&
              coordinates.lng != null && (
                <p className="text-xs text-slate-500 mt-3">
                  📍 GPS location available
                </p>
              )}

          </div>

        </section>

        {/* REQUEST */}

        {technician.isAvailable !==
        false ? (
          <section className="mt-6">

            {!showRequestForm ? (
              <button
                onClick={() =>
                  setShowRequestForm(true)
                }
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold text-lg"
              >
                🔧 Request This Technician
              </button>
            ) : (
              <form
                onSubmit={
                  handleCreateRequest
                }
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 md:p-10"
              >

                <h2 className="text-2xl font-bold">
                  Request Service
                </h2>

                <p className="text-slate-400 mt-2">
                  Tell the technician what
                  you need help with.
                </p>

                {/* SERVICE */}

                <div className="mt-6">

                  <label className="block text-sm text-slate-300 mb-2">
                    Service
                  </label>

                  <select
                    name="serviceType"
                    value={
                      requestForm.serviceType
                    }
                    onChange={
                      handleRequestChange
                    }
                    className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 outline-none"
                    required
                  >
                    <option value="">
                      Select service
                    </option>

                    {serviceTypes.map(
                      (service) => (
                        <option
                          key={service}
                          value={service}
                        >
                          {service.replace(
                            /-/g,
                            " "
                          )}
                        </option>
                      )
                    )}

                  </select>
                </div>

                {/* TITLE */}

                <div className="mt-5">

                  <label className="block text-sm text-slate-300 mb-2">
                    Request Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={
                      requestForm.title
                    }
                    onChange={
                      handleRequestChange
                    }
                    placeholder="Example: AC not cooling"
                    className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 outline-none"
                    required
                  />

                </div>

                {/* DESCRIPTION */}

                <div className="mt-5">

                  <label className="block text-sm text-slate-300 mb-2">
                    Problem Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      requestForm.description
                    }
                    onChange={
                      handleRequestChange
                    }
                    rows={5}
                    placeholder="Example: My AC is not cooling properly..."
                    className="w-full bg-[#020617] border border-white/10 rounded-xl px-4 py-3 outline-none resize-none"
                    required
                  />

                </div>

                {/* BUTTONS */}

                <div className="flex flex-col md:flex-row gap-3 mt-6">

                  <button
                    type="submit"
                    disabled={requesting}
                    className="flex-1 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 font-bold"
                  >
                    {requesting
                      ? "Sending Request..."
                      : "Send Service Request"}
                  </button>

                  <button
                    type="button"
                    disabled={requesting}
                    onClick={() =>
                      setShowRequestForm(false)
                    }
                    className="px-7 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 font-semibold"
                  >
                    Cancel
                  </button>

                </div>

              </form>
            )}

          </section>
        ) : (
          <div className="mt-6 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-center">
            This technician is currently
            unavailable for new requests.
          </div>
        )}

      </main>
    </div>
  );
};

export default TechnicianProfile;