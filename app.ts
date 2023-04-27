import express from "express";

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.render("pages/index"));

import squaresRouter from "./routes/squares";
import itemsRouter from "./routes/items";
import usersRouter from "./routes/users";

app.use("/squares", squaresRouter);

app.use("/items", itemsRouter);

app.use("/users", usersRouter);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
