import express from "express";

const squares = express.Router();

squares.get("/all", (req, res) => {
	res.send("All the squares");
});
squares.get("/:id", (req, res) => {
	res.send("Square for id: " + req.params.id);
});

export default squares;
