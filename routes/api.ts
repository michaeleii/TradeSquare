import express from "express";
import { getAllItems } from "../services/item";
import { checkIfUserLiked, likeItem, unlikeItem } from "../services/user";

const api = express.Router();

api.get("/items", async (req, res) => {
	const items = await getAllItems();
	res.json(items);
});

api.get("/nav", (req, res) => res.render("components/navigationBar"));

api.post("/item/like", async (req, res) => {
	const { itemId } = req.body;
	const userId = 9;
	const liked = await checkIfUserLiked(userId, +itemId);
	liked ? await unlikeItem(userId, +itemId) : await likeItem(userId, +itemId);
});

export default api;
