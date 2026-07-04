import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { requireSession, requireWriteAccess } from "@/lib/api-auth";
import type { ChatMessage, DayLog, Profile } from "@/lib/types";

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
  const targetGlasses = Math.round(((profile.waterGoalLiters || 3) * 1000) / (profile.glassSizeMl || 250));
  const workoutParts = [
    dayContext?.workout?.walk
      ? `walked${dayContext.workout.steps ? ` (${dayContext.workout.steps} steps)` : ""}`
      : null,
    dayContext?.workout?.yoga ? "did yoga" : null,
    dayContext?.workout?.gym ? "went to the gym" : null,
    dayContext?.workout?.running
      ? `ran${dayContext.workout.runningKm ? ` (${dayContext.workout.runningKm}km)` : ""}`
      : null,
    dayContext?.workout?.tennis ? "played tennis" : null,
    dayContext?.workout?.badminton ? "played badminton" : null,
    dayContext?.workout?.pickleball ? "played pickleball" : null,
  ].filter(Boolean);
  const workoutText = workoutParts.length ? workoutParts.join(", ") : "no workout logged";

  const systemPrompt = `You are a supportive personal health & fitness coach embedded in a private health tracker app.
User profile: ${profile.name}, ${profile.age}yo ${profile.gender}, height ${profile.height}cm, current weight ${profile.currentWeight}kg, target weight ${profile.targetWeight}kg, daily calorie target ${profile.calorieTarget}kcal.
Today so far: ${consumed}kcal consumed, workout: ${workoutText}, water ${dayContext?.water ?? 0}/${targetGlasses} glasses, mood ${dayContext?.mood || "not set"}, symptoms: ${symptomsText}.
Be practical, warm, and concise. Use Indian food and lifestyle context where relevant. Do not diagnose medical conditions; suggest seeing a doctor for anything serious.`;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 800,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content } as const)),
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          console.error("coach stream error", err);
          controller.error(err);
        }
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
