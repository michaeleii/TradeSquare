import express from "express";

const squares = express.Router();

squares.get("/all", (req, res) => {
  res.send("All the squares");
});
// squares.get("/:id", (req, res) => {
// 	res.send("Square for id: " + req.params.id);
// });

squares.get("/squarecomponent", (req, res) => {
  res.render("pages/squares");
});

squares.get("/squaretitlecomponent", (req, res) => {});

squares.get("/joinsquarebtncomponent", (req, res) => {});

squares.get("/postcomponent", (req, res) => {});

squares.get("/subnavcomponent", (req, res) => {});

export default squares;
