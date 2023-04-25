/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./views/**/*.ejs"],
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
				grey: "#7E7E7E",
				darkgrey: "#414141",
				offwhite: "#F6F6F6",
			},
		},
	},
	plugins: [],
};
