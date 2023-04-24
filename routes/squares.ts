import express from "express";

const squares = express.Router();

squares.get("/all", (req, res) => {
	res.send("All the squares");
});


// squares.get("/:id", (req, res) => {
// 	res.send("Square for id: " + req.params.id);
// });

squares.get("/squarecomponent", (req, res) => {});

squares.get("/squaretitlecomponent", (req, res) => {});

squares.get("/joinsquarebtncomponent", (req, res) => {});

squares.get("/postcomponent", (req, res) => {});

squares.get("/subnavcomponent", (req, res) => {
	res.render("components/subNavigation")
});

export default squares;
