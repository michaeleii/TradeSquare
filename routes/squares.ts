import express from "express";
import getAllSquares from "../services/squares";

const squares = express.Router();

squares.get("/all", async (req, res) => {
	const squares = await getAllSquares();
	res.render("pages/squares", { squares });
});

// squares.get("/:id", (req, res) => {
// 	res.send("Square for id: " + req.params.id);
// });

squares.get("/squaretitlecomponent", (req, res) => {
	res.render("components/Square_Title_and_Description");
});

squares.get("/joinsquarebtncomponent", (req, res) => {});

squares.get("/postcomponent", (req, res) => res.render("components/postCard"));

squares.get("/subnavcomponent", (req, res) => {
	res.render("components/subNavigation");
});

squares.get("/searchBarComponent", (req, res) => {
	res.render("components/searchBar");
});

export default squares;
