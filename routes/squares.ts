import express from "express";
import getAllSquares from "../services/squares";
import { getAllPosts, createPost, getPostsBySquareId } from '../services/posts';


import multer from "multer";
import { Category, Item, Like, User } from "@prisma/client";
import { uploadFile, deleteFile, getObjectSignedUrl } from "../s3";
import crypto from "crypto";
import {Post} from "@prisma/client";

const randomImageName = (bytes = 32) =>
	crypto.randomBytes(bytes).toString("hex");

const upload = multer({ storage: multer.memoryStorage() });

const squares = express.Router();



// squares.get("/:id", (req, res) => {
// 	res.send("Square for id: " + req.params.id);
// });

squares.get("/squaretitlecomponent", (req, res) => {
	res.render("components/Square_Title_and_Description");
});

squares.get("/joinsquarebtncomponent", (req, res) => {});


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

squares.get("/mysquarecomponent", (req, res) => 
 res.render("components/mySquare")
);

squares.get("/all", async (req, res) => {
	const squares = await getAllSquares();
	res.render("pages/squares", { squares });
});

export default squares;
