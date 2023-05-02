import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.render("pages/index"));

import squaresRouter from "./routes/squares";
import itemsRouter from "./routes/items";
import usersRouter from "./routes/users";
import categories from "./routes/categories";

app.use("/squares", squaresRouter);

app.use("/items", itemsRouter);

app.use("/categories", categories);

app.use("/users", usersRouter);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
