let audioCtx: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let lfo: OscillatorNode | null = null;
let lfoGain: GainNode | null = null;
let playing = false;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      audioCtx = new Ctor();
    } catch {
      return null;
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSirenPlaying() {
  return playing;
}

export function startSiren() {
  const ctx = ensureCtx();
  if (!ctx || playing) return;
  playing = true;

  try {
    oscillator = ctx.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime);

    lfo = ctx.createOscillator();
    lfo.type = "square";
    lfo.frequency.setValueAtTime(2, ctx.currentTime);

    lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(400, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);

    gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    lfo.start();
  } catch {
    playing = false;
    cleanupNodes();
  }

  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate([400, 200, 400, 200, 400, 200]);
    } catch {
      /* ignore */
    }
  }
}

export function stopSiren() {
  playing = false;
  cleanupNodes();
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(0);
    } catch {
      /* ignore */
    }
  }
}

function cleanupNodes() {
  try {
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
    }
  } catch {
    /* already stopped */
  }
  try {
    if (lfo) {
      lfo.stop();
      lfo.disconnect();
    }
  } catch {
    /* already stopped */
  }
  try {
    gainNode?.disconnect();
    lfoGain?.disconnect();
  } catch {
    /* ignore */
  }
  oscillator = null;
  lfo = null;
  gainNode = null;
  lfoGain = null;
}
