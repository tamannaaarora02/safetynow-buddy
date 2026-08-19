import { useState } from "react";
import { DEMO_PLACES } from "@/lib/safely";

export function NearbySafety() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState("Showing demo locations near city centre.");

  const locate = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("Geolocation unavailable — showing demo locations.");
      return;
    }
    setStatus("Getting your location...");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
        setStatus("Location found. Distances estimated from your position.");
      },
      () => setStatus("Location blocked — showing demo locations."),
      { timeout: 8000 },
    );
  };

  const mapUrl = (q: string) =>
    coords
      ? `https://www.google.com/maps/search/${encodeURIComponent(q)}/@${coords.lat},${coords.lng},15z`
      : `https://www.google.com/maps/search/${encodeURIComponent(q)}`;

  return (
    <section id="nearby" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Nearby Safety</h2>
        <button
          onClick={locate}
          className="rounded-xl border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent"
        >
          Use My Location
        </button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {status}
        {coords && ` (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})`}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DEMO_PLACES.map((p) => (
          <div
            key={p.name}
            className="rounded-xl bg-secondary p-4 transition-transform hover:-translate-y-0.5"
          >
            <span
              className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                p.type === "Police Station"
                  ? "bg-primary/20 text-primary"
                  : p.type === "Hospital"
                    ? "bg-danger/20 text-danger"
                    : "bg-safe/20 text-safe"
              }`}
            >
              {p.type}
            </span>
            <h3 className="mt-2 text-base font-semibold">{p.name}</h3>
            <p className="text-sm text-muted-foreground">{p.address}</p>
            <p className="mt-1 text-sm text-muted-foreground">{p.distanceKm} km away</p>
            <div className="mt-3 flex gap-2">
              <a
                href={`tel:${p.phone}`}
                className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
              >
                Call {p.phone}
              </a>
              <a
                href={mapUrl(`${p.name} ${p.address}`)}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold transition-colors hover:bg-accent"
              >
                Directions
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
