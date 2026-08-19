import { useState } from "react";
import type { Contact } from "@/lib/safely";

export function Contacts({
  contacts,
  onChange,
}: {
  contacts: Contact[];
  onChange: (c: Contact[]) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const add = () => {
    if (!name.trim() || !phone.trim()) return;
    onChange([
      ...contacts,
      { id: String(Date.now()), name: name.trim(), phone: phone.trim() },
    ]);
    setName("");
    setPhone("");
  };

  return (
    <section id="contacts" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="text-lg font-semibold">Emergency Contacts</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Saved on this device. These people get your SOS.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full rounded-xl border border-input bg-secondary px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Phone number"
          inputMode="tel"
          className="w-full rounded-xl border border-input bg-secondary px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={add}
          disabled={!name.trim() || !phone.trim()}
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Add
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {contacts.length === 0 && (
          <li className="rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
            No contacts yet. Add at least one.
          </li>
        )}
        {contacts.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-secondary px-4 py-3 animate-in fade-in"
          >
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-muted-foreground">{c.phone}</p>
            </div>
            <div className="flex gap-2">
              <a
                href={`tel:${c.phone}`}
                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold transition-colors hover:bg-accent"
              >
                Call
              </a>
              <button
                onClick={() => onChange(contacts.filter((x) => x.id !== c.id))}
                className="rounded-lg bg-danger/20 px-3 py-2 text-xs font-semibold text-danger transition-colors hover:bg-danger/30"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
