/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs", "./public/src/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Roboto"', "sans-serif"],
      },
      colors: {
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
