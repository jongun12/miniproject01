/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                // Modern Sans (UI default)
                sans: ['Inter', 'Pretendard', 'system-ui', 'sans-serif'],
                // Tech Mono (Data/Code)
                mono: ['JetBrains Mono', 'D2Coding', 'Consolas', 'monospace'],
            },
            borderRadius: {
                // Rounded Soft Theme (12px)
                DEFAULT: '12px',
                xl: '12px',
            },
            boxShadow: {
                // Soft Shadow
                soft: '0 4px 6px rgba(0, 0, 0, 0.1)',
            },
            transitionDuration: {
                DEFAULT: '200ms', // Default transition 0.2s
            },
            transitionTimingFunction: {
                DEFAULT: 'ease-in-out',
            },
            scale: {
                '102': '1.02', // Hover interaction
            },
            maxWidth: {
                'contents': '1200px', // Main container
            },
        },
    },
    plugins: [],
}
