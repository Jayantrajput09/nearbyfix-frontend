import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================================
// JWT REQUEST INTERCEPTOR
// =====================================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(
      "nearbyfix_token"
    );

    if (token) {
      config.headers = config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

API.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      console.log("JWT AUTH FAILED");

      localStorage.removeItem(
        "nearbyfix_token"
      );

      localStorage.removeItem(
        "nearbyfix_user"
      );
    }

    return Promise.reject(error);
  }
);

// =====================================================
// AUTH
// =====================================================

export const registerUser = async (data) => {
  const response = await API.post(
    "/auth/register",
    data
  );

  return response.data;
};

export const loginUser = async (data) => {
  const response = await API.post(
    "/auth/login",
    data
  );

  return response.data;
};

// =====================================================
// FORGOT / RESET PASSWORD
// =====================================================

export const forgotPassword = async (email) => {
  const response = await API.post(
    "/auth/forgot-password",
    {
      email: email.trim().toLowerCase(),
    }
  );

  return response.data;
};

export const resetPassword = async (
  token,
  password,
  confirmPassword
) => {
  if (!token) {
    throw new Error("Reset token is missing");
  }

  const response = await API.post(
    `/auth/reset-password/${token}`,
    {
      password,
      confirmPassword,
    }
  );

  return response.data;
};

// =====================================================
// USER PROFILE
// =====================================================

export const getProfile = async () => {
  const response = await API.get(
    "/profile"
  );

  return response.data;
};

export const updateProfile = async (data) => {
  const response = await API.put(
    "/profile",
    data
  );

  return response.data;
};

// =====================================================
// USER LIVE LOCATION
// =====================================================

export const updateLiveLocation = async (
  lat,
  lng
) => {
  const response = await API.put(
    "/profile/location",
    {
      lat: Number(lat),
      lng: Number(lng),
    }
  );

  return response.data;
};

// =====================================================
// SERVICE REQUESTS - USER
// =====================================================

export const createServiceRequest = async (
  data
) => {
  console.log(
    "CREATE REQUEST PAYLOAD:",
    data
  );

  const response = await API.post(
    "/requests",
    data
  );

  return response.data;
};

export const getMyRequests = async () => {
  const response = await API.get(
    "/requests/my"
  );

  return response.data;
};

export const getServiceRequest = async (
  id
) => {
  if (!id) {
    throw new Error(
      "Service request ID is required"
    );
  }

  const response = await API.get(
    `/requests/${id}`
  );

  return response.data;
};

export const cancelServiceRequest = async (
  id
) => {
  if (!id) {
    throw new Error(
      "Service request ID is required"
    );
  }

  const response = await API.put(
    `/requests/${id}/cancel`
  );

  return response.data;
};

// =====================================================
// TECHNICIAN OWN PROFILE
// =====================================================

export const getTechnicianProfile =
  async () => {
    const response = await API.get(
      "/technician/profile"
    );

    return response.data;
  };

export const updateTechnicianProfile =
  async (data) => {
    const response = await API.put(
      "/technician/profile",
      data
    );

    return response.data;
  };

// =====================================================
// TECHNICIAN SEARCH
// =====================================================

export const searchTechnicians = async (
  query = ""
) => {
  const response = await API.get(
    "/technician/search",
    {
      params: {
        q: String(query).trim(),
      },
    }
  );

  return response.data;
};

export const getTechnicians = async () => {
  const response = await API.get(
    "/technician/search",
    {
      params: {
        q: "",
      },
    }
  );

  return response.data;
};

// =====================================================
// RECOMMENDED TECHNICIANS
// =====================================================

export const getRecommendedTechnicians =
  async () => {
    const response = await API.get(
      "/technician/recommended"
    );

    return response.data;
  };

// =====================================================
// PUBLIC TECHNICIAN PROFILE
// =====================================================

export const getTechnicianById = async (
  id
) => {
  if (!id) {
    throw new Error(
      "Technician ID is missing"
    );
  }

  const response = await API.get(
    `/technician/${id}`
  );

  return response.data;
};

// =====================================================
// TECHNICIAN REQUESTS
// =====================================================

export const getTechnicianRequests =
  async () => {
    const response = await API.get(
      "/technician/requests"
    );

    return response.data;
  };

export const getMyTechnicianRequests =
  async () => {
    const response = await API.get(
      "/technician/my-requests"
    );

    return response.data;
  };

// =====================================================
// ACCEPT SERVICE REQUEST
// =====================================================
// Technician enters his own expected arrival time.
// Example:
// "10 minutes"
// "20 minutes"
// "30 minutes"
// "45 minutes"
// "1 hour"
// "25-30 minutes"
// =====================================================

export const acceptServiceRequest = async (
  id,
  expectedTime
) => {
  // -----------------------------------------------
  // Validate request ID
  // -----------------------------------------------

  if (!id) {
    throw new Error(
      "Request ID is required"
    );
  }

  // -----------------------------------------------
  // Clean expected time
  // -----------------------------------------------

  const cleanExpectedTime = String(
    expectedTime || ""
  ).trim();

  // -----------------------------------------------
  // Validate expected time
  // -----------------------------------------------

  if (!cleanExpectedTime) {
    throw new Error(
      "Expected arrival time is required"
    );
  }

  // -----------------------------------------------
  // DEBUG
  // -----------------------------------------------

  console.log(
    "===================================="
  );

  console.log(
    "ACCEPT REQUEST FROM FRONTEND"
  );

  console.log(
    "REQUEST ID:",
    id
  );

  console.log(
    "EXPECTED TIME:",
    cleanExpectedTime
  );

  console.log(
    "===================================="
  );

  // -----------------------------------------------
  // SEND REQUEST TO BACKEND
  // -----------------------------------------------

  const response = await API.put(
    `/technician/requests/${id}/accept`,
    {
      expectedTime:
        cleanExpectedTime,
    }
  );

  // -----------------------------------------------
  // RESPONSE DEBUG
  // -----------------------------------------------

  console.log(
    "ACCEPT REQUEST RESPONSE:",
    response.data
  );

  return response.data;
};

// =====================================================
// UPDATE TECHNICIAN REQUEST STATUS
// =====================================================

export const updateTechnicianRequestStatus =
  async (
    id,
    status
  ) => {
    if (!id) {
      throw new Error(
        "Request ID is required"
      );
    }

    if (!status) {
      throw new Error(
        "Request status is required"
      );
    }

    console.log(
      "UPDATE REQUEST STATUS:",
      {
        id,
        status,
      }
    );

    const response = await API.put(
      `/technician/requests/${id}/status`,
      {
        status,
      }
    );

    return response.data;
  };

// =====================================================
// TECHNICIAN LIVE LOCATION
// =====================================================

export const updateTechnicianLiveLocation =
  async (
    requestId,
    lat,
    lng
  ) => {
    if (!requestId) {
      throw new Error(
        "Request ID is required"
      );
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      throw new Error(
        "Invalid latitude"
      );
    }

    if (
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new Error(
        "Invalid longitude"
      );
    }

    const response = await API.put(
      `/technician/requests/${requestId}/location`,
      {
        lat: latitude,
        lng: longitude,
      }
    );

    return response.data;
  };

// =====================================================
// AI
// =====================================================

export const getAISuggestion = async (
  message
) => {
  const cleanMessage = String(
    message || ""
  ).trim();

  if (!cleanMessage) {
    throw new Error(
      "AI message is required"
    );
  }

  const response = await API.post(
    "/ai/suggestions",
    {
      message: cleanMessage,
    }
  );

  return response.data;
};

// =====================================================
// ADMIN
// =====================================================

// ADMIN DASHBOARD STATS
export const getAdminStats = async () => {
  const response = await API.get(
    "/admin/stats"
  );

  return response.data;
};


// GET ALL USERS
export const getAdminUsers = async (
  params = {}
) => {
  const response = await API.get(
    "/admin/users",
    {
      params,
    }
  );

  return response.data;
};


// BLOCK USER
export const blockUser = async (
  userId
) => {
  if (!userId) {
    throw new Error(
      "User ID is required"
    );
  }

  const response = await API.put(
    `/admin/users/${userId}/block`
  );

  return response.data;
};


// UNBLOCK USER
export const unblockUser = async (
  userId
) => {
  if (!userId) {
    throw new Error(
      "User ID is required"
    );
  }

  const response = await API.put(
    `/admin/users/${userId}/unblock`
  );

  return response.data;
};


// DELETE USER
export const deleteUser = async (
  userId
) => {
  if (!userId) {
    throw new Error(
      "User ID is required"
    );
  }

  const response = await API.delete(
    `/admin/users/${userId}`
  );

  return response.data;
};


// GET ALL SERVICE REQUESTS
export const getAdminRequests = async (
  params = {}
) => {
  const response = await API.get(
    "/admin/requests",
    {
      params,
    }
  );

  return response.data;
};

// =====================================================
// SERVER TEST
// =====================================================

export const checkServer = async () => {
  const response = await axios.get(
  import.meta.env.VITE_API_URL.replace("/api", "")
);

  return response.data;
};

// =====================================================
// REVIEWS
// =====================================================

// CREATE REVIEW
export const createReview = async (data) => {
  const response = await API.post(
    "/reviews",
    data
  );

  return response.data;
};


// GET TECHNICIAN REVIEWS
export const getTechnicianReviews = async (
  technicianId
) => {
  if (!technicianId) {
    throw new Error(
      "Technician ID is required"
    );
  }

  const response = await API.get(
    `/reviews/technician/${technicianId}`
  );

  return response.data;
};


// GET MY REVIEWS
export const getMyReviews = async () => {
  const response = await API.get(
    "/reviews/my"
  );

  return response.data;
};


// ADMIN - GET ALL REVIEWS
export const getAdminReviews = async () => {
  const response = await API.get(
    "/reviews/admin"
  );

  return response.data;
};


// ADMIN - DELETE REVIEW
export const deleteReview = async (
  reviewId
) => {
  if (!reviewId) {
    throw new Error(
      "Review ID is required"
    );
  }

  const response = await API.delete(
    `/reviews/admin/${reviewId}`
  );

  return response.data;
};

// =====================================================
// DEFAULT EXPORT
// =====================================================

export default API;