import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireSession, requireWriteAccess } from "@/lib/api-auth";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
type AllowedMime = (typeof ALLOWED_MIME)[number];

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;
  const writeErr = requireWriteAccess(session);
  if (writeErr) return writeErr;

  const { image, mimeType, calorieTarget } = (await req.json()) as {
    image?: string;
    mimeType?: string;
    calorieTarget?: number;
  };

  if (!image || !mimeType || !ALLOWED_MIME.includes(mimeType as AllowedMime)) {
    return NextResponse.json({ error: "Invalid image" }, { status: 400 });
  }

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 500,
      system: `You are a nutrition assistant for a personal health tracker. Identify the food items in the photo, estimate total calories, and give a short one-line verdict relative to a daily calorie target of ${calorieTarget ?? 2000} kcal. Be concise and practical, aware of Indian food. End your response with a line in the exact format: "ESTIMATED_CALORIES: <number>".`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType as AllowedMime, data: image },
            },
            { type: "text", text: "What is this food and how many calories does it have?" },
          ],
        },
      ],
    });

    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const match = text.match(/ESTIMATED_CALORIES:\s*(\d+)/i);
    const estimatedCalories = match ? parseInt(match[1], 10) : 0;
    const analysis = text.replace(/ESTIMATED_CALORIES:\s*\d+/i, "").trim();

    return NextResponse.json({ analysis, estimatedCalories });
  } catch (err) {
    console.error("analyze-food failed", err);
    return NextResponse.json({ error: "AI analysis failed" }, { status: 502 });
  }
}
