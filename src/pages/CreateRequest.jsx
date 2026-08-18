import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createServiceRequest, getProfile } from "../services/api";

const CreateRequest = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();

  // =====================================================
  // DATA PASSED FROM SEARCH / SERVICE CARD
  // =====================================================

  const selectedService =
    routerLocation.state?.serviceType || "";

  const selectedTechnicianId =
    routerLocation.state?.technicianId ||
    routerLocation.state?.technician?._id ||
    routerLocation.state?.technician?.id ||
    "";

  const selectedTechnician =
    routerLocation.state?.technician ||
    null;

  // =====================================================
  // FORM
  // =====================================================

  const [form, setForm] = useState({
    serviceType: selectedService,
    title: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // INPUT
  // =====================================================

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.serviceType) {
      setError("Please select a service.");
      return;
    }

    if (!form.title.trim()) {
      setError("Please enter a problem title.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please describe your problem.");
      return;
    }

    try {
      setLoading(true);

      // =================================================
      // GET USER PROFILE
      // =================================================

      setLoadingProfile(true);

      let profile = null;

      try {
        const profileResponse = await getProfile();

        if (
          profileResponse?.success &&
          profileResponse?.user
        ) {
          profile = profileResponse.user;
        }
      } catch (profileError) {
        console.error(
          "PROFILE FETCH FOR REQUEST ERROR:",
          profileError
        );
      } finally {
        setLoadingProfile(false);
      }

      // =================================================
      // USER LOCATION
      // =================================================

      const userLocation = profile?.location || {};

      const coordinates =
        userLocation.coordinates || {};

      const requestLocation = {
        address: userLocation.address || "",
        city: userLocation.city || "",
        state: userLocation.state || "",
        pincode: userLocation.pincode || "",

        coordinates: {
          lat:
            coordinates.lat !== null &&
            coordinates.lat !== undefined
              ? Number(coordinates.lat)
              : null,

          lng:
            coordinates.lng !== null &&
            coordinates.lng !== undefined
              ? Number(coordinates.lng)
              : null,
        },
      };

      // =================================================
      // REQUEST PAYLOAD
      // =================================================

      const payload = {
        serviceType: form.serviceType,

        title: form.title.trim(),

        description:
          form.description.trim(),

        location: requestLocation,
      };

      // =================================================
      // IMPORTANT:
      // ONLY ADD technicianId WHEN A TECHNICIAN WAS SELECTED
      // =================================================

      if (selectedTechnicianId) {
        payload.technicianId =
          selectedTechnicianId;
      }

      console.log(
        "================================="
      );

      console.log(
        "CREATING REQUEST"
      );

      console.log(
        "SELECTED TECHNICIAN:",
        selectedTechnicianId || "NONE"
      );

      console.log(
        "PAYLOAD:",
        payload
      );

      console.log(
        "================================="
      );

      // =================================================
      // CREATE REQUEST
      // =================================================

      const response =
        await createServiceRequest(
          payload
        );

      console.log(
        "REQUEST CREATED:",
        response?.data
      );

      if (
        !response?.data?.success
      ) {
        throw new Error(
          response?.data?.message ||
            "Failed to create request."
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      alert(
        response.data.message ||
          "Service request created successfully."
      );

      navigate("/dashboard");

    } catch (error) {
      console.error(
        "CREATE REQUEST ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create service request."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">

      <div className="max-w-2xl mx-auto">

        {/* BACK */}

        <button
          onClick={() =>
            navigate("/dashboard")
          }
          className="mb-6 text-slate-400 hover:text-white"
        >
          ← Back to Dashboard
        </button>

        {/* TITLE */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold">
            Request a Service
          </h1>

          <p className="text-slate-400 mt-2">
            Tell us what problem you need help with.
          </p>

        </div>

        {/* SELECTED TECHNICIAN */}

        {selectedTechnicianId && (
          <div className="mb-6 p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20">

            <p className="text-xs uppercase tracking-wider text-blue-400">
              Requesting Specific Technician
            </p>

            <div className="flex items-center gap-4 mt-3">

              {selectedTechnician?.profilePhoto ? (
                <img
                  src={
                    selectedTechnician.profilePhoto
                  }
                  alt={
                    selectedTechnician.name ||
                    "Technician"
                  }
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">
                  🔧
                </div>
              )}

              <div>
                <p className="font-bold text-lg">
                  {selectedTechnician?.name ||
                    "Selected Technician"}
                </p>

                <p className="text-sm text-slate-400">
                  Your request will be sent directly to this technician.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* FORM */}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-7">

          {error && (
            <div className="mb-5 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* SERVICE */}

            <div>

              <label className="block mb-2">
                Service
              </label>

              <select
                name="serviceType"
                value={form.serviceType}
                onChange={handleChange}
                disabled={
                  !!selectedTechnicianId
                }
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10"
              >

                <option value="">
                  Select service
                </option>

                <option value="electrician">
                  Electrician
                </option>

                <option value="plumber">
                  Plumber
                </option>

                <option value="ac-repair">
                  AC Repair
                </option>

                <option value="carpenter">
                  Carpenter
                </option>

                <option value="mechanic">
                  Mechanic
                </option>

                <option value="appliance-repair">
                  Appliance Repair
                </option>

              </select>

            </div>

            {/* TITLE */}

            <div>

              <label className="block mb-2">
                Problem
              </label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Example: AC is not cooling"
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-blue-500"
              />

            </div>

            {/* DESCRIPTION */}

            <div>

              <label className="block mb-2">
                Describe the problem
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="6"
                placeholder="Explain the problem in detail..."
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-white/10 outline-none focus:border-blue-500 resize-none"
              />

            </div>

            {/* LOCATION INFO */}

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">

              <p className="text-sm font-semibold">
                📍 Service Location
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Your saved profile location will be attached to this request.
              </p>

            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={
                loading ||
                loadingProfile
              }
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >

              {loading
                ? "Creating Request..."
                : "Create Service Request"}

            </button>

          </form>

        </div>

      </div>

    </div>
  );
};

export default CreateRequest;