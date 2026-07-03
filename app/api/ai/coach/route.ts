import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireSession, requireWriteAccess } from "@/lib/api-auth";
import type { ChatMessage, DayLog, Profile } from "@/lib/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;
  const writeErr = requireWriteAccess(session);
  if (writeErr) return writeErr;

  const { messages, dayContext, profile } = (await req.json()) as {
    messages: ChatMessage[];
    dayContext: DayLog;
    profile: Profile;
  };

  if (!messages?.length) {
    return NextResponse.json({ error: "Missing messages" }, { status: 400 });
  }

  const consumed = (dayContext?.meals || []).reduce((s, m) => s + m.calories, 0);
  const symptomsText = (dayContext?.symptoms || []).map((s) => s.text).join(", ") || "none";

  const systemPrompt = `You are a supportive personal health & fitness coach embedded in a private health tracker app.
User profile: ${profile.name}, ${profile.age}yo ${profile.gender}, height ${profile.height}cm, current weight ${profile.currentWeight}kg, target weight ${profile.targetWeight}kg, daily calorie target ${profile.calorieTarget}kcal.
Today so far: ${consumed}kcal consumed, workout ${dayContext?.workout?.done ? `done (${dayContext.workout.type}, ${dayContext.workout.duration}min)` : "not done"}, water ${dayContext?.water ?? 0}/8 glasses, mood ${dayContext?.mood || "not set"}, symptoms: ${symptomsText}.
Be practical, warm, and concise. Use Indian food and lifestyle context where relevant. Do not diagnose medical conditions; suggest seeing a doctor for anything serious.`;

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-5",
      max_tokens: 800,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        stream.on("text", (text) => {
          controller.enqueue(encoder.encode(text));
        });
        stream.on("end", () => controller.close());
        stream.on("error", (err) => {
          console.error("coach stream error", err);
          controller.error(err);
        });
      },
      cancel() {
        stream.abort();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("coach failed", err);
    return NextResponse.json({ error: "AI coach failed" }, { status: 502 });
  }
}
