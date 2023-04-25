import express from "express";

const items = express.Router();

items.get("/all", (req, res) => {
	res.render("pages/itemList");
});

items.get("/itemcard", (req, res) => res.render("components/itemCard"));

items.get("/searchbar", (req, res) => {});

items.get("/itempage", (req, res) => {
	res.render("components/item");
});

items.get("/itembtns", (req, res) => {});

export default items;
