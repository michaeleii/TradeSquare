import express from "express";

const items = express.Router();

items.get("/all", (req, res) => {
	res.send("All the items");
});

items.get("/itemcard", (req, res) => {});

items.get("/searchbar", (req, res) => {});

items.get("/itempage", (req, res) => {});

items.get("/itembtns", (req, res) => {});

export default items;
