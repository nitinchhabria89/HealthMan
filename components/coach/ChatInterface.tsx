"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, DayLog, Profile } from "@/lib/types";
import QuickPrompts from "./QuickPrompts";

export default function ChatInterface({
  dayContext,
  profile,
  readonly,
}: {
  dayContext: DayLog;
  profile: Profile;
  readonly: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading || readonly) return;
    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, dayContext, profile }),
      });

      if (!res.ok) throw new Error("failed");

      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: acc };
            return copy;
          });
        }
      } else {
        const text = await res.text();
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: text };
          return copy;
        });
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "Sorry, I couldn't respond. Try again.",
        };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 220px)" }}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-3">
        {messages.length === 0 && (
          <p className="text-textDim text-sm pt-4">
            Ask me anything about your health, food, or workouts.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[80%] rounded-input px-3 py-2 text-sm whitespace-pre-wrap"
              style={{
                background: m.role === "user" ? "rgba(56,189,248,0.15)" : "#0D1B2A",
                border: `1px solid ${m.role === "user" ? "#38BDF8" : "#162033"}`,
                color: "#E8F4FF",
              }}
            >
              {m.content || (loading && i === messages.length - 1 ? "..." : "")}
            </div>
          </div>
        ))}
      </div>

      {!readonly && <QuickPrompts onPick={send} />}

      {readonly ? (
        <p className="text-textDim text-xs text-center py-3">Read-only account · cannot chat</p>
      ) : (
        <div className="flex gap-2 pt-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send(input);
            }}
            placeholder="Ask your coach..."
            className="flex-1 bg-innerBg border border-borderLight rounded-input px-3 py-2.5 text-text text-sm outline-none focus:border-blue"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="bg-blue text-bg rounded-btn px-4 text-sm font-medium disabled:opacity-50"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
