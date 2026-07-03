"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-app">
        <h1 className="text-xl font-semibold text-text mb-1">
          {process.env.NEXT_PUBLIC_APP_NAME || "Health Tracker"}
        </h1>
        <p className="text-textMuted text-sm mb-8">Sign in to continue</p>

        <div
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit(e as unknown as React.FormEvent);
          }}
          className="bg-surface border border-border rounded-card p-5 space-y-4"
        >
          <div>
            <label className="label mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-innerBg border border-borderLight rounded-input px-3 py-2.5 text-text text-sm outline-none focus:border-blue"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-innerBg border border-borderLight rounded-input px-3 py-2.5 text-text text-sm outline-none focus:border-blue"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-red text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="w-full bg-green text-bg font-medium rounded-btn py-2.5 text-sm disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
