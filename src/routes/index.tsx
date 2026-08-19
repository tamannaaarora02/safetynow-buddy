import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { EmergencyOverlay } from "@/components/safely/EmergencyOverlay";
import { SafeJourney } from "@/components/safely/SafeJourney";
import { SafeAI } from "@/components/safely/SafeAI";
import { NearbySafety } from "@/components/safely/NearbySafety";
import { Contacts } from "@/components/safely/Contacts";
import {
  loadContacts,
  loadSettings,
  saveContacts,
  saveSettings,
  type Contact,
} from "@/lib/safely";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SAFELY — Personal Safety Net App" },
      {
        name: "description",
        content:
          "SAFELY is a personal safety app with emergency SOS, safe journey check-ins, offline SafeAI advice and nearby help.",
      },
      { property: "og:title", content: "SAFELY — Personal Safety Net App" },
      {
        property: "og:description",
        content:
          "Emergency SOS, safe journey tracking, offline safety assistant and nearby help in one tap.",
      },
    ],
  }),
  component: Index,
});

type Status = "safe" | "monitoring" | "emergency";

const STATUS_META: Record<Status, { label: string; className: string }> = {
  safe: { label: "SAFE", className: "bg-safe/15 text-safe border-safe/40" },
  monitoring: {
    label: "MONITORING",
    className: "bg-warn/15 text-warn border-warn/40",
  },
  emergency: {
    label: "EMERGENCY",
    className: "bg-danger/20 text-danger border-danger/50",
  },
};

function Index() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [userName, setUserName] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [journeyActive, setJourneyActive] = useState(false);
  const [overdue, setOverdue] = useState(false);

  useEffect(() => {
    setContacts(loadContacts());
    setUserName(loadSettings().name);
  }, []);

  const updateContacts = (c: Contact[]) => {
    setContacts(c);
    saveContacts(c);
  };

  const updateName = (n: string) => {
    setUserName(n);
    saveSettings({ ...loadSettings(), name: n });
  };

  const handleJourney = useCallback((isOverdue: boolean, active: boolean) => {
    setOverdue(isOverdue);
    setJourneyActive(active);
  }, []);

  const status: Status = emergency
    ? "emergency"
    : overdue
      ? "emergency"
      : journeyActive
        ? "monitoring"
        : "safe";

  const meta = STATUS_META[status];

  return (
    <main className="min-h-screen bg-background">
      {emergency && (
        <EmergencyOverlay contacts={contacts} onCancel={() => setEmergency(false)} />
      )}

      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
              S
            </span>
            <span className="font-display text-xl font-bold tracking-tight">SAFELY</span>
          </div>
          <span
            className={`rounded-full border px-3 py-1.5 text-xs font-bold tracking-widest transition-colors ${meta.className}`}
          >
            {meta.label}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-5 px-5 py-8">
        <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {userName ? `Hi ${userName}, you're covered.` : "Your safety net, one tap away."}
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Trigger an emergency, track a journey home, or get instant advice — all working
            offline on your device.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setEmergency(true)}
              className="group relative overflow-hidden rounded-2xl bg-danger px-6 py-6 font-display text-2xl font-bold text-danger-foreground transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <span className="absolute inset-0 animate-pulse bg-white/5" />
              I NEED HELP
            </button>
            <a
              href="#journey"
              className="grid place-items-center rounded-2xl border border-border bg-secondary px-6 py-6 font-display text-2xl font-bold transition-colors hover:bg-accent"
            >
              START SAFE JOURNEY
            </a>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor="uname" className="text-sm text-muted-foreground">
              Your name (saved locally)
            </label>
            <input
              id="uname"
              value={userName}
              onChange={(e) => updateName(e.target.value)}
              placeholder="e.g. Tamanna"
              className="rounded-xl border border-input bg-secondary px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </section>

        <SafeJourney onOverdueChange={handleJourney} onEmergency={() => setEmergency(true)} />
        <SafeAI />
        <NearbySafety />
        <Contacts contacts={contacts} onChange={updateContacts} />

        <footer className="pb-6 text-center text-xs text-muted-foreground">
          SAFELY · demo build · emergency number 112
        </footer>
      </div>
    </main>
  );
}
