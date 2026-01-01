/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

export default {
    content: [
        "./index.html",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
        "./index.tsx"
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "bg-main": "#111111",
                "bg-card": "#1d1f20",
                "bg-panel": "#1f1e25",
                "primary": "#8a2ce2",
                "accent-purple": "#b946e9",
                "accent-cyan": "#00f0ff",
                "accent-red": "#ef4444",
                "accent-green": "#22c55e",
                "accent-yellow": "#eab308",
                "text-main": "#ffffff",
                "text-muted": "#9ca3af",
                "status-green": "#22c55e",
                "status-yellow": "#eab308",
                "status-red": "#ef4444",
            },
            fontFamily: {
                "display": ["Exo 2", "sans-serif"],
                "body": ["Inter", "sans-serif"],
                "signature": ["Great Vibes", "cursive"]
            },
            borderRadius: {
                "3xl": "1.5rem",
                "4xl": "2.25rem",
            },
            boxShadow: {
                "glow": "0 0 15px rgba(185, 70, 233, 0.25)",
                "card": "0 8px 30px rgba(0, 0, 0, 0.5)",
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [
        forms,
        containerQueries,
    ],
}
