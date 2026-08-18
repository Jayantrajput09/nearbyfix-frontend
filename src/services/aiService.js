// services/aiService.js

// =====================================================
// NEARBYFIX AI SERVICE
// =====================================================
//
// This service provides repair/service suggestions
// based on the user's problem description.
//
// Currently it works without any paid AI API.
// Later we can connect Gemini/OpenAI here.
// =====================================================

const diagnoseProblem = (message = "") => {
  const text = message.toLowerCase().trim();

  // ===================================================
  // EMPTY MESSAGE
  // ===================================================

  if (!text) {
    return {
      reply:
        "Please apni problem thodi detail mein batao.",
      suggestedService: null,
      confidence: 0,
    };
  }

  // ===================================================
  // ELECTRICIAN
  // ===================================================

  const electricianKeywords = [
    "fan",
    "light",
    "switch",
    "wire",
    "wiring",
    "electric",
    "electricity",
    "bijli",
    "pankha",
    "bulb",
    "socket",
    "current",
    "power",
    "voltage",
    "mcb",
    "fuse",
  ];

  if (
    electricianKeywords.some((keyword) =>
      text.includes(keyword)
    )
  ) {
    return {
      reply:
        "Aapki problem electrical related lag rahi hai ⚡. NearbyFix par Electrician service suitable rahegi.",
      suggestedService: "electrician",
      confidence: 0.92,
    };
  }

  // ===================================================
  // PLUMBER
  // ===================================================

  const plumberKeywords = [
    "pipe",
    "tap",
    "leak",
    "leakage",
    "water",
    "drain",
    "paani",
    "nal",
    "washbasin",
    "sink",
    "toilet",
    "flush",
    "sewer",
    "tank",
  ];

  if (
    plumberKeywords.some((keyword) =>
      text.includes(keyword)
    )
  ) {
    return {
      reply:
        "Ye plumbing related problem lag rahi hai 🔧. Aapke liye Plumber service suitable rahegi.",
      suggestedService: "plumber",
      confidence: 0.94,
    };
  }

  // ===================================================
  // AC REPAIR
  // ===================================================

  const acKeywords = [
    "ac",
    "air conditioner",
    "cooling",
    "cool nahi",
    "cooling nahi",
    "thanda nahi",
    "thanda",
    "compressor",
    "ac gas",
    "gas refill",
    "ac service",
    "ac repair",
  ];

  if (
    acKeywords.some((keyword) =>
      text.includes(keyword)
    )
  ) {
    return {
      reply:
        "Aapka issue AC se related lag raha hai ❄️. AC Repair technician ko request karna best rahega.",
      suggestedService: "ac-repair",
      confidence: 0.95,
    };
  }

  // ===================================================
  // CARPENTER
  // ===================================================

  const carpenterKeywords = [
    "door",
    "wood",
    "wooden",
    "furniture",
    "table",
    "chair",
    "cabinet",
    "almirah",
    "bed",
    "drawer",
    "lakdi",
    "darwaza",
    "sofa",
  ];

  if (
    carpenterKeywords.some((keyword) =>
      text.includes(keyword)
    )
  ) {
    return {
      reply:
        "Ye furniture/woodwork related problem lag rahi hai 🪚. Aap Carpenter service choose kar sakte ho.",
      suggestedService: "carpenter",
      confidence: 0.91,
    };
  }

  // ===================================================
  // MECHANIC
  // ===================================================

  const mechanicKeywords = [
    "bike",
    "car",
    "vehicle",
    "engine",
    "tyre",
    "tire",
    "brake",
    "clutch",
    "gear",
    "battery",
    "scooty",
    "scooter",
    "gaadi",
    "gadi",
    "motorcycle",
  ];

  if (
    mechanicKeywords.some((keyword) =>
      text.includes(keyword)
    )
  ) {
    return {
      reply:
        "Ye vehicle related problem lag rahi hai 🚗. Aapke liye Mechanic service suitable rahegi.",
      suggestedService: "mechanic",
      confidence: 0.93,
    };
  }

  // ===================================================
  // APPLIANCE REPAIR
  // ===================================================

  const applianceKeywords = [
    "fridge",
    "refrigerator",
    "washing machine",
    "microwave",
    "oven",
    "cooler",
    "ro",
    "water purifier",
    "tv",
    "television",
    "appliance",
    "machine",
  ];

  if (
    applianceKeywords.some((keyword) =>
      text.includes(keyword)
    )
  ) {
    return {
      reply:
        "Ye home appliance related problem lag rahi hai 🔌. Appliance Repair service suitable rahegi.",
      suggestedService: "appliance-repair",
      confidence: 0.9,
    };
  }

  // ===================================================
  // GREETING
  // ===================================================

  const greetings = [
    "hello",
    "hi",
    "hey",
    "namaste",
    "hii",
    "helo",
  ];

  if (
    greetings.some((keyword) =>
      text === keyword ||
      text.startsWith(`${keyword} `)
    )
  ) {
    return {
      reply:
        "Namaste 👋 Main NearbyFix Assistant hoon. Aap apni repair problem Hindi, Hinglish ya English mein bata sakte ho.",
      suggestedService: null,
      confidence: 1,
    };
  }

  // ===================================================
  // DEFAULT
  // ===================================================

  return {
    reply:
      "Mujhe problem ka exact type samajhne ke liye thoda aur detail chahiye. Jaise: fan nahi chal raha, pipe leak ho raha hai, AC cooling nahi kar raha, ya bike start nahi ho rahi.",
    suggestedService: null,
    confidence: 0.3,
  };
};

// =====================================================
// AI SUGGESTION
// =====================================================

const getSuggestion = async (message) => {
  return diagnoseProblem(message);
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  diagnoseProblem,
  getSuggestion,
};