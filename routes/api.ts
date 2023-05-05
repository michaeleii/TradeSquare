import express from "express";
import { getAllItems } from "../services/item";

const api = express.Router();

api.get("/items", async (req, res) => {
	const items = await getAllItems();
	res.json(items);
});

api.get("/nav", (req, res) => res.render("components/navigationBar"));

export default api;
