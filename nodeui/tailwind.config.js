/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: ['./src/renderer/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            animation: {
                'fade-in': 'fadeIn 1s ease-out',
                flash: 'flash 0.5s ease-in-out 2'
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                flash: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.3' }
                }
            }
        }
    },
    plugins: [
        require('tailwindcss-animate'),
        require('tailwind-scrollbar'),
    ],
    corePlugins: {
        preflight: false,
    },
}
