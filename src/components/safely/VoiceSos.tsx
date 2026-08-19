import { useVoiceSos, type VoiceSosStatus } from "@/hooks/use-voice-sos";

const STATUS_TEXT: Record<VoiceSosStatus, string> = {
  idle: "Voice SOS is off.",
  listening: "Listening for \u201cHELP ME\u201d...",
  denied: "Microphone permission denied. Enable it in your browser settings to use Voice SOS.",
  error: "Voice SOS hit an error. Try disabling and re-enabling.",
  unsupported: "Voice SOS is not supported by this browser.",
};

export function VoiceSos({ onTrigger }: { onTrigger: () => void }) {
  const { enabled, status, enable, disable, supported } = useVoiceSos(onTrigger);

  return (
    <section id="voice-sos" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Voice SOS</h2>
          {enabled && (
            <span className="flex items-center gap-1.5 rounded-full bg-danger/20 px-2.5 py-1 text-xs font-semibold text-danger">
              <span className="safely-listen-dot size-2 rounded-full bg-danger" />
              ACTIVE
            </span>
          )}
        </div>
        {enabled ? (
          <button
            onClick={disable}
            className="rounded-xl bg-danger px-5 py-2.5 text-sm font-semibold text-danger-foreground transition-opacity hover:opacity-90"
          >
            DISABLE VOICE SOS
          </button>
        ) : (
          <button
            onClick={enable}
            disabled={!supported}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            ENABLE VOICE SOS
          </button>
        )}
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        {supported
          ? 'When enabled, SAFELY listens for the phrase "HELP ME" and instantly activates Emergency Mode. Works only while this page is open.'
          : STATUS_TEXT.unsupported}
      </p>

      {enabled && (
        <div className="mt-3 rounded-xl bg-secondary px-4 py-3 text-sm animate-in fade-in">
          <p className="flex items-center gap-2 font-semibold">
            <span className="safely-listen-dot size-2.5 rounded-full bg-danger" />
            Microphone is listening. Say{" "}
            <span className="text-danger">"HELP ME"</span> to trigger emergency.
          </p>
        </div>
      )}

      {status !== "idle" && status !== "listening" && (
        <p className="mt-2 text-sm text-warn">{STATUS_TEXT[status]}</p>
      )}
    </section>
  );
}
