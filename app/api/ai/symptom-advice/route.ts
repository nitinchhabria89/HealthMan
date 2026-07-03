import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireSession } from "@/lib/api-auth";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;

  const { symptom, userContext } = (await req.json()) as {
    symptom?: string;
    userContext?: string;
  };

  if (!symptom) {
    return NextResponse.json({ error: "Missing symptom" }, { status: 400 });
  }

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 400,
      system:
        "You are a practical home-health advisor for a personal health tracker, Indian household context. Given a symptom, suggest 2-4 safe, practical home remedies or lifestyle tips. Be concise, under 100 words. Always end with a one-line caveat to see a doctor if severe or persistent. Do not diagnose.",
      messages: [
        { role: "user", content: `Symptom: ${symptom}\nContext: ${userContext || "none"}` },
      ],
    });

    const advice = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return NextResponse.json({ advice });
  } catch (err) {
    console.error("symptom-advice failed", err);
    return NextResponse.json({ error: "AI advice failed" }, { status: 502 });
  }
}
