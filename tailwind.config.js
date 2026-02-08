/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./views/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}"
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: "#6366f1",
                secondary: "#8b5cf6",
                accent: "#2dd4bf",
                "background-light": "#f8fafc",
                "background-dark": "#020617",
                "card-dark": "rgba(16, 20, 36, 0.7)",
                "border-dark": "rgba(255, 255, 255, 0.05)",
            },
            fontFamily: {
                sans: ["Plus Jakarta Sans", "sans-serif"],
                display: ["Space Grotesk", "sans-serif"],
                futuristic: ["Orbitron", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/forms'),
    ],
}
