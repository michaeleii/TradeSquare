import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();

import { getAllItems } from "./services/item";
import { getObjectSignedUrl } from "./s3";
import { Item, Like, User } from "@prisma/client";
import { auth } from "express-openid-connect";

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASEURL,
  clientID: process.env.CLIENTID,
  issuerBaseURL: process.env.ISSUER,
};

app.use(auth(config));

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
    res.render("pages/index", {
      items,
      isAuthenticated: req.oidc.isAuthenticated(),
      user: req.oidc.user,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});
app
  .route("/userCredentials")
  .get((req, res) => {
    console.log("STATE", req.query.state);
    res.render("pages/credentials", { state: req.query.state });
  })
  .post((req, res) => {
    console.log("BODY", req.body);
    res.send("OKKKKK");
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
