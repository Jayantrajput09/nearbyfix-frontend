import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { updateProfile } from "../services/api";

function LiveLocation({
  onLocationChange,
  autoSave = true,
}) {
  const [location, setLocation] =
    useState(null);

  const [status, setStatus] = useState(
    "Getting your location..."
  );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const mountedRef = useRef(true);

  const lastSavedRef = useRef("");

  // =====================================================
  // SAVE LOCATION
  // =====================================================

  const saveLocation = useCallback(
    async (gpsLocation) => {
      if (!autoSave) return;

      const locationKey =
        `${gpsLocation.lat.toFixed(6)},${gpsLocation.lng.toFixed(6)}`;

      // Don't repeatedly save exactly the same
      // coordinates.
      if (
        lastSavedRef.current ===
        locationKey
      ) {
        return;
      }

      try {
        setSaving(true);

        await updateProfile({
          location: {
            coordinates: {
              lat: gpsLocation.lat,
              lng: gpsLocation.lng,
            },
          },
        });

        lastSavedRef.current =
          locationKey;

        if (mountedRef.current) {
          setStatus(
            "Location saved successfully ✓"
          );
        }
      } catch (err) {
        console.error(
          "LOCATION SAVE ERROR:",
          err?.response?.data || err
        );

        if (mountedRef.current) {
          setStatus(
            "Location detected"
          );

          setError(
            err?.response?.data
              ?.message ||
              "Could not save location"
          );
        }
      } finally {
        if (mountedRef.current) {
          setSaving(false);
        }
      }
    },
    [autoSave]
  );

  // =====================================================
  // GPS SUCCESS
  // =====================================================

  const handlePosition =
    useCallback(
      async (position) => {
        if (!mountedRef.current)
          return;

        const gpsLocation = {
          lat: Number(
            position.coords.latitude
          ),

          lng: Number(
            position.coords.longitude
          ),

          accuracy: Number(
            position.coords.accuracy
          ),
        };

        setLocation(gpsLocation);
        setError("");

        if (onLocationChange) {
          onLocationChange(
            gpsLocation
          );
        }

        await saveLocation(
          gpsLocation
        );
      },
      [
        onLocationChange,
        saveLocation,
      ]
    );

  // =====================================================
  // GPS ERROR
  // =====================================================

  const handleError = useCallback(
    (geoError) => {
      console.error(
        "GEOLOCATION ERROR:",
        geoError
      );

      if (!mountedRef.current)
        return;

      if (geoError.code === 1) {
        setStatus(
          "Location permission denied"
        );

        setError(
          "Please allow location permission in your browser."
        );
      } else if (
        geoError.code === 2
      ) {
        setStatus(
          "Location unavailable"
        );

        setError(
          "Unable to detect your current location."
        );
      } else if (
        geoError.code === 3
      ) {
        setStatus(
          "Location request timed out"
        );

        setError(
          "Location request took too long. Please try again."
        );
      } else {
        setStatus(
          "Unable to update location"
        );

        setError(
          "Unable to access your location."
        );
      }
    },
    []
  );

  // =====================================================
  // START GPS
  // =====================================================

  useEffect(() => {
    mountedRef.current = true;

    if (!navigator.geolocation) {
      setStatus(
        "Geolocation not supported"
      );

      setError(
        "Your browser does not support GPS location."
      );

      return () => {
        mountedRef.current = false;
      };
    }

    navigator.geolocation.getCurrentPosition(
      handlePosition,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );

    const watchId =
      navigator.geolocation.watchPosition(
        handlePosition,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 10000,
        }
      );

    return () => {
      mountedRef.current = false;

      navigator.geolocation.clearWatch(
        watchId
      );
    };
  }, [
    handlePosition,
    handleError,
  ]);

  // =====================================================
  // MANUAL RETRY
  // =====================================================

  const retryLocation = () => {
    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported."
      );
      return;
    }

    setStatus(
      "Getting your location..."
    );

    setError("");

    navigator.geolocation.getCurrentPosition(
      handlePosition,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl">
          📍
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">
            Live Location
          </p>

          <p className="text-xs text-slate-500 mt-1">
            {saving
              ? "Saving location..."
              : status}
          </p>
        </div>

        <div
          className={`w-3 h-3 rounded-full shrink-0 ${
            location
              ? "bg-emerald-400 animate-pulse"
              : "bg-amber-400"
          }`}
        />
      </div>

      {location && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="rounded-xl bg-black/20 border border-white/5 p-3">
            <p className="text-[11px] text-slate-500">
              Latitude
            </p>

            <p className="text-xs mt-1 font-mono text-slate-300 break-all">
              {location.lat.toFixed(
                6
              )}
            </p>
          </div>

          <div className="rounded-xl bg-black/20 border border-white/5 p-3">
            <p className="text-[11px] text-slate-500">
              Longitude
            </p>

            <p className="text-xs mt-1 font-mono text-slate-300 break-all">
              {location.lng.toFixed(
                6
              )}
            </p>
          </div>

          <div className="rounded-xl bg-black/20 border border-white/5 p-3">
            <p className="text-[11px] text-slate-500">
              Accuracy
            </p>

            <p className="text-xs mt-1 font-mono text-slate-300">
              {Math.round(
                location.accuracy
              )}
              m
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-xl bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-xs text-red-300">
            {error}
          </p>

          <button
            type="button"
            onClick={
              retryLocation
            }
            className="mt-2 text-xs text-red-200 underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

export default LiveLocation;