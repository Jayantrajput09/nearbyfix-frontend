 
import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
 
import {
  getTechnicianProfile,
  getTechnicianRequests,
  acceptServiceRequest,
  updateTechnicianRequestStatus,
  getChatMessages,
} from "../services/api";

import { io } from "socket.io-client";
 
const Technician = () => { 
  const navigate = useNavigate(); 
 
  const [technician, setTechnician] = useState(null); 
  const [requests, setRequests] = useState([]); 
 
  const [loading, setLoading] = useState(true); 
  const [requestsLoading, setRequestsLoading] = useState(true); 
 
  const [error, setError] = useState(""); 
  const [requestError, setRequestError] = useState(""); 
 
  const [processingId, setProcessingId] = useState(null); 

  // CHAT
const [activeChatRequest, setActiveChatRequest] = useState(null);
const [chatMessages, setChatMessages] = useState([]);
const [chatInput, setChatInput] = useState("");
const [chatLoading, setChatLoading] = useState(false);
const [chatSending, setChatSending] = useState(false);
const [chatError, setChatError] = useState("");

const socketRef = useRef(null);
const chatMessagesEndRef = useRef(null);
 
  // ACCEPT MODAL 
  const [showAcceptModal, setShowAcceptModal] = useState(false); 
  const [selectedRequest, setSelectedRequest] = useState(null); 
  const [expectedTime, setExpectedTime] = useState(""); 
 
  // ===================================================== 
  // HELPERS 
  // ===================================================== 
 
  const getStatusClasses = (status) => { 
    switch (status) { 
      case "pending": 
        return "bg-amber-500/10 text-amber-300 border-amber-500/20"; 
 
      case "accepted": 
        return "bg-blue-500/10 text-blue-300 border-blue-500/20"; 
 
      case "on-the-way": 
        return "bg-purple-500/10 text-purple-300 border-purple-500/20"; 
 
      case "arrived": 
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"; 
 
      case "in-progress": 
        return "bg-orange-500/10 text-orange-300 border-orange-500/20"; 
 
      case "completed": 
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"; 
 
      case "cancelled": 
        return "bg-red-500/10 text-red-300 border-red-500/20"; 
 
      default: 
        return "bg-white/5 text-slate-300 border-white/10"; 
    } 
  }; 
 
  const getStatusIcon = (status) => { 
    switch (status) { 
      case "pending": 
        return "⏳"; 
      case "accepted": 
        return "✓"; 
      case "on-the-way": 
        return "🚗"; 
      case "arrived": 
        return "📍"; 
      case "in-progress": 
        return "🔧"; 
      case "completed": 
        return "🎉"; 
      case "cancelled": 
        return "✕"; 
      default: 
        return "•"; 
    } 
  }; 
 
  const formatStatus = (status) => { 
    if (!status) return "Unknown"; 
 
    return status 
      .replace(/-/g, " ") 
      .replace(/\b\w/g, (char) => char.toUpperCase()); 
  }; 
 
  const formatDate = (date) => { 
    if (!date) return ""; 
 
    try { 
      return new Date(date).toLocaleString("en-IN", { 
        dateStyle: "medium", 
        timeStyle: "short", 
      }); 
    } catch { 
      return ""; 
    } 
  }; 
 
  const getCustomer = (request) => { 
    return request?.user || request?.customer || {}; 
  }; 
 
  // ===================================================== 
  // LOAD TECHNICIAN PROFILE 
  // ===================================================== 
 
  const loadTechnicianProfile = async () => { 
    try { 
      const data = await getTechnicianProfile(); 
 
      console.log("TECHNICIAN PROFILE RESPONSE:", data); 
 
      if (!data?.success) { 
        throw new Error( 
          data?.message || "Failed to load technician profile" 
        ); 
      } 
 
      const technicianData = data.user || data.technician; 
 
      if (!technicianData) { 
        throw new Error("Technician profile data missing"); 
      } 
 
      setTechnician(technicianData); 
    } catch (err) { 
      console.error("LOAD TECHNICIAN PROFILE ERROR:", err); 
 
      if (err.response?.status === 401) { 
        localStorage.removeItem("nearbyfix_token"); 
        localStorage.removeItem("nearbyfix_user"); 
 
        navigate("/login", { 
          replace: true, 
        }); 
 
        return; 
      } 
 
      setError( 
        err.response?.data?.message || 
          err.message || 
          "Failed to load technician profile" 
      ); 
    } 
  }; 
 
  // ===================================================== 
  // LOAD REQUESTS 
  // ===================================================== 
 
  const loadRequests = async () => { 
    try { 
      setRequestsLoading(true); 
      setRequestError(""); 
 
      const data = await getTechnicianRequests(); 
 
      console.log("TECHNICIAN REQUESTS RESPONSE:", data); 
 
      if (!data?.success) { 
        throw new Error( 
          data?.message || "Failed to load requests" 
        ); 
      } 
 
      setRequests( 
        Array.isArray(data.requests) ? data.requests : [] 
      ); 
    } catch (err) { 
      console.error( 
        "LOAD TECHNICIAN REQUESTS ERROR:", 
        err 
      ); 
 
      if (err.response?.status === 401) { 
        localStorage.removeItem("nearbyfix_token"); 
        localStorage.removeItem("nearbyfix_user"); 
 
        navigate("/login", { 
          replace: true, 
        }); 
 
        return; 
      } 
 
      setRequestError( 
        err.response?.data?.message || 
          err.message || 
          "Failed to load service requests" 
      ); 
    } finally { 
      setRequestsLoading(false); 
    } 
  }; 
 
  // ===================================================== 
  // INITIAL LOAD 
  // ===================================================== 
 
  useEffect(() => { 
    const loadDashboard = async () => { 
      setLoading(true); 
      setError(""); 
 
      await Promise.all([ 
        loadTechnicianProfile(), 
        loadRequests(), 
      ]); 
 
      setLoading(false); 
    }; 
 
    loadDashboard(); 
  }, []); 
 
  // ===================================================== 
  // OPEN ACCEPT MODAL 
  // ===================================================== 
 
  const handleAccept = (request) => { 
    if (!request?._id) { 
      setRequestError("Request ID is missing"); 
      return; 
    } 
 
    setRequestError(""); 
    setSelectedRequest(request); 
    setExpectedTime(""); 
    setShowAcceptModal(true); 
  }; 
 
  // ===================================================== 
  // CLOSE ACCEPT MODAL 
  // ===================================================== 
 
  const closeAcceptModal = () => { 
    if (processingId) return; 
 
    setShowAcceptModal(false); 
    setSelectedRequest(null); 
    setExpectedTime(""); 
  }; 
 
  // ===================================================== 
  // CONFIRM ACCEPT 
  // ===================================================== 
 
  const confirmAccept = async () => { 
    if (!selectedRequest?._id) { 
      setRequestError("Request ID is missing"); 
      return; 
    } 
 
    if (!expectedTime.trim()) { 
      setRequestError( 
        "Please enter the expected arrival time." 
      ); 
      return; 
    } 
 
    try { 
      setProcessingId(selectedRequest._id); 
      setRequestError(""); 
 
      console.log( 
        "ACCEPTING REQUEST:", 
        selectedRequest._id 
      ); 
 
      console.log( 
        "EXPECTED TIME:", 
        expectedTime 
      ); 
 
      const data = await acceptServiceRequest( 
        selectedRequest._id, 
        expectedTime.trim() 
      ); 
 
      console.log( 
        "ACCEPT REQUEST RESPONSE:", 
        data 
      ); 
 
      if (!data?.success) { 
        throw new Error( 
          data?.message || 
            "Failed to accept request" 
        ); 
      } 
 
      setShowAcceptModal(false); 
      setSelectedRequest(null); 
      setExpectedTime(""); 
 
      await loadRequests(); 
    } catch (err) { 
      console.error( 
        "ACCEPT REQUEST ERROR:", 
        err 
      ); 
 
      setRequestError( 
        err.response?.data?.message || 
          err.message || 
          "Failed to accept request" 
      ); 
    } finally { 
      setProcessingId(null); 
    } 
  }; 
 
  // ===================================================== 
  // UPDATE REQUEST STATUS 
  // ===================================================== 
 
  const handleStatusChange = async ( 
    requestId, 
    status 
  ) => { 
    if (!requestId) { 
      setRequestError("Request ID is missing"); 
      return; 
    } 
 
    try { 
      setProcessingId(requestId); 
      setRequestError(""); 
 
      const data = 
        await updateTechnicianRequestStatus( 
          requestId, 
          status 
        ); 
 
      console.log( 
        "STATUS UPDATE RESPONSE:", 
        data 
      ); 
 
      if (!data?.success) { 
        throw new Error( 
          data?.message || 
            "Failed to update request" 
        ); 
      } 
 
      await loadRequests(); 
    } catch (err) { 
      console.error( 
        "UPDATE REQUEST STATUS ERROR:", 
        err 
      ); 
 
      setRequestError( 
        err.response?.data?.message || 
          err.message || 
          "Failed to update request" 
      ); 
    } finally { 
      setProcessingId(null); 
    } 
  }; 

  // =====================================================
// CHAT
// =====================================================

const scrollChatToBottom = () => {
  setTimeout(() => {
    chatMessagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, 50);
};

const closeChat = () => {
  if (socketRef.current && activeChatRequest?._id) {
    socketRef.current.emit(
      "leaveChat",
      activeChatRequest._id
    );
  }

  setActiveChatRequest(null);
  setChatMessages([]);
  setChatInput("");
  setChatError("");
};

const openChat = async (request) => {
  if (!request?._id) {
    return;
  }

  if (!request.technician) {
    setRequestError(
      "Chat is available after accepting the request."
    );
    return;
  }

  try {
    setChatLoading(true);
    setChatError("");
    setChatMessages([]);

    setActiveChatRequest(request);

    const data = await getChatMessages(
      request._id
    );

    if (!data?.success) {
      throw new Error(
        data?.message ||
          "Failed to load chat messages"
      );
    }

    setChatMessages(
      Array.isArray(data.messages)
        ? data.messages
        : []
    );

    scrollChatToBottom();

    if (!socketRef.current) {
      const token = localStorage.getItem(
        "nearbyfix_token"
      );

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
          "CHAT SOCKET CONNECTED:",
          socket.id
        );
      });

      socket.on("connect_error", (error) => {
        console.error(
          "CHAT SOCKET ERROR:",
          error
        );

        setChatError(
          "Unable to connect to real-time chat."
        );
      });

      socket.on(
        "newMessage",
        (newMessage) => {
          setChatMessages((prev) => {
            const alreadyExists =
              prev.some(
                (message) =>
                  message._id ===
                  newMessage._id
              );

            if (alreadyExists) {
              return prev;
            }

            return [
              ...prev,
              newMessage,
            ];
          });

          scrollChatToBottom();
        }
      );
    }

    const socket = socketRef.current;

    const joinChat = () => {
      socket.emit(
        "joinChat",
        request._id,
        (response) => {
          console.log(
            "JOIN CHAT RESPONSE:",
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
      socket.once(
        "connect",
        joinChat
      );
    }
  } catch (err) {
    console.error(
      "OPEN CHAT ERROR:",
      err
    );

    setChatError(
      err.response?.data?.message ||
        err.message ||
        "Failed to open chat"
    );
  } finally {
    setChatLoading(false);
  }
};

const sendChatMessage = () => {
  const message = chatInput.trim();

  if (!message) {
    return;
  }

  if (!activeChatRequest?._id) {
    return;
  }

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

  if (message.length > 1000) {
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
      requestId:
        activeChatRequest._id,
      message,
    },
    (response) => {
      console.log(
        "SEND MESSAGE RESPONSE:",
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
  if (
    e.key === "Enter" &&
    !e.shiftKey
  ) {
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
  // LOGOUT 
  // ===================================================== 
 
  const handleLogout = () => { 
    localStorage.removeItem("nearbyfix_token"); 
    localStorage.removeItem("nearbyfix_user"); 
 
    navigate("/login", { 
      replace: true, 
    }); 
  }; 
 
  // ===================================================== 
  // DATA 
  // ===================================================== 
 
  const serviceTypes = Array.isArray( 
    technician?.serviceTypes 
  ) 
    ? technician.serviceTypes 
    : []; 
 
  const skills = Array.isArray( 
    technician?.skills 
  ) 
    ? technician.skills 
    : []; 
 
  const available = 
    technician?.isAvailable !== false; 
 
  // ===================================================== 
  // REQUEST STATS 
  // ===================================================== 
 
  const requestStats = useMemo(() => { 
    return { 
      total: requests.length, 
 
      pending: requests.filter( 
        (r) => r.status === "pending" 
      ).length, 
 
      active: requests.filter( 
        (r) => 
          [ 
            "accepted", 
            "on-the-way", 
            "arrived", 
            "in-progress", 
          ].includes(r.status) 
      ).length, 
 
      completed: requests.filter( 
        (r) => r.status === "completed" 
      ).length, 
    }; 
  }, [requests]); 
 
  // ===================================================== 
  // LOADING SCREEN 
  // ===================================================== 
 
  if (loading) { 
    return ( 
      <div className="min-h-screen bg-[#050b14] text-white flex items-center justify-center px-5"> 
        <div className="text-center"> 
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-3xl animate-pulse"> 
            🔧 
          </div> 
 
          <h2 className="mt-5 text-xl font-bold"> 
            Loading dashboard 
          </h2> 
 
          <p className="mt-2 text-slate-500"> 
            Preparing your technician workspace... 
          </p> 
        </div> 
      </div> 
    ); 
  } 
 
  // ===================================================== 
  // ERROR SCREEN 
  // ===================================================== 
 
  if (error || !technician) { 
    return ( 
      <div className="min-h-screen bg-[#050b14] text-white flex items-center justify-center px-5"> 
        <div className="max-w-md w-full rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center"> 
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center text-3xl"> 
            ⚠️ 
          </div> 
 
          <h1 className="text-2xl font-black mt-5"> 
            Dashboard Error 
          </h1> 
 
          <p className="text-red-300 mt-3"> 
            {error || 
              "Technician profile not found"} 
          </p> 
 
          <button 
            onClick={() => 
              window.location.reload() 
            } 
            className="mt-6 w-full px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold transition" 
          > 
            Try Again 
          </button> 
        </div> 
      </div> 
    ); 
  } 
 
  // ===================================================== 
  // DASHBOARD 
  // ===================================================== 
 
  return ( 
    <div className="min-h-screen bg-[#050b14] text-white"> 
 
      {/* BACKGROUND */} 
 
      <div className="fixed inset-0 pointer-events-none overflow-hidden"> 
        <div className="absolute top-[-200px] left-[-150px] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" /> 
        <div className="absolute top-[30%] right-[-200px] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" /> 
      </div> 
 
      {/* HEADER */} 
 
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#050b14]/85 backdrop-blur-2xl"> 
 
        <div className="max-w-7xl mx-auto px-4 sm:px-5 py-3 sm:py-4"> 
 
          <div className="flex items-center justify-between gap-3"> 
 
            {/* LOGO */} 
 
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0"> 
 
              <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-blue-500/20"> 
                🔧 
              </div> 
 
              <div className="min-w-0"> 
                <div className="text-lg sm:text-xl font-black tracking-tight"> 
                  Nearby 
                  <span className="text-blue-400"> 
                    Fix 
                  </span> 
                </div> 
 
                <p className="text-[9px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-500"> 
                  Technician 
                </p> 
              </div> 
 
            </div> 
 
            {/* ACTIONS */} 
 
            <div className="flex items-center gap-2 shrink-0"> 
 
              {/* PROFILE 
                  Mobile: icon only 
                  Desktop: icon + text 
              */} 
 
              <button 
                onClick={() => 
                  navigate("/profile") 
                } 
                aria-label="Profile" 
                title="Profile" 
                className="flex items-center justify-center gap-2 w-10 sm:w-auto sm:px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition text-sm font-semibold" 
              > 
                <span className="text-base"> 
                  👤 
                </span> 
 
                <span className="hidden sm:inline"> 
                  Profile 
                </span> 
              </button> 
 
              {/* LOGOUT */} 
 
              <button 
                onClick={handleLogout} 
                className="px-3 sm:px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition text-xs sm:text-sm font-semibold" 
              > 
                Logout 
              </button> 
 
            </div> 
 
          </div> 
 
        </div> 
      </header> 
 
      {/* MAIN */} 
 
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-5 py-6 sm:py-8"> 
 
        {/* HERO */} 
 
        <section className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] border border-white/10 bg-gradient-to-br from-blue-500/[0.10] via-white/[0.03] to-purple-500/[0.06] p-5 sm:p-7 md:p-9"> 
 
          <div className="absolute right-[-80px] top-[-100px] w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" /> 
 
          <div className="relative flex flex-col md:flex-row md:items-center gap-5 sm:gap-6"> 
 
            {/* PROFILE IMAGE */} 
 
            {technician.profilePhoto ? ( 
              <img 
                src={technician.profilePhoto} 
                alt={ 
                  technician.name || 
                  "Technician" 
                } 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border border-white/10 shadow-xl" 
              /> 
            ) : ( 
              <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-3xl sm:text-4xl"> 
                🔧 
              </div> 
            )} 
 
            {/* INFO */} 
 
            <div className="flex-1 min-w-0"> 
 
              <div className="flex flex-wrap items-center gap-2 sm:gap-3"> 
 
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight break-words"> 
                  Welcome,{" "} 
                  {technician.name || 
                    "Technician"} 
                </h1> 
 
                <span 
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border ${ 
                    available 
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" 
                      : "bg-red-500/10 text-red-300 border-red-500/20" 
                  }`} 
                > 
                  ●{" "} 
                  {available 
                    ? "Available" 
                    : "Unavailable"} 
                </span> 
 
              </div> 
 
              <p className="text-slate-400 mt-3 max-w-2xl leading-relaxed text-sm sm:text-base"> 
                {technician.bio || 
                  "Manage customer requests, update service status and keep customers informed."} 
              </p> 
 
            </div> 
 
          </div> 
 
        </section> 
 
        {/* STATS */} 
 
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5 sm:mt-6"> 
 
          {/* TOTAL */} 
 
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 hover:bg-white/[0.05] transition"> 
 
            <div className="flex items-center justify-between"> 
 
              <span className="text-xs sm:text-sm text-slate-500"> 
                Total 
              </span> 
 
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500/10 flex items-center justify-center"> 
                📋 
              </span> 
 
            </div> 
 
            <p className="text-2xl sm:text-3xl font-black mt-3 sm:mt-4"> 
              {requestStats.total} 
            </p> 
 
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1"> 
              Service requests 
            </p> 
 
          </div> 
 
          {/* PENDING */} 
 
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 hover:bg-white/[0.05] transition"> 
 
            <div className="flex items-center justify-between"> 
 
              <span className="text-xs sm:text-sm text-slate-500"> 
                Pending 
              </span> 
 
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 flex items-center justify-center"> 
                ⏳ 
              </span> 
 
            </div> 
 
            <p className="text-2xl sm:text-3xl font-black mt-3 sm:mt-4 text-amber-300"> 
              {requestStats.pending} 
            </p> 
 
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1"> 
              Waiting for action 
            </p> 
 
          </div> 
 
          {/* ACTIVE */} 
 
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 hover:bg-white/[0.05] transition"> 
 
            <div className="flex items-center justify-between"> 
 
              <span className="text-xs sm:text-sm text-slate-500"> 
                Active 
              </span> 
 
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-500/10 flex items-center justify-center"> 
                ⚡ 
              </span> 
 
            </div> 
 
            <p className="text-2xl sm:text-3xl font-black mt-3 sm:mt-4 text-purple-300"> 
              {requestStats.active} 
            </p> 
 
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1"> 
              In progress 
            </p> 
 
          </div> 
 
          {/* COMPLETED */} 
 
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 hover:bg-white/[0.05] transition"> 
 
            <div className="flex items-center justify-between"> 
 
              <span className="text-xs sm:text-sm text-slate-500"> 
                Completed 
              </span> 
 
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center"> 
                ✓ 
              </span> 
 
            </div> 
 
            <p className="text-2xl sm:text-3xl font-black mt-3 sm:mt-4 text-emerald-300"> 
              {requestStats.completed} 
            </p> 
 
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1"> 
              Successfully finished 
            </p> 
 
          </div> 
 
        </section> 
 
        {/* SERVICES + SKILLS */} 
 
        <section className="grid lg:grid-cols-2 gap-4 sm:gap-5 mt-5 sm:mt-6"> 
 
          {/* SERVICES */} 
 
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"> 
 
            <div className="flex items-center justify-between"> 
 
              <div> 
                <h2 className="text-lg font-bold"> 
                  My Services 
                </h2> 
 
                <p className="text-sm text-slate-500 mt-1"> 
                  Services you provide 
                </p> 
              </div> 
 
              <span className="text-2xl"> 
                🛠️ 
              </span> 
 
            </div> 
 
            {serviceTypes.length > 0 ? ( 
              <div className="flex flex-wrap gap-2 mt-5"> 
 
                {serviceTypes.map( 
                  (service, index) => ( 
                    <span 
                      key={`${service}-${index}`} 
                      className="px-3.5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium capitalize" 
                    > 
                      {String(service).replace( 
                        /-/g, 
                        " " 
                      )} 
                    </span> 
                  ) 
                )} 
 
              </div> 
            ) : ( 
              <p className="text-slate-500 mt-5"> 
                No services added yet. 
              </p> 
            )} 
 
          </div> 
 
          {/* SKILLS */} 
 
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"> 
 
            <div className="flex items-center justify-between"> 
 
              <div> 
                <h2 className="text-lg font-bold"> 
                  Skills 
                </h2> 
 
                <p className="text-sm text-slate-500 mt-1"> 
                  Your professional skills 
                </p> 
              </div> 
 
              <span className="text-2xl"> 
                ⚙️ 
              </span> 
 
            </div> 
 
            {skills.length > 0 ? ( 
              <div className="flex flex-wrap gap-2 mt-5"> 
 
                {skills.map( 
                  (skill, index) => ( 
                    <span 
                      key={`${skill}-${index}`} 
                      className="px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 text-sm capitalize" 
                    > 
                      {String(skill)} 
                    </span> 
                  ) 
                )} 
 
              </div> 
            ) : ( 
              <p className="text-slate-500 mt-5"> 
                No skills added yet. 
              </p> 
            )} 
 
          </div> 
 
        </section> 
 
        {/* REQUEST ERROR */} 
 
        {requestError && ( 
          <div className="mt-5 sm:mt-6 flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300"> 
 
            <span className="text-lg"> 
              ⚠️ 
            </span> 
 
            <div className="flex-1 text-sm"> 
              {requestError} 
            </div> 
 
            <button 
              onClick={() => 
                setRequestError("") 
              } 
              className="text-red-300 hover:text-white" 
            > 
              ✕ 
            </button> 
 
          </div> 
        )} 
 
        {/* REQUEST HEADER */} 
 
        <section className="mt-8 sm:mt-10"> 
 
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5"> 
 
            <div> 
              <div className="flex items-center gap-3"> 
 
                <h2 className="text-2xl md:text-3xl font-black"> 
                  Service Requests 
                </h2> 
 
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400"> 
                  {requests.length} 
                </span> 
 
              </div> 
 
              <p className="text-slate-500 mt-1 text-sm sm:text-base"> 
                Manage customer requests and keep them updated. 
              </p> 
            </div> 
 
            <button 
              onClick={loadRequests} 
              disabled={requestsLoading} 
              className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition text-sm font-semibold disabled:opacity-50" 
            > 
              {requestsLoading 
                ? "Refreshing..." 
                : "↻ Refresh"} 
            </button> 
 
          </div> 
 
          {/* REQUEST LOADING */} 
 
          {requestsLoading ? ( 
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 sm:p-12 text-center"> 
 
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center text-2xl animate-pulse"> 
                🔄 
              </div> 
 
              <p className="text-slate-400 mt-4"> 
                Loading service requests... 
              </p> 
 
            </div> 
          ) : requests.length === 0 ? ( 
 
            /* EMPTY */ 
 
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 sm:p-12 text-center"> 
 
              <div className="w-20 h-20 mx-auto rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-4xl"> 
                📭 
              </div> 
 
              <h3 className="text-xl font-bold mt-5"> 
                No service requests 
              </h3> 
 
              <p className="text-slate-500 mt-2 max-w-md mx-auto"> 
                New customer requests will appear here automatically. 
              </p> 
 
              <button 
                onClick={loadRequests} 
                className="mt-6 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold transition" 
              > 
                Check Again 
              </button> 
 
            </div> 
          ) : ( 
 
            /* REQUEST LIST */ 
 
            <div className="space-y-5"> 
 
              {requests.map((request) => { 
 
                const customer = 
                  getCustomer(request); 
 
                const isPending = 
                  request.status === "pending"; 
 
                const isAssignedToMe = 
                  request.technician && 
                  ( 
                    request.technician?._id === 
                      technician._id || 
                    request.technician === 
                      technician._id 
                  ); 
 
                const isProcessing = 
                  processingId === 
                  request._id; 
 
                return ( 
                  <article 
                    key={request._id} 
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] hover:bg-white/[0.04] transition" 
                  > 
 
                    {/* TOP ACCENT */} 
 
                    <div 
                      className={`h-1 w-full ${ 
                        request.status === 
                        "pending" 
                          ? "bg-amber-500" 
                          : request.status === 
                            "completed" 
                          ? "bg-emerald-500" 
                          : "bg-blue-500" 
                      }`} 
                    /> 
 
                    <div className="p-5 sm:p-6 md:p-7"> 
 
                      {/* HEADER */} 
 
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5"> 
 
                        <div className="flex gap-4 min-w-0"> 
 
                          <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl sm:text-2xl"> 
                            {request.serviceType === 
                            "electrician" 
                              ? "⚡" 
                              : request.serviceType === 
                                "plumber" 
                              ? "🚰" 
                              : request.serviceType === 
                                "ac-repair" 
                              ? "❄️" 
                              : request.serviceType === 
                                "carpenter" 
                              ? "🪚" 
                              : request.serviceType === 
                                "mechanic" 
                              ? "🔩" 
                              : "🛠️"} 
                          </div> 
 
                          <div className="min-w-0"> 
 
                            <div className="flex flex-wrap items-center gap-2"> 
 
                              <h3 className="text-lg sm:text-xl font-bold capitalize break-words"> 
                                {request.serviceType 
                                  ?.replace( 
                                    /-/g, 
                                    " " 
                                  ) || 
                                  "Service Request"} 
                              </h3> 
 
                              <span 
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${getStatusClasses( 
                                  request.status 
                                )}`} 
                              > 
                                {getStatusIcon( 
                                  request.status 
                                )} 
 
                                {formatStatus( 
                                  request.status 
                                )} 
                              </span> 
 
                            </div> 
 
                            <p className="text-xs text-slate-500 mt-2"> 
                              Request created{" "} 
                              {formatDate( 
                                request.createdAt 
                              )} 
                            </p> 
 
                          </div> 
 
                        </div> 
 
                        {/* ACCEPT */} 
 
                        {isPending && ( 
                          <button 
                            onClick={() => 
                              handleAccept( 
                                request 
                              ) 
                            } 
                            disabled={ 
                              isProcessing 
                            } 
                            className="w-full lg:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition" 
                          > 
                            {isProcessing 
                              ? "Processing..." 
                              : "✓ Accept Request"} 
                          </button> 
                        )} 
 
                      </div> 
 
                      {/* EXPECTED TIME */} 
 
                      {request.expectedTime && ( 
                        <div className="mt-5 flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/[0.07] border border-emerald-500/20"> 
 
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"> 
                            ⏱️ 
                          </div> 
 
                          <div> 
                            <p className="text-xs text-emerald-400"> 
                              Expected Arrival 
                            </p> 
 
                            <p className="font-bold text-emerald-200 mt-0.5"> 
                              {request.expectedTime} 
                            </p> 
                          </div> 
 
                        </div> 
                      )} 
 
                      {/* CUSTOMER + PROBLEM */} 
 
                      <div className="grid lg:grid-cols-2 gap-4 mt-6"> 
 
                        {/* CUSTOMER */} 
 
                        <div className="rounded-2xl border border-white/10 bg-black/10 p-5"> 
 
                          <div className="flex items-center gap-2 mb-4"> 
 
                            <span className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center"> 
                              👤 
                            </span> 
 
                            <div> 
                              <h4 className="font-bold"> 
                                Customer 
                              </h4> 
 
                              <p className="text-xs text-slate-500"> 
                                Contact information 
                              </p> 
                            </div> 
 
                          </div> 
 
                          <div className="space-y-2.5 text-sm"> 
 
                            <p> 
                              <span className="text-slate-500"> 
                                Name: 
                              </span>{" "} 
                              <span className="text-slate-200"> 
                                {customer.name || 
                                  "Customer"} 
                              </span> 
                            </p> 
 
                            {customer.phone && ( 
                              <p> 
                                <span className="text-slate-500"> 
                                  Phone: 
                                </span>{" "} 
                                <span className="text-slate-200"> 
                                  {customer.phone} 
                                </span> 
                              </p> 
                            )} 
 
                            {customer.email && ( 
                              <p className="break-all"> 
                                <span className="text-slate-500"> 
                                  Email: 
                                </span>{" "} 
                                <span className="text-slate-200"> 
                                  {customer.email} 
                                </span> 
                              </p> 
                            )} 
 
                          </div> 
 
                        </div> 
 
                        {/* PROBLEM */} 
 
                        <div className="rounded-2xl border border-white/10 bg-black/10 p-5"> 
 
                          <div className="flex items-center gap-2 mb-4"> 
 
                            <span className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center"> 
                              📝 
                            </span> 
 
                            <div> 
                              <h4 className="font-bold"> 
                                Problem 
                              </h4> 
 
                              <p className="text-xs text-slate-500"> 
                                Customer description 
                              </p> 
                            </div> 
 
                          </div> 
 
                          <p className="text-sm text-slate-400 leading-relaxed"> 
                            {request.description || 
                              "No description provided."} 
                          </p> 
 
                        </div> 
 
                      </div> 
 
                      {/* LOCATION */} 
 
                      {request.location && ( 
                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-5"> 
 
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"> 
 
                            <div className="flex items-start gap-3"> 
 
                              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0"> 
                                📍 
                              </div> 
 
                              <div className="min-w-0"> 
 
                                <p className="text-sm font-bold"> 
                                  Customer Location 
                                </p> 
 
                                <p className="text-sm text-slate-400 mt-1 break-words"> 
                                  {[ 
                                    request.location.address, 
                                    request.location.city, 
                                    request.location.state, 
                                    request.location.pincode, 
                                  ] 
                                    .filter(Boolean) 
                                    .join(", ") || 
                                    "Location not provided"} 
                                </p> 
 
                              </div> 
 
                            </div> 
 
                          </div> 
 
                        </div> 
                      )} 

                      {/* CHAT */}

{isAssignedToMe && (
  <div className="mt-6 pt-5 border-t border-white/10">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h4 className="font-bold">
          Chat with Customer
        </h4>

        <p className="text-xs text-slate-500 mt-1">
          Talk to the customer in real time.
        </p>
      </div>

      <button
        onClick={() =>
          openChat(request)
        }
        className="px-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 font-semibold text-sm transition"
      >
        💬 Open Chat
      </button>
    </div>
  </div>
)}
 
                      {/* STATUS ACTIONS */} 
 
                      {isAssignedToMe && 
                        request.status !== 
                          "completed" && 
                        request.status !== 
                          "cancelled" && ( 
 
                          <div className="mt-6 pt-5 border-t border-white/10"> 
 
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"> 
 
                              <div> 
                                <h4 className="font-bold"> 
                                  Service Progress 
                                </h4> 
 
                                <p className="text-xs text-slate-500 mt-1"> 
                                  Keep the customer updated as you proceed. 
                                </p> 
                              </div> 
 
                              <div className="flex flex-wrap gap-2"> 
 
                                {request.status === 
                                  "accepted" && ( 
                                  <button 
                                    onClick={() => 
                                      handleStatusChange( 
                                        request._id, 
                                        "on-the-way" 
                                      ) 
                                    } 
                                    disabled={ 
                                      isProcessing 
                                    } 
                                    className="px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 disabled:opacity-50 font-semibold text-sm transition" 
                                  > 
                                    🚗 On The Way 
                                  </button> 
                                )} 
 
                                {request.status === 
                                  "on-the-way" && ( 
                                  <button 
                                    onClick={() => 
                                      handleStatusChange( 
                                        request._id, 
                                        "arrived" 
                                      ) 
                                    } 
                                    disabled={ 
                                      isProcessing 
                                    } 
                                    className="px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50 font-semibold text-sm transition" 
                                  > 
                                    📍 Arrived 
                                  </button> 
                                )} 
 
                                {request.status === 
                                  "arrived" && ( 
                                  <button 
                                    onClick={() => 
                                      handleStatusChange( 
                                        request._id, 
                                        "in-progress" 
                                      ) 
                                    } 
                                    disabled={ 
                                      isProcessing 
                                    } 
                                    className="px-4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 hover:bg-orange-500/20 disabled:opacity-50 font-semibold text-sm transition" 
                                  > 
                                    🔧 Start Work 
                                  </button> 
                                )} 
 
                                {request.status === 
                                  "in-progress" && ( 
                                  <button 
                                    onClick={() => 
                                      handleStatusChange( 
                                        request._id, 
                                        "completed" 
                                      ) 
                                    } 
                                    disabled={ 
                                      isProcessing 
                                    } 
                                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-bold text-sm transition shadow-lg shadow-emerald-600/10" 
                                  > 
                                    ✓ Complete Job 
                                  </button> 
                                )} 
 
                              </div> 
 
                            </div> 
 
                          </div> 
                        )} 
 
                    </div> 
                  </article> 
                ); 
              })} 
 
            </div> 
          )} 
 
        </section> 
 
      </main> 
 
      {/* ACCEPT REQUEST MODAL */} 
 
      {showAcceptModal && selectedRequest && ( 
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"> 
 
          {/* BACKDROP */} 
 
          <button 
            type="button" 
            aria-label="Close modal" 
            onClick={closeAcceptModal} 
            className="absolute inset-0 bg-black/75 backdrop-blur-sm cursor-default" 
          /> 
 
          {/* MODAL */} 
 
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[28px] border border-white/10 bg-[#0b1422] shadow-2xl shadow-black/50"> 
 
            {/* TOP */} 
 
            <div className="p-5 sm:p-6 md:p-7 border-b border-white/10"> 
 
              <div className="flex items-start justify-between gap-4"> 
 
                <div className="flex items-center gap-3"> 
 
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl"> 
                    ✓ 
                  </div> 
 
                  <div> 
                    <h2 className="text-xl font-black"> 
                      Accept Request 
                    </h2> 
 
                    <p className="text-sm text-slate-500 mt-1"> 
                      Set your expected arrival time 
                    </p> 
                  </div> 
 
                </div> 
 
                <button 
                  onClick={closeAcceptModal} 
                  disabled={!!processingId} 
                  className="w-9 h-9 shrink-0 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition disabled:opacity-50" 
                > 
                  ✕ 
                </button> 
 
              </div> 
 
            </div> 
 
            {/* BODY */} 
 
            <div className="p-5 sm:p-6 md:p-7"> 
 
              {/* REQUEST SUMMARY */} 
 
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 mb-6"> 
 
                <div className="flex items-center gap-3"> 
 
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center text-xl"> 
                    🛠️ 
                  </div> 
 
                  <div className="min-w-0"> 
 
                    <p className="font-bold capitalize break-words"> 
                      {selectedRequest.serviceType 
                        ?.replace( 
                          /-/g, 
                          " " 
                        ) || 
                        "Service Request"} 
                    </p> 
 
                    <p className="text-xs text-slate-500 mt-1"> 
                      Customer:{" "} 
                      {getCustomer( 
                        selectedRequest 
                      ).name || 
                        "Customer"} 
                    </p> 
 
                  </div> 
 
                </div> 
 
              </div> 
 
              {/* EXPECTED TIME */} 
 
              <label className="block"> 
 
                <div className="flex items-center justify-between mb-2"> 
 
                  <span className="font-bold"> 
                    Expected Arrival Time 
                  </span> 
 
                  <span className="text-xs text-blue-400"> 
                    Required 
                  </span> 
 
                </div> 
 
                <input 
                  type="text" 
                  value={expectedTime} 
                  onChange={(e) => 
                    setExpectedTime( 
                      e.target.value 
                    ) 
                  } 
                  onKeyDown={(e) => { 
                    if ( 
                      e.key === "Enter" 
                    ) { 
                      confirmAccept(); 
                    } 
                  }} 
                  placeholder="e.g. 30 minutes, 1 hour, 5:30 PM" 
                  className="w-full px-4 py-3.5 rounded-2xl bg-black/20 border border-white/10 outline-none text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition" 
                  autoFocus 
                /> 
 
                <p className="text-xs text-slate-500 mt-2"> 
                  This information will be shared with the customer through email. 
                </p> 
 
              </label> 
 
              {/* ERROR */} 
 
              {requestError && ( 
                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm"> 
                  ⚠️ {requestError} 
                </div> 
              )} 
 
            </div> 
 
            {/* FOOTER */} 
 
            <div className="p-5 sm:p-6 md:p-7 pt-0 flex flex-col sm:flex-row gap-3"> 
 
              <button 
                onClick={closeAcceptModal} 
                disabled={!!processingId} 
                className="flex-1 px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition font-semibold disabled:opacity-50" 
              > 
                Cancel 
              </button> 
 
              <button 
                onClick={confirmAccept} 
                disabled={ 
                  !!processingId || 
                  !expectedTime.trim() 
                } 
                className="flex-1 px-5 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition shadow-lg shadow-blue-600/20" 
              > 
                {processingId 
                  ? "Accepting..." 
                  : "✓ Confirm & Accept"} 
              </button> 
 
            </div> 
 
          </div> 
        </div> 
      )} 

      {/* Chat Modal */}
{activeChatRequest && (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
    {/* Background */}
    <button
      type="button"
      aria-label="Close chat"
      onClick={closeChat}
      className="absolute inset-0 bg-black/75 backdrop-blur-sm"
    />

    {/* Chat Box */}
    <div className="relative w-full max-w-2xl h-[80vh] max-h-[700px] rounded-[28px] border border-white/10 bg-[#0b1422] shadow-2xl overflow-hidden flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div>
          <h3 className="font-bold text-white text-lg">
            Chat with {getCustomer(activeChatRequest)?.name || "Customer"}
          </h3>

          <p className="text-xs text-slate-400 mt-1">
            {activeChatRequest?.serviceType
              ?.replace("-", " ")
              .replace(/\b\w/g, (char) => char.toUpperCase())}
          </p>
        </div>

        <button
          type="button"
          onClick={closeChat}
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {chatLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-slate-400 text-sm">
              Loading messages...
            </div>
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <div className="text-4xl mb-3">💬</div>
              <p className="text-slate-400">
                No messages yet.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Start the conversation with the customer.
              </p>
            </div>
          </div>
        ) : (
          chatMessages.map((message, index) => {
            const senderId =
              message?.sender?._id ||
              message?.sender?.id ||
              message?.senderId ||
              message?.sender;

            const isMine =
              String(senderId || "") ===
              String(technician?._id || technician?.id || "");

            return (
              <div
                key={message?._id || message?.id || index}
                className={`flex ${
                  isMine ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    isMine
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-white/5 border border-white/10 text-slate-200 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message?.message || message?.content || ""}
                  </p>

                  {message?.createdAt && (
                    <p
                      className={`text-[10px] mt-1 ${
                        isMine
                          ? "text-blue-100"
                          : "text-slate-500"
                      }`}
                    >
                      {formatDate(message.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}

        <div ref={chatMessagesEndRef} />
      </div>

      {/* Error */}
      {chatError && (
        <div className="mx-4 mb-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
          {chatError}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-3 items-end">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleChatKeyDown}
            placeholder="Type a message..."
            rows={2}
            className="flex-1 resize-none rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50"
          />

          <button
            type="button"
            onClick={sendChatMessage}
            disabled={chatSending || !chatInput.trim()}
            className="px-5 py-3 rounded-2xl bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition"
          >
            {chatSending ? "..." : "Send"}
          </button>
        </div>

        <p className="text-[10px] text-slate-500 mt-2">
          Press Enter to send • Shift + Enter for new line
        </p>
      </div>
    </div>
  </div>
)}
 
    </div> 
  ); 
}; 
 
export default Technician; 
 
 
