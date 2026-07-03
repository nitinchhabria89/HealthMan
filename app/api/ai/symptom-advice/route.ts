import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { requireSession } from "@/lib/api-auth";

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
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content:
            "You are a practical home-health advisor for a personal health tracker, Indian household context. Given a symptom, suggest 2-4 safe, practical home remedies or lifestyle tips. Be concise, under 100 words. Always end with a one-line caveat to see a doctor if severe or persistent. Do not diagnose.",
        },
        { role: "user", content: `Symptom: ${symptom}\nContext: ${userContext || "none"}` },
      ],
    });

    const advice = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ advice });
  } catch (err) {
    console.error("symptom-advice failed", err);
    return NextResponse.json({ error: "AI advice failed" }, { status: 502 });
  }
}
