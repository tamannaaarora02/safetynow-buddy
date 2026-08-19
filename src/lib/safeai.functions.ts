import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  localAssess,
  normalizeAssessment,
  type SafeAiAssessment,
} from "@/lib/safeai-engine";

const contextSchema = z.object({
  journeyActive: z.boolean(),
  destination: z.string(),
  checkedIn: z.boolean(),
  checkInOverdue: z.boolean(),
  locationAvailable: z.boolean(),
  contactsCount: z.number(),
});

const inputSchema = z.object({
  message: z.string().min(1).max(2000),
  context: contextSchema,
});

const SYSTEM = `You are SafeAI, the safety decision assistant inside a personal safety app called SAFELY.
Analyse the user's described situation and return a risk assessment.

Rules:
- Prioritise immediate personal safety above all else.
- Recommend moving toward public, crowded, well-lit places when appropriate.
- Recommend contacting trusted people when appropriate.
- Recommend emergency services (112) when there is immediate danger.
- NEVER encourage confrontation, chasing, filming an attacker, or other risky behaviour.
- NEVER claim you have contacted anyone or any authority. You can only recommend; the user must confirm every action in the app.
- If danger is immediate, state plainly that AI advice is not a substitute for emergency services.
- Advice must be 3-4 short, concrete, actionable steps written in second person.

Risk levels: LOW, MEDIUM, HIGH, EMERGENCY.
Recommended actions (choose the single most useful app action): START_SAFE_JOURNEY, IM_SAFE, ALERT_CONTACTS, I_NEED_HELP, NONE.
Use the provided app context: an overdue check-in or an active journey with distress raises the risk level.`;

export const assessSituation = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<SafeAiAssessment> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return localAssess(data.message, data.context);

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-5.6-sol",
          messages: [
            { role: "system", content: SYSTEM },
            {
              role: "user",
              content: `App context: ${JSON.stringify(data.context)}\n\nSituation: ${data.message}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "safety_assessment",
              strict: true,
              schema: {
                type: "object",
                additionalProperties: false,
                properties: {
                  risk: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "EMERGENCY"] },
                  summary: { type: "string" },
                  advice: { type: "array", items: { type: "string" } },
                  recommendedAction: {
                    type: "string",
                    enum: [
                      "START_SAFE_JOURNEY",
                      "IM_SAFE",
                      "ALERT_CONTACTS",
                      "I_NEED_HELP",
                      "NONE",
                    ],
                  },
                },
                required: ["risk", "summary", "advice", "recommendedAction"],
              },
            },
          },
        }),
      });

      if (!res.ok) {
        console.error("SafeAI gateway error", res.status, await res.text());
        return localAssess(data.message, data.context);
      }

      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = json.choices?.[0]?.message?.content;
      if (!content) return localAssess(data.message, data.context);
      return normalizeAssessment(JSON.parse(content), data.context, data.message);
    } catch (e) {
      console.error("SafeAI failed", e);
      return localAssess(data.message, data.context);
    }
  });
