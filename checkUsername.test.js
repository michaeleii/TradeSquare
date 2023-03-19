const checkUsername = require("./checkUsername");

test("check if username is empty", () => {
	expect(checkUsername("")).toBe(false);
});

test("check if username is greater than 5 characters", () => {
	expect(checkUsername("michael123")).toBe(true);
});

test("check if username is greater than 5 characters", () => {
	expect(checkUsername("mic")).toBe(false);
});
