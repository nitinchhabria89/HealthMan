import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { requireSession, requireWriteAccess } from "@/lib/api-auth";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;
  const writeErr = requireWriteAccess(session);
  if (writeErr) return writeErr;

  const { image, mimeType, description, calorieTarget } = (await req.json()) as {
    image?: string;
    mimeType?: string;
    description?: string;
    calorieTarget?: number;
  };

  const hasImage = !!image && !!mimeType && ALLOWED_MIME.includes(mimeType);
  const hasDescription = !!description?.trim();

  if (!hasImage && !hasDescription) {
    return NextResponse.json({ error: "Provide an image or a description" }, { status: 400 });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const systemPrompt = `You are a nutrition assistant for a personal health tracker. ${
      hasImage
        ? "Identify the food items in the photo"
        : "Given a short text description of a meal, identify the likely food items"
    }, estimate total calories, and give a short one-line verdict relative to a daily calorie target of ${calorieTarget ?? 2000} kcal. Be concise and practical, aware of Indian food. End your response with a line in the exact format: "ESTIMATED_CALORIES: <number>".`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        hasImage
          ? {
              role: "user",
              content: [
                { type: "text", text: "What is this food and how many calories does it have?" },
                { type: "image_url", image_url: { url: `data:${mimeType};base64,${image}` } },
              ],
            }
          : {
              role: "user",
              content: `Meal description: ${description}\nHow many calories does this have?`,
            },
      ],
    });

    const text = completion.choices[0]?.message?.content || "";
    const match = text.match(/ESTIMATED_CALORIES:\s*(\d+)/i);
    const estimatedCalories = match ? parseInt(match[1], 10) : 0;
    const analysis = text.replace(/ESTIMATED_CALORIES:\s*\d+/i, "").trim();

    return NextResponse.json({ analysis, estimatedCalories });
  } catch (err) {
    console.error("analyze-food failed", err);
    return NextResponse.json({ error: "AI analysis failed" }, { status: 502 });
  }
}
