import express from "express";

const items = express.Router();

const item = {
	id: 1,
	name: "Wall Decor for Living Room",
	description:
		"2 modern minimalistic paintings. I don't like the style and would like to trade it for something more flashy.",
	user: {
		f_name: "John",
		l_name: "Doe",
		rating: 4.5,
	},
	likes: 20,
};

items.get("/all", (req, res) => {
	res.render("pages/itemList", { items: item });
});

items.get("/itemcard", (req, res) => res.render("components/itemCard"));

items.get("/searchbar", (req, res) => {});

items.get("/itempage", (req, res) => {
	res.render("components/item");
});

items.get("/itembtns", (req, res) => {});

export default items;
