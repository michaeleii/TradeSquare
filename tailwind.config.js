/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./views/**/*.ejs"],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Roboto"', "sans-serif"],
			},
		},
	},
	plugins: [],
};
