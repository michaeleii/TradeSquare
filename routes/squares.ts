import express from "express";
import multer from "multer";
import crypto from "crypto";
import { getAllSquares, getSquareById } from "../services/squares";
import {getAllPosts, createPost, getPostsBySquareId} from "../services/posts";
import { checkIfUserJoined } from "../services/user";
import { Square, Category, Item, Like, User, Post } from "@prisma/client";
import { uploadFile, deleteFile, getObjectSignedUrl } from "../s3";

const squares = express.Router();

const randomImageName = (bytes = 32) =>
	crypto.randomBytes(bytes).toString("hex");

const upload = multer({ storage: multer.memoryStorage() });

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
	const squareId = Number(req.query.squareId);
	const posts = await getPostsBySquareId(squareId); 
	// const posts = await getAllPosts();
	for (const post of posts) {
		const url = await getObjectSignedUrl(post.imageName);
		(
			post as Post & {
				imageName: string;
				date: Date;
				squareId: number | null;
				userId: number;
				imgUrl: string;
			}
		).imgUrl = url;
	}
	const squareName = req.query.square;
	res.render("pages/singleSquare", { posts, squareName, squareId });
});

squares
	.route("/create")
	.get((req, res) => {
		const squareName = req.query.square;
		const squareId = req.query.squareId;

		res.render("components/createPost", { squareName, squareId });
	})
	.post(upload.single("image"), async (req, res) => {
		if (!req.file) {
			return res.status(400).send("No file uploaded");
		}

		try {
			const imageName = randomImageName();
			await uploadFile(req.file.buffer, imageName, req.file.mimetype);

			req.body.imageName = imageName;
			req.body.userId = 9;
			req.body.squareId = Number(req.query.squareId);

			req.body.date = new Date();

			const post = await createPost(req.body);

			res.redirect('/squares/postcomponent');
		} catch (error: any) {
			res.status(500).send(error.message);
		}
	});


squares.get("/subnavcomponent", (req, res) => {
	res.render("components/subNavigation");
});

squares.get("/searchBarComponent", (req, res) => {
	res.render("components/searchBar");
});

export default squares;
