import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}
interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
  isFinal: boolean;
  length: number;
}
interface SpeechRecognitionEventLike {
  results: { [index: number]: SpeechRecognitionResultLike; length: number };
  resultIndex: number;
}
interface SpeechRecognitionErrorEventLike {
  error: string;
  message: string;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isVoiceSosSupported(): boolean {
  return getSpeechRecognitionCtor() !== null;
}

export type VoiceSosStatus = "idle" | "listening" | "denied" | "error" | "unsupported";

const TRIGGER_PHRASES = ["help me", "i need help", "help"];

export function useVoiceSos(onTrigger: () => void) {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState<VoiceSosStatus>("idle");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const shouldListenRef = useRef(false);
  const onTriggerRef = useRef(onTrigger);
  onTriggerRef.current = onTrigger;

  const supported = isVoiceSosSupported();

  const stopRecognition = useCallback(() => {
    shouldListenRef.current = false;
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const createRecognition = useCallback((): SpeechRecognitionLike | null => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e: SpeechRecognitionEventLike) => {
      const results = e.results;
      for (let i = e.resultIndex; i < results.length; i++) {
        const result = results[i];
        if (!result) continue;
        const transcript = result[0]?.transcript?.toLowerCase().trim() ?? "";
        if (transcript && TRIGGER_PHRASES.some((p) => transcript.includes(p))) {
          onTriggerRef.current();
          break;
        }
      }
    };

    rec.onerror = (e: SpeechRecognitionErrorEventLike) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setStatus("denied");
        setEnabled(false);
        shouldListenRef.current = false;
      } else if (e.error === "no-speech" || e.error === "aborted") {
        // benign
      } else {
        setStatus("error");
      }
    };

    rec.onend = () => {
      if (shouldListenRef.current) {
        try {
          rec.start();
        } catch {
          /* will retry on next onend */
        }
      }
    };

    return rec;
  }, []);

  const enable = useCallback(() => {
    if (!supported) {
      setStatus("unsupported");
      return;
    }
    shouldListenRef.current = true;
    const rec = createRecognition();
    if (!rec) {
      setStatus("unsupported");
      return;
    }
    recognitionRef.current = rec;
    try {
      rec.start();
      setEnabled(true);
      setStatus("listening");
    } catch {
      setStatus("error");
      setEnabled(false);
      shouldListenRef.current = false;
    }
  }, [supported, createRecognition]);

  const disable = useCallback(() => {
    stopRecognition();
    setEnabled(false);
    setStatus("idle");
  }, [stopRecognition]);

  useEffect(() => {
    return () => {
      stopRecognition();
    };
  }, [stopRecognition]);

  return { enabled, status, enable, disable, supported };
}
