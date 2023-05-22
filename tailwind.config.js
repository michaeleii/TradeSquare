/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs", "./public/src/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Roboto"', "sans-serif"],
      },
      colors: {
        bkg: "rgb(var(--color-bkg) / <alpha-value>)",
        content: "rgb(var(--color-content) / <alpha-value>)",
        secondary: {
          DEFAULT: "rgb(var(--color-secondary-bkg) / <alpha-value>)",
          dark: "rgb(var(--color-secondary-hover) / <alpha-value>)",
        },
        heading: "rgb(var(--color-content-heading) / <alpha-value>)",
        stroke: "rgb(var(--color-stroke) / <alpha-value>)",
        primary: {
          DEFAULT: "#506DF6",
          dark: "#3B4BDB",
        },
        danger: {
          DEFAULT: "#F65064",
          dark: "#D53E4F",
        },
        success: {
          DEFAULT: "#00C48C",
          dark: "#00A376",
        },
        grey: "#7E7E7E",
        darkgrey: "#414141",
        offwhite: "#F6F6F6",
      },
    },
  },
  plugins: [],
};
