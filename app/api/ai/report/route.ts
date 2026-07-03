import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireSession } from "@/lib/api-auth";
import type { Profile } from "@/lib/types";
import type { ReportAggregate } from "@/hooks/useReportData";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (session instanceof NextResponse) return session;
  // Read-only (doctor) accounts may still generate the AI review.

  const { aggregatedData, period, profile } = (await req.json()) as {
    aggregatedData: ReportAggregate;
    period: number;
    profile: Profile;
  };

  if (!aggregatedData) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const symptomSummary =
    aggregatedData.symptomCounts
      .slice(0, 8)
      .map((s) => `${s.name} (${s.count}x)`)
      .join(", ") || "none";
  const medicineSummary =
    aggregatedData.medicineCounts.map((m) => `${m.name} (${m.count}x)`).join(", ") || "none";
  const moodSummary =
    aggregatedData.moodCounts.map((m) => `${m.name} (${m.count}x)`).join(", ") || "not tracked";

  const prompt = `Profile: ${profile.name}, ${profile.age}yo ${profile.gender}, height ${profile.height}cm, current weight ${profile.currentWeight}kg, target ${profile.targetWeight}kg, calorie target ${profile.calorieTarget}kcal.
Period: last ${period} days. Days logged: ${aggregatedData.loggedDays}/${aggregatedData.totalDays}.
Workout: ${aggregatedData.workoutDays} days done, ${aggregatedData.workoutConsistencyPct}% consistency, current streak ${aggregatedData.workoutStreak} days.
Avg daily calories: ${aggregatedData.avgCalories}kcal. Avg water: ${aggregatedData.avgWater} glasses/day.
Latest weight: ${aggregatedData.latestWeight ?? "not logged"}kg.
Symptoms: ${symptomSummary}.
Medicines: ${medicineSummary}.
Mood distribution: ${moodSummary}.`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 900,
      system: `You are a personal health coach reviewing ${period}-day tracked data for a health app user. Write a structured review with exactly these four sections, each starting with the emoji shown:
🟢 Working — what's going well
🟡 Watch — things trending in the wrong direction, not yet critical
🔴 Concerns — anything that needs real attention (be honest but not alarmist; never diagnose)
💡 Action Plan — 3-4 concrete, practical next steps

Keep it warm, specific to the data given, and concise, under 300 words total. Use Indian lifestyle context where relevant.`,
      messages: [{ role: "user", content: prompt }],
    });

    const review = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return NextResponse.json({ review });
  } catch (err) {
    console.error("report failed", err);
    return NextResponse.json({ error: "AI report failed" }, { status: 502 });
  }
}
