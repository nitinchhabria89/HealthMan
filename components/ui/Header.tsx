"use client";

import { signOut, useSession } from "next-auth/react";

export default function Header({ title }: { title: string }) {
  const { data: session } = useSession();

  return (
    <div className="flex items-center justify-between pt-6 pb-4">
      <div>
        <h1 className="text-lg font-semibold text-text">{title}</h1>
        {session?.user && (
          <p className="text-textMuted text-xs mt-0.5">
            {session.user.name}
            {session.user.role === "readonly" ? " · read only" : ""}
          </p>
        )}
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="text-textDim text-xs border border-borderLight rounded-btn px-3 py-1.5"
      >
        Sign out
      </button>
    </div>
  );
}
