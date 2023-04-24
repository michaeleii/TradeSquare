/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./views/**/*.ejs"],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Roboto"', "sans-serif"],
			},
			colors: {
				primary: "#506DF6",
				grey: "#7E7E7E",
				darkgrey: "#6A6A6A",
				offwhite: "#F6F6F6",
			},
		},
	},
	plugins: [],
};
