/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                lux: {
                    bg: "#100c1a",
                    accent: "#ff0e59",
                }
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};
