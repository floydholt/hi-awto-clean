// client/tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f9ff',
          100: '#e6f0ff',
          500: '#2563eb',
        }
      }
    },
  },
  plugins: [],
};
