const subtract = require("./subtract");

test("subtracts 2 - 2 to equal 0", () => {
    expect(subtract(2, 2)).toBe(1);
});