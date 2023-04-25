import express from "express";

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static("public"));

app.get("/", (req, res) => res.render("pages/index"));

import squaresRouter from "./routes/squares";
import itemsRouter from "./routes/items";

app.use("/squares", squaresRouter);

app.use("/items", itemsRouter);

app.listen(3000, () => {
	console.log("Server running on port 3000");
});
