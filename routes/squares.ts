import express from "express";

const squares = express.Router();

squares.get("/all", (req, res) => {
	res.send("All the squares");
});
// squares.get("/:id", (req, res) => {
// 	res.send("Square for id: " + req.params.id);
// });

squares.get("/squarecomponent", (req, res) => {});

squares.get("/squaretitlecomponent", (req, res) => {
	res.render('components/Square_Title_and_Description')
});

squares.get("/joinsquarebtncomponent", (req, res) => {});

squares.get("/postcomponent", (req, res) => res.render("components/postCard"));

squares.get("/subnavcomponent", (req, res) => {});

export default squares;
