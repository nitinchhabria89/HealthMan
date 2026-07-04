"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "Today", icon: "☀" },
  { href: "/food", label: "Food", icon: "🍽" },
  { href: "/health", label: "Health", icon: "♥" },
  { href: "/workout", label: "Workout", icon: "⚡" },
  { href: "/coach", label: "Coach", icon: "✦" },
  { href: "/reports", label: "Reports", icon: "▤" },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50">
      <div className="max-w-app mx-auto flex">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center gap-1 py-2.5"
            >
              <span
                className="leading-none"
                style={{ fontSize: 24, opacity: active ? 1 : 0.5 }}
              >
                {tab.icon}
              </span>
              <span
                className={`leading-none ${active ? "text-green" : "text-textMuted"}`}
                style={{ fontSize: 11 }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
