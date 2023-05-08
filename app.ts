import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();

import { getAllItems } from "./services/item";
import { getObjectSignedUrl } from "./s3";
import { Item, Like, User } from "@prisma/client";

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
	try {
		const items = await getAllItems();
		if (!items) {
			res.status(404).json({
				message: "Items not found",
			});
			return;
		}

		for (const item of items) {
			const url = await getObjectSignedUrl(item.imgName);
			(
				item as Item & {
					likeCount: number;
					likes: Like[];
					user: User;
					imgUrl: string;
				}
			).imgUrl = url;
		}
		res.render("pages/index", { items });
	} catch (error) {
		res.status(500).send(error);
	}
});

import squaresRouter from "./routes/squares";
import itemsRouter from "./routes/items";
import usersRouter from "./routes/users";
import categories from "./routes/categories";
import apiRouter from "./routes/api";

app.use("/squares", squaresRouter);

app.use("/items", itemsRouter);

app.use("/categories", categories);

app.use("/users", usersRouter);

app.use("/api", apiRouter);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
