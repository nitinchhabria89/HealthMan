import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        bg: "#F8FAFC",
        surface: "#FFFFFF",
        border: "#E2E8F0",
        borderLight: "#EDF1F5",
        innerBg: "#F1F5F9",

        green: "#16A34A",
        blue: "#0056D2",
        amber: "#D97706",
        red: "#DC2626",
        purple: "#7C3AED",

        text: "#0F172A",
        textMuted: "#64748B",
        textDim: "#94A3B8",
      },
      borderRadius: {
        card: "20px",
        btn: "12px",
        input: "10px",
      },
      boxShadow: {
        card: "0 10px 30px rgba(15, 23, 42, 0.06)",
      },
      maxWidth: {
        app: "560px",
      },
    },
  },
  plugins: [],
};
export default config;
