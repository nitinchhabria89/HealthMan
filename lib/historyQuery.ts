import type OpenAI from "openai";
import { getDays } from "./kv";
import { datesInRange, todayStr } from "./utils";
import type { Workout } from "./types";

const WORKOUT_KEYS: (keyof Workout)[] = [
  "walk",
  "yoga",
  "gym",
  "running",
  "tennis",
  "badminton",
  "pickleball",
];

type ParsedQuery = {
  isQuery: boolean;
  metric?: "symptom" | "workout" | "mood" | "medicine";
  value?: string;
  startDate?: string;
  endDate?: string;
};

// Only worth the extra classification call when the message plausibly asks
// for a historical count — cheap regex gate before spending an API call.
const QUERY_HINT = /how (many|often)|number of times|count|times did/i;

export async function answerHistoryQuery(
  openai: OpenAI,
  email: string,
  question: string
): Promise<string | null> {
  if (!QUERY_HINT.test(question)) return null;

  let parsed: ParsedQuery;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 200,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Determine if this message is asking for a historical count/statistic from the user's tracked health data (symptoms, workouts, mood, or medicines) over a date range. Today's date is ${todayStr()}.
If yes, respond with JSON: {"isQuery": true, "metric": "symptom"|"workout"|"mood"|"medicine", "value": "<lowercase keyword>", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD"}.
For metric "workout", value must be exactly one of: walk, yoga, gym, running, tennis, badminton, pickleball.
If no, respond with JSON: {"isQuery": false}.
Respond with only JSON, no other text.`,
        },
        { role: "user", content: question },
      ],
    });
    parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
  } catch (err) {
    console.error("history query classification failed", err);
    return null;
  }

  if (!parsed?.isQuery || !parsed.metric || !parsed.value || !parsed.startDate || !parsed.endDate) {
    return null;
  }

  const dates = datesInRange(parsed.startDate, parsed.endDate);
  if (dates.length === 0) return null;

  const days = await getDays(email, dates);
  const value = parsed.value.toLowerCase();

  let count = 0;
  if (parsed.metric === "symptom") {
    count = days.reduce(
      (sum, d) => sum + d.symptoms.filter((s) => s.text.toLowerCase().includes(value)).length,
      0
    );
  } else if (parsed.metric === "workout") {
    if (!WORKOUT_KEYS.includes(value as keyof Workout)) return null;
    count = days.filter((d) => !!d.workout?.[value as keyof Workout]).length;
  } else if (parsed.metric === "mood") {
    count = days.filter((d) => d.mood.toLowerCase() === value).length;
  } else if (parsed.metric === "medicine") {
    count = days.reduce(
      (sum, d) => sum + d.medicines.filter((m) => m.name.toLowerCase().includes(value)).length,
      0
    );
  }

  return `EXACT ANSWER (computed directly from the user's real tracked data, not an estimate): ${count} — metric "${parsed.metric}" matching "${parsed.value}", date range ${parsed.startDate} to ${parsed.endDate}. State this exact number clearly in your reply; do not recompute or guess.`;
}
