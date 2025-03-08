module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // Ensure this matches your file structure
  ],
  theme: {
    extend: {
      animation: {
        'float': 'float 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};