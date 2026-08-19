export type Contact = { id: string; name: string; phone: string };

export type JourneyState = {
  active: boolean;
  destination: string;
  startedAt: number;
  lastCheckIn: number;
} | null;

const KEYS = {
  contacts: "safely.contacts",
  journey: "safely.journey",
  settings: "safely.settings",
};

export type Settings = { name: string; checkInSeconds: number };

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export const loadContacts = () => read<Contact[]>(KEYS.contacts, []);
export const saveContacts = (c: Contact[]) => write(KEYS.contacts, c);
export const loadJourney = () => read<JourneyState>(KEYS.journey, null);
export const saveJourney = (j: JourneyState) => write(KEYS.journey, j);
export const loadSettings = () =>
  read<Settings>(KEYS.settings, { name: "", checkInSeconds: 60 });
export const saveSettings = (s: Settings) => write(KEYS.settings, s);

export function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  const h = Math.floor(total / 3600);
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

type Rule = { keys: string[]; title: string; steps: string[] };

const RULES: Rule[] = [
  {
    keys: ["following", "followed", "stalking", "stalker", "behind me"],
    title: "Someone may be following you",
    steps: [
      "Do not go home. Head to the nearest open shop, cafe or petrol station.",
      "Cross the street twice — if they follow both times, treat it as real.",
      "Call someone and say your live location out loud.",
      "If they close in, shout and move toward people. Tap I NEED HELP now.",
    ],
  },
  {
    keys: ["walking home", "walking alone", "alone at night", "night walk"],
    title: "Walking alone",
    steps: [
      "Start a Safe Journey so your check-ins are tracked.",
      "Stay on lit main roads; avoid shortcuts, parks and empty lanes.",
      "Keep one ear free — no headphones in both ears.",
      "Hold your phone with the emergency screen one tap away.",
    ],
  },
  {
    keys: ["taxi", "cab", "uber", "auto", "driver", "rickshaw"],
    title: "Unsafe ride",
    steps: [
      "Share the vehicle number with a contact right now.",
      "Sit in the back on the passenger side, keep the window slightly down.",
      "If the route feels wrong, ask to stop in a busy, lit area and get out.",
      "Do not fall asleep; keep the trip open on your screen.",
    ],
  },
  {
    keys: ["harass", "touch", "grope", "creep", "catcall", "flashing"],
    title: "Being harassed",
    steps: [
      "Say loudly and firmly: 'Back off.' Drawing attention is protection.",
      "Move toward staff, a guard or a group of people.",
      "Ask one specific person for help: 'You in the red jacket, help me.'",
      "Alert your contacts so someone knows where you are.",
    ],
  },
  {
    keys: ["home invasion", "break in", "broke in", "intruder", "door"],
    title: "Someone may be inside",
    steps: [
      "Leave if you can — do not investigate.",
      "If you cannot leave, lock yourself in a room and stay quiet.",
      "Call 112 immediately and stay on the line.",
      "Give your exact address first, before anything else.",
    ],
  },
  {
    keys: ["medical", "hurt", "injured", "bleeding", "faint", "chest pain"],
    title: "Medical emergency",
    steps: [
      "Call 112 and state the symptoms and address first.",
      "Sit or lie down; do not move if there is a head, neck or back injury.",
      "Apply firm pressure to any bleeding with cloth.",
      "Unlock your door so help can reach you.",
    ],
  },
  {
    keys: ["lost", "don't know where", "dont know where", "no idea where"],
    title: "You are lost",
    steps: [
      "Stop moving. Wandering makes it worse.",
      "Use Nearby Safety to find the closest police station or public place.",
      "Screenshot your location and send it to a contact.",
      "Stay in a lit, populated spot until someone reaches you.",
    ],
  },
  {
    keys: ["unsafe", "scared", "afraid", "anxious", "panic", "creeped"],
    title: "You feel unsafe",
    steps: [
      "Trust the feeling — act before you are sure.",
      "Move to the nearest lit, busy place.",
      "Alert your contacts; a false alarm costs nothing.",
      "Breathe: 4 in, 4 hold, 6 out. Then decide your next 2 minutes.",
    ],
  },
];

export function safeAiReply(input: string): { title: string; steps: string[] } {
  const text = input.toLowerCase();
  const hit = RULES.find((r) => r.keys.some((k) => text.includes(k)));
  if (hit) return { title: hit.title, steps: hit.steps };
  return {
    title: "General safety guidance",
    steps: [
      "Move somewhere lit and public before doing anything else.",
      "Tell one person where you are and where you are going.",
      "Start a Safe Journey so missed check-ins raise an alert.",
      "If the danger is immediate, press I NEED HELP or call 112.",
    ],
  };
}

export type Place = {
  name: string;
  type: "Police Station" | "Hospital" | "Safe Place";
  address: string;
  distanceKm: number;
  phone: string;
};

export const DEMO_PLACES: Place[] = [
  {
    name: "Central Police Station",
    type: "Police Station",
    address: "12 Civic Line Rd",
    distanceKm: 0.6,
    phone: "112",
  },
  {
    name: "Sector 4 Police Chowki",
    type: "Police Station",
    address: "Near Market Square",
    distanceKm: 1.4,
    phone: "112",
  },
  {
    name: "City General Hospital",
    type: "Hospital",
    address: "88 Ring Road",
    distanceKm: 1.1,
    phone: "108",
  },
  {
    name: "Nightingale Emergency Clinic",
    type: "Hospital",
    address: "3 Park Avenue",
    distanceKm: 2.3,
    phone: "108",
  },
  {
    name: "24/7 Metro Station",
    type: "Safe Place",
    address: "Line 2, Gate B",
    distanceKm: 0.4,
    phone: "112",
  },
  {
    name: "Open All Night Cafe",
    type: "Safe Place",
    address: "5 Lantern Street",
    distanceKm: 0.9,
    phone: "112",
  },
];
