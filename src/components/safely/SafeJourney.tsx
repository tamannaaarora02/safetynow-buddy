import { useEffect, useRef, useState, type MutableRefObject } from "react";
import {
  formatElapsed,
  loadJourney,
  saveJourney,
  type JourneyState,
  type GpsCoords,
} from "@/lib/safely";
import { startSiren, stopSiren } from "@/lib/siren";

const CHECK_IN_LIMIT = 15 * 60_000; // 15 minutes between check-ins

export type JourneyControls = {
  checkIn: () => void;
  locate: () => void;
  getLatestLocation: () => GpsCoords | null;
};

export function SafeJourney({
  onOverdueChange,
  onEmergency,
  onContext,
  controlsRef,
  onSirenChange,
}: {
  onOverdueChange: (overdue: boolean, active: boolean) => void;
  onEmergency: () => void;
  onContext?: (c: {
    destination: string;
    checkedIn: boolean;
    locationAvailable: boolean;
  }) => void;
  controlsRef?: MutableRefObject<JourneyControls | null>;
  onSirenChange?: (active: boolean) => void;
}) {
  const [journey, setJourney] = useState<JourneyState>(null);
  const [destination, setDestination] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [toast, setToast] = useState("");
  const [coords, setCoords] = useState<GpsCoords | null>(null);
  const [locStatus, setLocStatus] = useState("");
  const [sirenOn, setSirenOn] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const latestCoordsRef = useRef<GpsCoords | null>(null);
  const sirenStartedRef = useRef(false);

  useEffect(() => {
    const loaded = loadJourney();
    setJourney(loaded);
    if (loaded?.lastLocation) {
      latestCoordsRef.current = loaded.lastLocation;
      setCoords(loaded.lastLocation);
    }
  }, []);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const overdue = !!journey?.active && now - journey.lastCheckIn > CHECK_IN_LIMIT;

  useEffect(() => {
    onOverdueChange(overdue, !!journey?.active);
  }, [overdue, journey?.active, onOverdueChange]);

  useEffect(() => {
    if (overdue && !sirenStartedRef.current) {
      startSiren();
      sirenStartedRef.current = true;
      setSirenOn(true);
      onSirenChange?.(true);
    }
  }, [overdue, onSirenChange]);

  useEffect(() => {
    onContext?.({
      destination: journey?.destination ?? "",
      checkedIn: !overdue,
      locationAvailable: !!latestCoordsRef.current,
    });
  }, [journey?.destination, overdue, journey, onContext]);

  const stopSirenAndReset = () => {
    if (sirenStartedRef.current) {
      stopSiren();
      sirenStartedRef.current = false;
      setSirenOn(false);
      onSirenChange?.(false);
    }
  };

  const update = (j: JourneyState) => {
    setJourney(j);
    saveJourney(j);
  };

  const startWatch = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocStatus("Location is not supported by this browser.");
      return;
    }
    if (watchIdRef.current !== null) return;

    setLocStatus("Tracking your location...");
    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => {
        const c: GpsCoords = {
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: p.coords.accuracy,
          updatedAt: Date.now(),
        };
        latestCoordsRef.current = c;
        setCoords(c);
        setLocStatus("");
        setJourney((prev) => {
          if (!prev?.active) return prev;
          const updated = { ...prev, lastLocation: c };
          saveJourney(updated);
          return updated;
        });
      },
      (err) => {
        setLocStatus(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. You can still use every other feature."
            : "Couldn't get your location right now. Please try again.",
        );
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 5000 },
    );
  };

  const stopWatch = () => {
    if (watchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  useEffect(() => {
    if (journey?.active) {
      startWatch();
    } else {
      stopWatch();
    }
    return () => stopWatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey?.active]);

  const start = () => {
    if (!destination.trim()) return;
    const t = Date.now();
    update({ active: true, destination: destination.trim(), startedAt: t, lastCheckIn: t });
    setDestination("");
    setToast("Journey started — check in every 15 minutes.");
  };

  const checkIn = () => {
    stopSirenAndReset();
    if (!journey) return;
    update({ ...journey, lastCheckIn: Date.now() });
    setToast("Check-in successful. You're marked safe.");
  };

  const locate = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocStatus("Location is not supported by this browser.");
      return;
    }
    setLocStatus("Getting your location...");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const c: GpsCoords = {
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          accuracy: p.coords.accuracy,
          updatedAt: Date.now(),
        };
        latestCoordsRef.current = c;
        setCoords(c);
        setLocStatus("");
      },
      (err) => {
        setCoords(null);
        setLocStatus(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. You can still use every other feature."
            : "Couldn't get your location right now. Please try again.",
        );
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  useEffect(() => {
    if (!controlsRef) return;
    controlsRef.current = {
      checkIn,
      locate,
      getLatestLocation: () => latestCoordsRef.current,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey, controlsRef]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    return () => {
      stopSirenAndReset();
      stopWatch();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const msLeft = journey?.active
    ? Math.max(0, CHECK_IN_LIMIT - (now - journey.lastCheckIn))
    : 0;
  const countdown = formatElapsed(msLeft);

  const mapUrl = coords
    ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
    : "";

  return (
    <section
      id="journey"
      className={`rounded-2xl border bg-card p-5 transition-colors sm:p-6 ${
        sirenOn ? "safely-pulse-border border-danger" : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Safe Journey</h2>
        <button
          onClick={locate}
          className="rounded-xl border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent"
        >
          Use My Location
        </button>
      </div>

      {(coords || locStatus) && (
        <div className="mt-2 space-y-1">
          {coords && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>
                Current location: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                {coords.accuracy ? ` (±${Math.round(coords.accuracy)}m)` : ""}
              </span>
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-accent"
              >
                View on Map
              </a>
            </div>
          )}
          {locStatus && <p className="text-sm text-muted-foreground">{locStatus}</p>}
        </div>
      )}

      {!journey?.active ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Tell SAFELY where you are heading. Missed check-ins raise an alert.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && start()}
              placeholder="Destination (e.g. Home, 14 Park Lane)"
              className="w-full rounded-xl border border-input bg-secondary px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={start}
              disabled={!destination.trim()}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              START SAFE JOURNEY
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {overdue && (
            <div className="safely-flash flex items-center justify-between gap-3 rounded-xl px-4 py-4 text-danger-foreground animate-in fade-in">
              <div>
                <p className="font-display text-lg font-bold">CHECK-IN MISSED</p>
                <p className="text-sm opacity-90">
                  You missed your check-in. Confirm you're safe or get help now.
                </p>
              </div>
              <span className="text-3xl">!</span>
            </div>
          )}

          <div
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
              overdue
                ? "border-warn/50 bg-warn/15 text-warn"
                : "border-safe/40 bg-safe/10 text-safe"
            }`}
          >
            {overdue
              ? "Check-in overdue — confirm you're safe or get help now."
              : `Journey active — next check-in in ${countdown}`}
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Destination", journey.destination],
              ["Elapsed", formatElapsed(now - journey.startedAt)],
              ["Next check-in", overdue ? "Overdue" : countdown],
              ["Status", overdue ? "Check-in overdue" : "Safe"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-secondary px-4 py-3">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
                <dd className="mt-1 font-display text-base font-semibold">{v}</dd>
              </div>
            ))}
          </dl>

          {coords && (
            <div className="rounded-xl bg-secondary px-4 py-3">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Live GPS (tracked)
              </dt>
              <dd className="mt-1 flex flex-wrap items-center gap-2 font-display text-sm font-semibold">
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                <a
                  href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-border px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-accent"
                >
                  View on Map
                </a>
              </dd>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={checkIn}
              className="rounded-xl bg-safe px-5 py-3 text-sm font-bold text-safe-foreground transition-transform active:scale-[0.98]"
            >
              I'M SAFE
            </button>
            {sirenOn && (
              <button
                onClick={checkIn}
                className="rounded-xl bg-danger px-5 py-3 text-sm font-bold text-danger-foreground transition-transform active:scale-[0.98]"
              >
                STOP ALARM
              </button>
            )}
            {overdue && (
              <button
                onClick={() => {
                  stopSirenAndReset();
                  onEmergency();
                }}
                className="rounded-xl bg-danger px-5 py-3 text-sm font-bold text-danger-foreground"
              >
                I NEED HELP
              </button>
            )}
            <button
              onClick={() => {
                stopSirenAndReset();
                update(null);
                setToast("Journey ended.");
              }}
              className="rounded-xl border border-border px-5 py-3 text-sm font-semibold transition-colors hover:bg-accent"
            >
              END JOURNEY
            </button>
          </div>
        </div>
      )}

      {toast && (
        <p className="mt-3 text-sm text-primary animate-in fade-in slide-in-from-bottom-1">
          {toast}
        </p>
      )}
    </section>
  );
}
