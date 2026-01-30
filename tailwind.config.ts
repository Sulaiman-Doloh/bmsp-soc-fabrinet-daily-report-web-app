/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // เพิ่มชื่อเล่นให้ฟอนต์ Arapey ว่า 'arapey'
        arapey: ['var(--font-arapey)', 'Arapey', 'serif'],
      },
    },
  },
  plugins: [],
}