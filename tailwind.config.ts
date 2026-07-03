import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#08111E",
        surface: "#0D1B2A",
        border: "#162033",
        borderLight: "#1E3050",
        innerBg: "#0B1626",

        green: "#4ADE80",
        blue: "#38BDF8",
        amber: "#FBBF24",
        red: "#EF4444",
        purple: "#A78BFA",

        text: "#E8F4FF",
        textMuted: "#4B6080",
        textDim: "#8A9AB0",
      },
      borderRadius: {
        card: "18px",
        btn: "12px",
        input: "10px",
      },
      maxWidth: {
        app: "560px",
      },
    },
  },
  plugins: [],
};
export default config;
