import express from "express";

const test = express.Router();

// Do test.get(/<component name>/) for each component you want to test

test.get("/credentials", (req, res) =>
  res.render("pages/credentials", { state: null })
);

export default test;
