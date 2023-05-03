import express from "express";
import { getAllItems } from "../services/item";

const api = express.Router();

api.get("/items", async (req, res) => {
	const items = await getAllItems();
	res.json(items);
});

export default api;
