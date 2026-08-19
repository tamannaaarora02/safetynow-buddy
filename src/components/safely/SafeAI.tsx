import { useEffect, useRef, useState } from "react";
import { safeAiReply } from "@/lib/safely";

type Msg = { role: "user" | "ai"; text: string; steps?: string[] };

const QUICK = ["I'm walking home alone", "Someone is following me", "I feel unsafe"];

export function SafeAI() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: "SafeAI here. Describe your situation and I'll give you immediate steps.",
    },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages]);

  const send = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text) return;
    const reply = safeAiReply(text);
    setMessages((m) => [
      ...m,
      { role: "user", text },
      { role: "ai", text: reply.title, steps: reply.steps },
    ]);
    setInput("");
  };

  return (
    <section id="safeai" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="text-lg font-semibold">SafeAI Assistant</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Works offline. No account, no data leaves your device.
      </p>

      <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`animate-in fade-in slide-in-from-bottom-1 ${
              m.role === "user" ? "flex justify-end" : ""
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              <p className="font-semibold">{m.text}</p>
              {m.steps && (
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-muted-foreground">
                  {m.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:bg-accent"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Describe your situation..."
          className="w-full rounded-xl border border-input bg-secondary px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={() => send()}
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Send
        </button>
      </div>
    </section>
  );
}
