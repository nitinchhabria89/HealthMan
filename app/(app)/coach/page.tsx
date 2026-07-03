"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/ui/Header";
import ChatInterface from "@/components/coach/ChatInterface";
import { useDay } from "@/hooks/useDay";
import { useProfile } from "@/hooks/useProfile";
import { todayStr } from "@/lib/utils";

export default function CoachPage() {
  const date = useMemo(() => todayStr(), []);
  const { day, loading: dayLoading } = useDay(date);
  const { profile, loading: profileLoading } = useProfile();
  const { data: session } = useSession();
  const readonly = session?.user?.role === "readonly";

  if (dayLoading || profileLoading) return <p className="text-textDim text-sm pt-6">Loading...</p>;

  return (
    <div>
      <Header title="Coach" />
      <ChatInterface dayContext={day} profile={profile} readonly={readonly} />
    </div>
  );
}
