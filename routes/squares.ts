import express from "express";
import { getAllSquares, getSquareById } from "../services/squares";
import getALlPosts from "../services/posts";
import { checkIfUserJoined } from "../services/user";
import { Square } from "@prisma/client";

const squares = express.Router();

squares.get("/all", async (req, res) => {
	const squares = await getAllSquares();
	if (!squares) {
		res.status(404).send("Squares not found");
		return;
	}
	for (const square of squares) {
		const joined = await checkIfUserJoined(9, square.id);
		(
			square as Square & {
				joined: boolean;
			}
		).joined = joined;
	}
	res.render("pages/squares", { squares });
});
squares.get("/:id", async (req, res) => {
	const id = +req.params.id;
	const square = await getSquareById(id);
	if (!square) {
		res.status(404).send("Square not found");
		return;
	}
	(square as any).joined = await checkIfUserJoined(9, square.id);
	res.render("pages/singleSquare", { square });
});
squares.get("/mysquarecomponent", (req, res) =>
	res.render("components/mySquare")
);

squares.get("/squaretitlecomponent", (req, res) => {
	res.render("components/Square_Title_and_Description");
});

squares.get("/postcomponent", async (req, res) => {
	const posts = await getALlPosts();
	res.render("pages/singleSquare", { posts });
});

squares.get("/subnavcomponent", (req, res) => {
	res.render("components/subNavigation");
});

squares.get("/searchBarComponent", (req, res) => {
	res.render("components/searchBar");
});

export default squares;
