import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  searchTechnicians,
  getRecommendedTechnicians,
  createServiceRequest,
  getMyRequests,
  getChatMessages,
} from "../services/api";

import { io } from "socket.io-client";

const SERVICE_NAMES = {
  electrician: "Electrician",
  plumber: "Plumber",
  "ac-repair": "AC Repair",
  carpenter: "Carpenter",
  mechanic: "Mechanic",
  "appliance-repair":
    "Appliance Repair",
};

const CustomerDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] =
    useState(() => {
      try {
        return JSON.parse(
          localStorage.getItem(
            "nearbyfix_user"
          ) || "null"
        );
      } catch {
        return null;
      }
    });

  const [search, setSearch] =
    useState("");

  const [technicians, setTechnicians] =
    useState([]);

  const [loadingTechnicians, setLoadingTechnicians] =
    useState(true);

  const [requests, setRequests] =
    useState([]);

      // =====================================================
  // CHAT
  // =====================================================

  const [activeChatRequest, setActiveChatRequest] =
    useState(null);

  const [chatMessages, setChatMessages] =
    useState([]);

  const [chatInput, setChatInput] =
    useState("");

  const [chatLoading, setChatLoading] =
    useState(false);

  const [chatSending, setChatSending] =
    useState(false);

  const [chatError, setChatError] =
    useState("");

  const socketRef = useRef(null);

  const chatMessagesEndRef = useRef(null);

  const [selectedTechnician, setSelectedTechnician] =
    useState(null);

  const [showRequestModal, setShowRequestModal] =
    useState(false);

  const [requestLoading, setRequestLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [requestForm, setRequestForm] =
    useState({
      serviceType: "",
      title: "",
      description: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      lat: "",
      lng: "",
    });

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem(
      "nearbyfix_token"
    );

    localStorage.removeItem(
      "nearbyfix_user"
    );

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // LOAD TECHNICIANS
  // =====================================================

  const loadTechnicians = async () => {
    try {
      setLoadingTechnicians(true);

      const response =
        await getRecommendedTechnicians();

      const data =
        response?.data ||
        response;

      if (data?.success) {
        setTechnicians(
          data.technicians || []
        );
      } else {
        setTechnicians([]);
      }
    } catch (error) {
      console.error(
        "LOAD TECHNICIANS ERROR:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Unable to load technicians"
      );
    } finally {
      setLoadingTechnicians(false);
    }
  };

  // =====================================================
  // LOAD MY REQUESTS
  // =====================================================

  const loadMyRequests = async () => {
    try {
      const response =
        await getMyRequests();

      const data =
        response?.data ||
        response;

      if (data?.success) {
  console.log("CUSTOMER REQUESTS:", data.requests);

  data.requests?.forEach((request) => {
    console.log(
      "REQUEST:",
      request._id,
      "TECHNICIAN:",
      request.technician
    );
  });

  setRequests(
    data.requests || []
  );
} else {
        setRequests([]);
      }
    } catch (error) {
      console.error(
        "LOAD REQUESTS ERROR:",
        error
      );

      if (
        error.response?.status === 401
      ) {
        logout();
      }
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
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

    loadTechnicians();
    loadMyRequests();
  }, []);

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = async (
    value
  ) => {
    setSearch(value);

    if (!value.trim()) {
      loadTechnicians();
      return;
    }

    try {
      const response =
        await searchTechnicians(
          value.trim()
        );

      const data =
        response?.data ||
        response;

      if (data?.success) {
        setTechnicians(
          data.technicians || []
        );
      }
    } catch (error) {
      console.error(
        "SEARCH TECHNICIAN ERROR:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Search failed"
      );
    }
  };

  // =====================================================
  // OPEN REQUEST MODAL
  // =====================================================

  const openRequestModal = (
    technician
  ) => {
    if (!technician?._id) {
      setMessage(
        "Technician information missing"
      );
      return;
    }

    if (
      technician.isAvailable === false
    ) {
      setMessage(
        "This technician is currently unavailable"
      );
      return;
    }

    const firstService =
      technician.serviceTypes?.[0] ||
      "";

    const location =
      user?.location || {};

    const coordinates =
      location?.coordinates || {};

    setSelectedTechnician(
      technician
    );

    setRequestForm({
      serviceType:
        firstService,

      title: "",

      description: "",

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

    setMessage("");
    setShowRequestModal(true);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeRequestModal = () => {
    if (requestLoading) {
      return;
    }

    setShowRequestModal(false);
    setSelectedTechnician(null);
    setMessage("");
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleFormChange = (
    e
  ) => {
    const {
      name,
      value,
    } = e.target;

    setRequestForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // SEND REQUEST
  // =====================================================

  const handleSendRequest = async (
    e
  ) => {
    e.preventDefault();

    if (!selectedTechnician?._id) {
      setMessage(
        "Please select a technician."
      );
      return;
    }

    if (!requestForm.serviceType) {
      setMessage(
        "Please select a service."
      );
      return;
    }

    if (!requestForm.title.trim()) {
      setMessage(
        "Please enter the problem title."
      );
      return;
    }

    if (
      !requestForm.description.trim()
    ) {
      setMessage(
        "Please describe your problem."
      );
      return;
    }

    try {
      setRequestLoading(true);
      setMessage("");

      // -----------------------------------------------
      // GET CURRENT GPS
      // -----------------------------------------------

      let lat =
        requestForm.lat !== ""
          ? Number(
              requestForm.lat
            )
          : null;

      let lng =
        requestForm.lng !== ""
          ? Number(
              requestForm.lng
            )
          : null;

      if (
        navigator.geolocation
      ) {
        try {
          const position =
            await new Promise(
              (resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                  resolve,
                  reject,
                  {
                    enableHighAccuracy: true,
                    timeout: 8000,
                    maximumAge: 60000,
                  }
                );
              }
            );

          lat =
            position.coords.latitude;

          lng =
            position.coords.longitude;
        } catch {
          console.warn(
            "GPS unavailable, using saved location"
          );
        }
      }

      // -----------------------------------------------
      // REQUEST PAYLOAD
      // -----------------------------------------------

      const requestData = {
        technicianId:
          selectedTechnician._id,

        serviceType:
          requestForm.serviceType,

        title:
          requestForm.title.trim(),

        description:
          requestForm.description.trim(),

        location: {
          address:
            requestForm.address.trim(),

          city:
            requestForm.city.trim(),

          state:
            requestForm.state.trim(),

          pincode:
            requestForm.pincode.trim(),

          coordinates: {
            lat,
            lng,
          },
        },
      };

      console.log(
        "CREATING REQUEST:",
        requestData
      );

      // -----------------------------------------------
      // API
      // -----------------------------------------------

      const response =
        await createServiceRequest(
          requestData
        );

      const data =
        response?.data ||
        response;

      console.log(
        "CREATE REQUEST RESPONSE:",
        data
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Request failed"
        );
      }

      setMessage(
        `Request sent successfully to ${selectedTechnician.name}`
      );

      await loadMyRequests();

      setTimeout(() => {
        setShowRequestModal(
          false
        );

        setSelectedTechnician(
          null
        );

        setMessage("");
      }, 1000);
    } catch (error) {
      console.error(
        "SEND REQUEST ERROR:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          error.message ||
          "Unable to send request"
      );
    } finally {
      setRequestLoading(false);
    }
  };

    const scrollChatToBottom = () => {
    setTimeout(() => {
      chatMessagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 50);
  };

  const closeChat = () => {
    setActiveChatRequest(null);
    setChatMessages([]);
    setChatInput("");
    setChatError("");
  };

  const openChat = async (request) => {
    if (!request?._id) return;

    if (!request.technician) {
      setChatError(
        "Chat is available after a technician accepts the request."
      );
      return;
    }

    try {
      setChatLoading(true);
      setChatError("");
      setChatMessages([]);
      setActiveChatRequest(request);

      // Load old messages
      const data = await getChatMessages(request._id);

      if (!data?.success) {
        throw new Error(
          data?.message || "Failed to load chat messages"
        );
      }

      setChatMessages(
        Array.isArray(data.messages)
          ? data.messages
          : []
      );

      scrollChatToBottom();

      // Create socket connection only once
      if (!socketRef.current) {
        const token =
          localStorage.getItem("nearbyfix_token");

        if (!token) {
          throw new Error(
            "Authentication token not found"
          );
        }

        const socket = io(
  import.meta.env.VITE_API_URL?.replace(
    /\/api$/,
    ""
  ),
  {
    auth: {
      token,
    },
  }
);

        socketRef.current = socket;

        socket.on("connect", () => {
          console.log(
            "CUSTOMER CHAT SOCKET CONNECTED:",
            socket.id
          );
        });

        socket.on("connect_error", (error) => {
          console.error(
            "CUSTOMER CHAT SOCKET ERROR:",
            error
          );

          setChatError(
            "Unable to connect to real-time chat."
          );
        });

        socket.on("newMessage", (newMessage) => {
          setChatMessages((prev) => {
            const alreadyExists = prev.some(
              (message) =>
                message._id === newMessage._id
            );

            if (alreadyExists) {
              return prev;
            }

            return [...prev, newMessage];
          });

          scrollChatToBottom();
        });
      }

      const socket = socketRef.current;

      const joinChat = () => {
        socket.emit(
          "joinChat",
          request._id,
          (response) => {
            console.log(
              "CUSTOMER JOIN CHAT RESPONSE:",
              response
            );

            if (!response?.success) {
              setChatError(
                response?.message ||
                  "Failed to join chat"
              );
            }
          }
        );
      };

      if (socket.connected) {
        joinChat();
      } else {
        socket.once("connect", joinChat);
      }
    } catch (error) {
      console.error(
        "CUSTOMER OPEN CHAT ERROR:",
        error
      );

      setChatError(
        error.response?.data?.message ||
          error.message ||
          "Failed to open chat"
      );
    } finally {
      setChatLoading(false);
    }
  };

  const sendChatMessage = () => {
    const cleanMessage = chatInput.trim();

    if (!cleanMessage) return;

    if (!activeChatRequest?._id) return;

    if (!socketRef.current) {
      setChatError(
        "Chat connection is not available."
      );
      return;
    }

    if (!socketRef.current.connected) {
      setChatError(
        "Chat connection is not connected."
      );
      return;
    }

    if (cleanMessage.length > 1000) {
      setChatError(
        "Message cannot exceed 1000 characters."
      );
      return;
    }

    setChatSending(true);
    setChatError("");

    socketRef.current.emit(
      "sendMessage",
      {
        requestId: activeChatRequest._id,
        message: cleanMessage,
      },
      (response) => {
        console.log(
          "CUSTOMER SEND MESSAGE RESPONSE:",
          response
        );

        if (!response?.success) {
          setChatError(
            response?.message ||
              "Failed to send message"
          );

          setChatSending(false);
          return;
        }

        setChatInput("");
        setChatSending(false);
        scrollChatToBottom();
      }
    );
  };

  const handleChatKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    scrollChatToBottom();
  }, [chatMessages]);

  // =====================================================
  // STATUS
  // =====================================================

  const getStatusClass = (
    status
  ) => {
    switch (status) {
      case "pending":
        return "text-yellow-400";

      case "accepted":
        return "text-blue-400";

      case "in-progress":
        return "text-purple-400";

      case "completed":
        return "text-green-400";

      case "cancelled":
        return "text-red-400";

      default:
        return "text-slate-400";
    }
  };

  // =====================================================
  // PHOTO
  // =====================================================

  const getPhoto = (
    technician
  ) => {
    if (
      technician?.profilePhoto &&
      String(
        technician.profilePhoto
      ).trim()
    ) {
      return technician.profilePhoto;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      technician?.name ||
        "Technician"
    )}&background=2563eb&color=fff&size=200`;
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}

      <nav className="border-b border-white/10 px-6 md:px-8 py-5 flex justify-between items-center">

        <h1 className="text-2xl font-bold">
          Nearby
          <span className="text-blue-400">
            Fix
          </span>
        </h1>

        <div className="flex items-center gap-4">

          <span className="hidden md:block text-slate-400">
            {user?.name ||
              "Customer"}
          </span>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition"
          >
            Logout
          </button>

        </div>

      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* WELCOME */}

        <div className="mb-8">
          <p className="text-slate-400">
            Welcome back
          </p>

          <h2 className="text-4xl font-bold mt-1">
            {user?.name ||
              "Customer"}{" "}
            👋
          </h2>

          <p className="text-slate-400 mt-2">
            Find a trusted technician
            near you.
          </p>
        </div>

        {/* SEARCH */}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-10">

          <div className="flex items-center gap-3">

            <span className="text-2xl">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                handleSearch(
                  e.target.value
                )
              }
              placeholder="Search technician by name, skill or service..."
              className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-500 text-lg"
            />

          </div>

          <p className="text-sm text-slate-500 mt-3">
            Try: Ravi, electrician,
            plumber, mechanic, AC
            repair
          </p>

        </div>

        {/* QUICK ACTIONS */}

        <div className="grid md:grid-cols-3 gap-5 mb-12">

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

            <div className="text-4xl mb-4">
              🤖
            </div>

            <h3 className="text-xl font-semibold">
              AI Repair Assistant
            </h3>

            <p className="text-slate-400 mt-2">
              Describe your problem and
              find the right service.
            </p>

            <button
              onClick={() =>
                navigate("/ai")
              }
              className="mt-5 w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
            >
              Start AI Diagnosis
            </button>

          </div>

          <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6">

            <div className="text-4xl mb-4">
              🛠️
            </div>

            <h3 className="text-xl font-semibold">
              Find a Technician
            </h3>

            <p className="text-slate-400 mt-2">
              Search by technician name,
              skill or service.
            </p>

            <button
              onClick={() =>
                document
                  .getElementById(
                    "technicians"
                  )
                  ?.scrollIntoView({
                    behavior:
                      "smooth",
                  })
              }
              className="mt-5 w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
            >
              Browse Technicians
            </button>

          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

            <div className="text-4xl mb-4">
              📋
            </div>

            <h3 className="text-xl font-semibold">
              My Requests
            </h3>

            <p className="text-slate-400 mt-2">
              Track your service
              requests.
            </p>

            <button
              onClick={() =>
                document
                  .getElementById(
                    "my-requests"
                  )
                  ?.scrollIntoView({
                    behavior:
                      "smooth",
                  })
              }
              className="mt-5 w-full py-3 rounded-lg border border-white/20 hover:bg-white/10 transition"
            >
              View Requests
            </button>

          </div>

        </div>

        {/* TECHNICIANS */}

        <section id="technicians">

          <div className="flex justify-between items-center mb-5">

            <div>

              <h2 className="text-2xl font-bold">
                {search
                  ? "Search Results"
                  : "Recommended Technicians"}
              </h2>

              <p className="text-slate-400 mt-1">
                {technicians.length}{" "}
                technicians found
              </p>

            </div>

          </div>

          {loadingTechnicians ? (
            <div className="text-center py-16 text-slate-400">
              Loading technicians...
            </div>
          ) : technicians.length ===
            0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">

              <div className="text-5xl mb-4">
                🔎
              </div>

              <h3 className="text-xl font-semibold">
                No technicians found
              </h3>

              <p className="text-slate-400 mt-2">
                Try another name, skill
                or service.
              </p>

            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {technicians.map(
                (technician) => (
                  <div
                    key={
                      technician._id
                    }
                    className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/40 transition"
                  >

                    <div className="p-6 pb-3 flex items-center gap-4">

                      <img
                        src={getPhoto(
                          technician
                        )}
                        alt={
                          technician.name ||
                          "Technician"
                        }
                        className="w-20 h-20 rounded-full object-cover border-2 border-blue-500/40"
                      />

                      <div className="flex-1">

                        <div className="flex items-center gap-2">

                          <h3 className="text-lg font-semibold">
                            {
                              technician.name
                            }
                          </h3>

                          {technician.isAvailable && (
                            <span className="w-2.5 h-2.5 bg-green-400 rounded-full" />
                          )}

                        </div>

                        <p className="text-slate-400 text-sm mt-1">
                          {(
                            technician.serviceTypes ||
                            []
                          )
                            .map(
                              (service) =>
                                SERVICE_NAMES[
                                  service
                                ] ||
                                service
                            )
                            .join(", ") ||
                            "Technician"}
                        </p>

                      </div>

                    </div>

                    <div className="px-6 py-3 space-y-3">

                      <div className="flex justify-between">
                        <span className="text-slate-500">
                          Rating
                        </span>

                        <span>
                          ⭐{" "}
                          {technician.rating ||
                            "New"}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">
                          Experience
                        </span>

                        <span>
                          {technician.experience ||
                            0}{" "}
                          years
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">
                          Location
                        </span>

                        <span className="text-right">
                          {technician
                            .location
                            ?.city ||
                            "Nearby"}
                        </span>
                      </div>

                      {technician.skills
                        ?.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">

                          {technician.skills
                            .slice(0, 4)
                            .map(
                              (
                                skill,
                                index
                              ) => (
                                <span
                                  key={`${skill}-${index}`}
                                  className="px-2.5 py-1 text-xs rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20"
                                >
                                  {skill}
                                </span>
                              )
                            )}

                        </div>
                      )}

                    </div>

                    <div className="p-6 pt-4 flex gap-3">

                      <button
                        onClick={() =>
                          navigate(
                            `/technician/${technician._id}`
                          )
                        }
                        className="flex-1 py-2.5 rounded-lg border border-white/15 hover:bg-white/10 transition"
                      >
                        View Profile
                      </button>

                      <button
                        disabled={
                          technician.isAvailable ===
                          false
                        }
                        onClick={() =>
                          openRequestModal(
                            technician
                          )
                        }
                        className={`flex-1 py-2.5 rounded-lg transition ${
                          technician.isAvailable !==
                          false
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-slate-700 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {technician.isAvailable !==
                        false
                          ? "Request"
                          : "Offline"}
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* MY REQUESTS */}

        <section
          id="my-requests"
          className="mt-14"
        >

          <div className="mb-5">

            <h2 className="text-2xl font-bold">
              My Service Requests
            </h2>

            <p className="text-slate-400 mt-1">
              Track your service
              requests.
            </p>

          </div>

          {requests.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">

              <div className="text-4xl mb-3">
                📋
              </div>

              <p className="text-slate-400">
                You haven't created any
                requests yet.
              </p>

            </div>
          ) : (
            <div className="space-y-4">

              {requests.map(
                (request) => (
                  <div
                    key={
                      request._id
                    }
                    className="bg-white/5 border border-white/10 rounded-2xl p-5"
                  >

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                      <div>

                        <h3 className="font-semibold text-lg">
                          {
                            request.title
                          }
                        </h3>

                        <p className="text-slate-400 text-sm mt-1">
                          {
                            request.description
                          }
                        </p>

                        {request.technician && (
                          <p className="text-sm mt-3">
                            Technician:{" "}
                            <span className="text-blue-400">
                              {
                                request
                                  .technician
                                  .name
                              }
                            </span>
                          </p>
                        )}

                        <p className="text-xs text-slate-500 mt-2">
                          {SERVICE_NAMES[
                            request
                              .serviceType
                          ] ||
                            request.serviceType}
                        </p>

                      </div>

                      <div className="text-left md:text-right">

                        <p
                          className={`font-semibold capitalize ${getStatusClass(
                            request.status
                          )}`}
                        >
                          {String(
                            request.status ||
                              "pending"
                          ).replace(
                            "-",
                            " "
                          )}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {request.createdAt
                            ? new Date(
                                request.createdAt
                              ).toLocaleString()
                            : ""}
                        </p>

                        
                      </div>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* PROFILE */}

        <section className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6">

          <h3 className="text-xl font-semibold">
            Your Profile
          </h3>

          <div className="grid md:grid-cols-2 gap-5 mt-5">

            <div>
              <p className="text-slate-500 text-sm">
                Name
              </p>

              <p className="mt-1">
                {user?.name ||
                  "-"}
              </p>
            </div>

            <div>
              <p className="text-slate-500 text-sm">
                Email
              </p>

              <p className="mt-1">
                {user?.email ||
                  "-"}
              </p>
            </div>

            <div>
              <p className="text-slate-500 text-sm">
                Phone
              </p>

              <p className="mt-1">
                {user?.phone ||
                  "-"}
              </p>
            </div>

            <div>
              <p className="text-slate-500 text-sm">
                Account
              </p>

              <p className="mt-1 capitalize">
                {user?.role ||
                  "-"}
              </p>
            </div>

          </div>

        </section>

      </main>

      {/* ===================================================
          REQUEST MODAL
      =================================================== */}

      {showRequestModal &&
        selectedTechnician && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-2xl">

              <div className="p-6 border-b border-white/10 flex justify-between items-center">

                <div>

                  <h2 className="text-2xl font-bold">
                    Request Technician
                  </h2>

                  <p className="text-slate-400 mt-1">
                    Send your request to{" "}
                    <span className="text-blue-400">
                      {
                        selectedTechnician.name
                      }
                    </span>
                  </p>

                </div>

                <button
                  onClick={
                    closeRequestModal
                  }
                  disabled={
                    requestLoading
                  }
                  className="text-slate-400 hover:text-white text-2xl disabled:opacity-50"
                >
                  ×
                </button>

              </div>

              <form
                onSubmit={
                  handleSendRequest
                }
                className="p-6 space-y-5"
              >

                {/* SERVICE */}

                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Service
                  </label>

                  <select
                    name="serviceType"
                    value={
                      requestForm.serviceType
                    }
                    onChange={
                      handleFormChange
                    }
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                    required
                  >

                    <option value="">
                      Select service
                    </option>

                    {(
                      selectedTechnician.serviceTypes ||
                      []
                    ).map(
                      (service) => (
                        <option
                          key={
                            service
                          }
                          value={
                            service
                          }
                        >
                          {SERVICE_NAMES[
                            service
                          ] ||
                            service}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* TITLE */}

                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Problem
                  </label>

                  <input
                    name="title"
                    value={
                      requestForm.title
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Example: Ceiling fan not working"
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                    required
                  />

                </div>

                {/* DESCRIPTION */}

                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      requestForm.description
                    }
                    onChange={
                      handleFormChange
                    }
                    rows={4}
                    placeholder="Explain the problem..."
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-blue-500 resize-none"
                    required
                  />

                </div>

                {/* ADDRESS */}

                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Address
                  </label>

                  <input
                    name="address"
                    value={
                      requestForm.address
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="House / Street / Area"
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                  />

                </div>

                {/* CITY STATE PIN */}

                <div className="grid md:grid-cols-3 gap-3">

                  <input
                    name="city"
                    value={
                      requestForm.city
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="City"
                    className="bg-slate-800 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                  />

                  <input
                    name="state"
                    value={
                      requestForm.state
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="State"
                    className="bg-slate-800 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                  />

                  <input
                    name="pincode"
                    value={
                      requestForm.pincode
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Pincode"
                    className="bg-slate-800 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
                  />

                </div>

                {/* MESSAGE */}

                {message && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 text-blue-300">
                    {message}
                  </div>
                )}

                {/* BUTTON */}

                <button
                  type="submit"
                  disabled={
                    requestLoading
                  }
                  className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed font-semibold transition"
                >
                  {requestLoading
                    ? "Sending Request..."
                    : `Request ${selectedTechnician.name}`}
                </button>

              </form>

            </div>

          </div>
        )}

        {activeChatRequest && (
  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">

      {/* Chat Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            Chat with{" "}
            {activeChatRequest.technician?.name ||
              "Technician"}
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            {SERVICE_NAMES[
              activeChatRequest.serviceType
            ] ||
              activeChatRequest.serviceType}
          </p>
        </div>

        <button
          onClick={closeChat}
          className="text-slate-400 hover:text-white text-2xl"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="h-[420px] overflow-y-auto p-5 space-y-3">

        {chatLoading ? (
          <div className="h-full flex items-center justify-center text-slate-400">
            Loading chat...
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500">
            No messages yet. Start conversation...
          </div>
        ) : (
          chatMessages.map((chatMessage) => {
            const currentUserId =
              user?._id || user?.id;

            const senderId =
              chatMessage.sender?._id ||
              chatMessage.sender?.id ||
              chatMessage.sender;

            const isMine =
              String(senderId) ===
              String(currentUserId);

            return (
              <div
                key={chatMessage._id}
                className={`flex ${
                  isMine
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    isMine
                      ? "bg-blue-600"
                      : "bg-white/10"
                  }`}
                >

                  {!isMine && (
                    <p className="text-xs text-slate-400 mb-1">
                      {chatMessage.sender?.name ||
                        "Technician"}
                    </p>
                  )}

                  <p className="whitespace-pre-wrap break-words">
                    {chatMessage.message}
                  </p>

                  <p className="text-[10px] opacity-60 mt-1">
                    {chatMessage.createdAt
                      ? new Date(
                          chatMessage.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>

                </div>
              </div>
            );
          })
        )}

        <div ref={chatMessagesEndRef} />
      </div>

      {/* Error */}
      {chatError && (
        <div className="mx-5 mb-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-300 text-sm">
          {chatError}
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-white/10 flex gap-3">

        <textarea
          value={chatInput}
          onChange={(e) =>
            setChatInput(e.target.value)
          }
          onKeyDown={handleChatKeyDown}
          placeholder="Type your message..."
          rows={2}
          maxLength={1000}
          className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 resize-none"
        />

        <button
          onClick={sendChatMessage}
          disabled={
            chatSending ||
            !chatInput.trim()
          }
          className="px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed font-semibold"
        >
          {chatSending ? "..." : "Send"}
        </button>

      </div>

    </div>
  </div>
)}

    </div>
  );
};

export default CustomerDashboard;