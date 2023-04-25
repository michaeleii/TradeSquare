import express from "express";
import { getAllItems, getItemByItemId } from "../models/item";

const items = express.Router();

items.get("/all", (req, res) => {
	const items = getAllItems();
	res.render("pages/itemList", { items });
});

items.get("/:id", (req, res) => {
	const item = getItemByItemId(+req.params.id);
	if (item) {
		res.render("pages/item", { item });
	} else {
		res.status(404).send("Item not found");
	}
});

items.get("/itemcard", (req, res) => res.render("components/itemCard"));

items.get("/searchbar", (req, res) => {});

items.get("/itempage", (req, res) => {
	res.render("components/item");
});

items.get("/itembtns", (req, res) => {});

export default items;
