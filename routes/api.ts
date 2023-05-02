import express from "express";
import { getAllItems } from "../models/item";

const api = express.Router();

api.get("/items", async (req, res) => {
	const items = await getAllItems();
	res.json(items);
});

export default api;
