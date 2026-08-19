import { useEffect, useState } from "react";
import { formatElapsed, loadJourney, saveJourney, type JourneyState } from "@/lib/safely";

const CHECK_IN_LIMIT = 15 * 60_000; // 15 minutes between check-ins

export function SafeJourney({
  onOverdueChange,
  onEmergency,
}: {
  onOverdueChange: (overdue: boolean, active: boolean) => void;
  onEmergency: () => void;
}) {
  const [journey, setJourney] = useState<JourneyState>(null);
  const [destination, setDestination] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [toast, setToast] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locStatus, setLocStatus] = useState("");

  useEffect(() => {
    setJourney(loadJourney());
  }, []);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const overdue = !!journey?.active && now - journey.lastCheckIn > CHECK_IN_LIMIT;

  useEffect(() => {
    onOverdueChange(overdue, !!journey?.active);
  }, [overdue, journey?.active, onOverdueChange]);

  const update = (j: JourneyState) => {
    setJourney(j);
    saveJourney(j);
  };

  const start = () => {
    if (!destination.trim()) return;
    const t = Date.now();
    update({ active: true, destination: destination.trim(), startedAt: t, lastCheckIn: t });
    setDestination("");
    setToast("Journey started — check in every 15 minutes.");
  };

  const checkIn = () => {
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
        setCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
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
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const msLeft = journey?.active
    ? Math.max(0, CHECK_IN_LIMIT - (now - journey.lastCheckIn))
    : 0;
  const countdown = formatElapsed(msLeft);

  return (
    <section
      id="journey"
      className="rounded-2xl border border-border bg-card p-5 sm:p-6 transition-colors"
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
        <p className="mt-2 text-sm text-muted-foreground">
          {coords
            ? `Current location: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
            : locStatus}
        </p>
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

          <div className="flex flex-wrap gap-2">
            <button
              onClick={checkIn}
              className="rounded-xl bg-safe px-5 py-3 text-sm font-bold text-safe-foreground transition-transform active:scale-[0.98]"
            >
              I'M SAFE
            </button>
            {overdue && (
              <button
                onClick={onEmergency}
                className="rounded-xl bg-danger px-5 py-3 text-sm font-bold text-danger-foreground"
              >
                I NEED HELP
              </button>
            )}
            <button
              onClick={() => {
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
