const multiply = require("./multiply");

test("multiplying 3 by 5 to equal 15", () => {
  expect(multiply(3, 5)).toBe(15);
});
