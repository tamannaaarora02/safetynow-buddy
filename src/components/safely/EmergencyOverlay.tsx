import { useEffect, useState } from "react";
import type { Contact } from "@/lib/safely";

export function EmergencyOverlay({
  contacts,
  onCancel,
}: {
  contacts: Contact[];
  onCancel: () => void;
}) {
  const [count, setCount] = useState(10);
  const [alerted, setAlerted] = useState(false);

  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  useEffect(() => {
    if (count === 0 && !alerted) setAlerted(true);
  }, [count, alerted]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 overflow-y-auto bg-danger px-5 py-10 text-danger-foreground animate-in fade-in duration-200">
      <span className="rounded-full border border-current/40 px-4 py-1 text-xs font-semibold tracking-[0.3em] uppercase">
        Emergency Mode
      </span>

      <div className="relative flex size-44 items-center justify-center rounded-full border-4 border-current/30 sm:size-52">
        <span className="absolute inset-0 animate-ping rounded-full border-2 border-current/30" />
        <span className="font-display text-7xl font-bold tabular-nums">{count}</span>
      </div>

      <p className="max-w-md text-center text-lg font-medium">
        {count > 0
          ? "Hold on. Alerting in progress — cancel if you are safe."
          : "Countdown complete. Emergency actions are live."}
      </p>

      {alerted && (
        <div className="w-full max-w-md rounded-xl bg-black/25 px-4 py-3 text-center text-sm font-semibold animate-in fade-in slide-in-from-bottom-2">
          Emergency contacts alerted.
          {contacts.length > 0 ? (
            <span className="mt-1 block font-normal opacity-90">
              SOS + location sent to {contacts.map((c) => c.name).join(", ")}
            </span>
          ) : (
            <span className="mt-1 block font-normal opacity-90">
              No contacts saved — add contacts below for real alerts.
            </span>
          )}
        </div>
      )}

      <div className="grid w-full max-w-md gap-3">
        <a
          href="tel:112"
          className="rounded-xl bg-white px-5 py-4 text-center text-base font-bold text-danger transition-transform active:scale-[0.98]"
        >
          CALL EMERGENCY (112)
        </a>
        <button
          onClick={() => setAlerted(true)}
          className="rounded-xl border-2 border-current px-5 py-4 text-base font-bold transition-colors hover:bg-black/15"
        >
          ALERT CONTACTS
        </button>
        <button
          onClick={onCancel}
          className="rounded-xl bg-black/25 px-5 py-4 text-base font-bold transition-colors hover:bg-black/35"
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}
