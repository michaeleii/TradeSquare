import express from "express";
import { getAllItems, getItemByItemId } from "../models/item";

const items = express.Router();

items.get("/all", async (req, res) => {
	const items = await getAllItems();
	res.render("pages/itemList", { items });
});

items
	.route("/createListing")
	.get((req, res) => {
		res.render("components/createListing");
	})
	.post((req, res) => {});

items.get("/seller/:id", (req, res) => {
	const sellerId = req.params.id;
  	res.render("components/seller")
});

items.get("/:id", async (req, res) => {
	const item = await getItemByItemId(+req.params.id);
	if (item) {
		res.render("pages/item", { item });
	} else {
		res.status(404).render("pages/error", {
			message: "Item not found",
			error: {
				status: "404",
				stack: "The item you are looking for does not exist",
			},
		});
	}
});

items.get("/itemcard", (req, res) => res.render("components/itemCard"));

items.get("/searchbar", (req, res) => {});

items.get("/itempage", (req, res) => {
	res.render("components/item");
});

items.get("/itembtns", (req, res) => {});




export default items;
