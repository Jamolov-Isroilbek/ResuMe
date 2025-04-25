module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0077b6", // Brand color
        secondary: "#0096c7", // CTA buttons
        background: "#f8f9fa", // Light mode background
        darkBackground: "#1b1f3b", // Dark mode background
        textDark: "#333333", // Text color
        textLight: "#e0e1dd", // Light text color
        accent: "#f77f00", // Accent color
      },
      fontFamily: {
        heading: ["Inter", "sans-serif"],
        body: ["Open Sans", "sans-serif"],
        branding: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
