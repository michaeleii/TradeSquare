import express from "express";
import { getUserById } from "../models/user";

const users = express.Router();

users.get("/:id", async (req, res) => {
	const id = +req.params.id;
	const user = await getUserById(id);
	if (!user) {
		res.status(404).json({
			message: "User not found",
		});
		return;
	}
	console.log("user:", user);
	res.render("pages/seller", { user: user });
});

export default users;
