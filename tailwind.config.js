/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'header-blue': '#5A7BA5',
        'table-header': '#DCE4F0',
        'border-gray': '#CCCCCC',
        'link-blue': '#1A0DAB',
        'hover-blue': '#F5F9FF',
      }
    },
  },
  plugins: [],
}
