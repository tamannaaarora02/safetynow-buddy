export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";

export type SafeAction =
  | "START_SAFE_JOURNEY"
  | "IM_SAFE"
  | "ALERT_CONTACTS"
  | "I_NEED_HELP"
  | "NONE";

export type SafeAiContext = {
  journeyActive: boolean;
  destination: string;
  checkedIn: boolean;
  checkInOverdue: boolean;
  locationAvailable: boolean;
  contactsCount: number;
};

export type SafeAiAssessment = {
  risk: RiskLevel;
  summary: string;
  advice: string[];
  recommendedAction: SafeAction;
  recommendedActionLabel: string;
  source: "ai" | "local";
};

export const ACTION_LABELS: Record<Exclude<SafeAction, "NONE">, string> = {
  START_SAFE_JOURNEY: "START SAFE JOURNEY",
  IM_SAFE: "I'M SAFE",
  ALERT_CONTACTS: "ALERT CONTACTS",
  I_NEED_HELP: "I NEED HELP",
};

export const RISK_ORDER: RiskLevel[] = ["LOW", "MEDIUM", "HIGH", "EMERGENCY"];

export function escalate(risk: RiskLevel, to: RiskLevel): RiskLevel {
  return RISK_ORDER.indexOf(to) > RISK_ORDER.indexOf(risk) ? to : risk;
}

type Category = {
  id: string;
  risk: RiskLevel;
  keys: string[];
  summary: string;
  advice: string[];
  action: SafeAction;
};

const CATEGORIES: Category[] = [
  {
    id: "weapon",
    risk: "EMERGENCY",
    keys: [
      "weapon",
      "knife",
      "gun",
      "pistol",
      "shooting",
      "stabbed",
      "stabbing",
      "threatening me",
      "threatened me",
      "kill me",
      "hostage",
      "kidnap",
      "abduct",
      "attacking me",
      "attacked",
      "assault",
      "rape",
      "choking",
    ],
    summary: "Immediate physical danger — this is an emergency.",
    advice: [
      "Call 112 now, or press I NEED HELP to start the emergency countdown.",
      "Do not confront or negotiate. Put distance and doors between you and them.",
      "Move toward people, light and staffed spaces — shops, stations, security desks.",
      "If handing over belongings ends the threat, do it. Things are replaceable.",
    ],
    action: "I_NEED_HELP",
  },
  {
    id: "medical",
    risk: "EMERGENCY",
    keys: [
      "bleeding",
      "chest pain",
      "can't breathe",
      "cant breathe",
      "unconscious",
      "overdose",
      "seizure",
      "severe pain",
      "broken bone",
      "poison",
    ],
    summary: "Possible medical emergency.",
    advice: [
      "Call 112 (or 108) and give your exact address first.",
      "Stay still and seated; avoid moving if there is a head, neck or back injury.",
      "Apply firm pressure to bleeding with any clean cloth.",
      "Unlock the door so responders can reach you.",
    ],
    action: "I_NEED_HELP",
  },
  {
    id: "followed",
    risk: "HIGH",
    keys: [
      "following me",
      "followed",
      "follows me",
      "stalking",
      "stalker",
      "behind me",
      "chasing",
      "tailing me",
    ],
    summary: "You may be followed — treat it as real until proven otherwise.",
    advice: [
      "Do not go home. Head to the nearest open shop, cafe, petrol station or station.",
      "Cross the street twice; if they follow both times, assume it is deliberate.",
      "Call someone you trust and say your location out loud. Do not confront them.",
      "If they close in, shout, draw attention and press I NEED HELP.",
    ],
    action: "ALERT_CONTACTS",
  },
  {
    id: "harassment",
    risk: "HIGH",
    keys: [
      "harass",
      "harassing",
      "groped",
      "grope",
      "touched me",
      "flashing",
      "creep",
      "creepy man",
      "catcall",
      "won't leave me alone",
      "wont leave me alone",
    ],
    summary: "You are being harassed — get to people and support.",
    advice: [
      "Say loudly and firmly: 'Back off.' Attention is protection.",
      "Move toward staff, a guard or a group. Do not escalate physically.",
      "Ask one specific person for help: 'You in the red jacket, help me.'",
      "Alert your emergency contacts so someone knows where you are.",
    ],
    action: "ALERT_CONTACTS",
  },
  {
    id: "intruder",
    risk: "EMERGENCY",
    keys: ["intruder", "break in", "broke in", "someone in my house", "home invasion", "burglar"],
    summary: "Someone may be inside your home.",
    advice: [
      "Leave if you can. Never investigate.",
      "If you cannot leave, lock yourself in a room and stay quiet.",
      "Call 112 and give your address before anything else.",
      "Press I NEED HELP so your contacts get your location.",
    ],
    action: "I_NEED_HELP",
  },
  {
    id: "transport",
    risk: "MEDIUM",
    keys: ["taxi", "cab", "uber", "rickshaw", "auto driver", "driver is", "wrong route"],
    summary: "Unsafe ride — keep control of the trip.",
    advice: [
      "Share the vehicle number and your live trip with a contact now.",
      "Sit in the back on the passenger side, window slightly down.",
      "If the route feels wrong, ask to stop in a busy, lit area and get out.",
      "Keep the trip open on your screen and stay awake.",
    ],
    action: "START_SAFE_JOURNEY",
  },
  {
    id: "lost",
    risk: "MEDIUM",
    keys: ["lost", "don't know where i am", "dont know where i am", "no idea where"],
    summary: "You are disoriented — stop and get your bearings.",
    advice: [
      "Stop moving; wandering makes it worse.",
      "Use Nearby Safety to find the closest police station or 24/7 public place.",
      "Send your location to a trusted contact.",
      "Wait somewhere lit and populated until someone reaches you.",
    ],
    action: "ALERT_CONTACTS",
  },
  {
    id: "walking",
    risk: "MEDIUM",
    keys: [
      "walking home",
      "walking alone",
      "alone at night",
      "night walk",
      "waiting for a bus",
      "empty street",
      "dark street",
      "going home",
    ],
    summary: "Routine but exposed — take preventive steps.",
    advice: [
      "Start a Safe Journey so missed check-ins raise an alert.",
      "Stay on lit main roads; skip shortcuts, parks and empty lanes.",
      "Keep one ear free — no headphones in both ears.",
      "Keep the emergency screen one tap away.",
    ],
    action: "START_SAFE_JOURNEY",
  },
  {
    id: "unsafe",
    risk: "MEDIUM",
    keys: ["unsafe", "scared", "afraid", "anxious", "panic", "uncomfortable", "bad feeling"],
    summary: "Your instinct is flagging something — act before you're sure.",
    advice: [
      "Move to the nearest lit, busy place.",
      "Tell one person where you are and where you're going.",
      "Alert your contacts — a false alarm costs nothing.",
      "Breathe 4 in, 4 hold, 6 out, then decide your next two minutes.",
    ],
    action: "ALERT_CONTACTS",
  },
  {
    id: "safe",
    risk: "LOW",
    keys: ["i'm safe", "im safe", "i am safe", "i'm okay", "im okay", "i am fine", "made it home", "reached home", "all good"],
    summary: "Good — you're out of the situation.",
    advice: [
      "Tap I'M SAFE to check in and reset your journey timer.",
      "Let your contacts know you arrived.",
      "Note anything unusual while it's fresh, in case you report it later.",
    ],
    action: "IM_SAFE",
  },
];

function actionLabel(action: SafeAction) {
  return action === "NONE" ? "No action needed" : ACTION_LABELS[action];
}

/** Local, offline safety engine used as fallback when the AI API is unavailable. */
export function localAssess(input: string, ctx: SafeAiContext): SafeAiAssessment {
  const text = input.toLowerCase();
  const matches = CATEGORIES.filter((c) => c.keys.some((k) => text.includes(k)));

  let base: Category | undefined = matches.sort(
    (a, b) => RISK_ORDER.indexOf(b.risk) - RISK_ORDER.indexOf(a.risk),
  )[0];

  if (!base) {
    base = {
      id: "general",
      risk: "LOW",
      keys: [],
      summary: "No specific threat detected in what you described.",
      advice: [
        "Move somewhere lit and public before doing anything else.",
        "Tell one person where you are and where you're going.",
        "Start a Safe Journey so missed check-ins raise an alert.",
        "If danger becomes immediate, press I NEED HELP or call 112.",
      ],
      action: "START_SAFE_JOURNEY",
    };
  }

  let risk = base.risk;
  let action = base.action;
  const advice = [...base.advice];

  // Context-aware escalation
  if (ctx.checkInOverdue && base.id !== "safe") {
    risk = escalate(risk, "HIGH");
    advice.unshift("Your check-in is overdue — confirm you're safe or escalate now.");
    if (action === "START_SAFE_JOURNEY") action = "ALERT_CONTACTS";
  }
  if (ctx.checkInOverdue && risk === "HIGH" && matches.length > 0 && base.id !== "safe") {
    risk = escalate(risk, "EMERGENCY");
    action = "I_NEED_HELP";
  }
  if (ctx.journeyActive && action === "START_SAFE_JOURNEY") {
    action = base.id === "safe" ? "IM_SAFE" : "ALERT_CONTACTS";
  }
  if (action === "ALERT_CONTACTS" && ctx.contactsCount === 0) {
    advice.push("You have no emergency contacts saved — add one below so alerts reach someone.");
  }
  if (!ctx.locationAvailable && risk !== "LOW") {
    advice.push("Tap 'Use My Location' in Safe Journey so your coordinates are ready to share.");
  }

  return {
    risk,
    summary: base.summary,
    advice: advice.slice(0, 5),
    recommendedAction: action,
    recommendedActionLabel: actionLabel(action),
    source: "local",
  };
}

export function normalizeAssessment(
  raw: unknown,
  ctx: SafeAiContext,
  fallbackInput: string,
): SafeAiAssessment {
  const o = raw as Partial<SafeAiAssessment> | null;
  const risk = o?.risk && RISK_ORDER.includes(o.risk) ? o.risk : null;
  const advice = Array.isArray(o?.advice)
    ? o!.advice.filter((a) => typeof a === "string" && a.trim()).slice(0, 5)
    : [];
  if (!risk || advice.length === 0) return localAssess(fallbackInput, ctx);

  const action: SafeAction =
    o?.recommendedAction && o.recommendedAction in { ...ACTION_LABELS, NONE: "" }
      ? o.recommendedAction
      : "NONE";

  return {
    risk,
    summary: typeof o?.summary === "string" && o.summary.trim() ? o.summary : "Assessment ready.",
    advice,
    recommendedAction: action,
    recommendedActionLabel: actionLabel(action),
    source: "ai",
  };
}
