"use client";

import { signOut, useSession } from "next-auth/react";
import { LogoIcon } from "./Logo";

export default function Header({ title, error }: { title: string; error?: string }) {
  const { data: session } = useSession();

  return (
    <div className="pt-6 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LogoIcon size={32} />
          <div>
            <h1 className="text-lg font-bold text-text">{title}</h1>
            {session?.user && (
              <p className="text-textMuted text-xs mt-0.5">
                {session.user.name}
                {session.user.role === "readonly" ? " · read only" : ""}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-textDim text-xs border border-borderLight rounded-btn px-3 py-1.5"
        >
          Sign out
        </button>
      </div>
      {error && <p className="text-red text-xs mt-2">{error}</p>}
    </div>
  );
}
