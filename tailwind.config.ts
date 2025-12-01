import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "rc-bg": "#020617", // deep blue/black
        "rc-card": "#020817",
        "rc-accent": "#f97316",
        "rc-accent-soft": "#fed7aa"
      },
      boxShadow: {
        neo: "0.25rem 0.25rem 0 #f97316" // neobrutal shadow
      },
      borderRadius: {
        neo: "0.75rem"
      }
    }
  },
  plugins: []
};

export default config;
