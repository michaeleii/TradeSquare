import express, { NextFunction } from "express";
import dotenv from "dotenv";

import { getPopularItems } from "./services/item";
import {
  checkIfUserExists,
  getUserByAuth0Id,
  getUserReviews,
} from "./services/user";
import { getObjectSignedUrl } from "./s3";
import { Item, Like, User } from "@prisma/client";
import { auth } from "express-openid-connect";

import squaresRouter from "./routes/squares";
import itemsRouter from "./routes/items";
import usersRouter from "./routes/users";
import categories from "./routes/categories";
import apiRouter from "./routes/api";
import testRouter from "./routes/test";
import adminRouter from "./routes/admin";
import { getAllSortedCategories } from "./services/categories";
import { getAllSortedSquares } from "./services/squares";

dotenv.config();
const app = express();

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
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", checkIfUserExists, async (req, res, next) => {
  try {
    const items = await getPopularItems(req.oidc.user?.sub);
    if (items) {
      for (const item of items) {
        const sellerReviews = await getUserReviews(item.userId);
        const sellerAvgRatings =
          Math.round(
            (sellerReviews
              .map((review) => review.review.rating)
              .reduce((a, b) => a + b, 0) /
              sellerReviews.length) *
              2
          ) / 2;
        const url = await getObjectSignedUrl(item.imgName);
        (
          item as Item & {
            likeCount: number;
            likes: Like[];
            user: User;
            imgUrl: string;
          }
        ).imgUrl = url;
        (item as any).user.avgRatings = !sellerAvgRatings
          ? 0
          : sellerAvgRatings;
      }
    }

    const sortedCategories = (await getAllSortedCategories()).splice(0, 3);
    const sortedSquares = (await getAllSortedSquares()).splice(0, 3);

    const user = req.oidc.user
      ? await getUserByAuth0Id(req.oidc.user.sub)
      : null;

    res.render("pages/index", {
      items,
      sortedCategories,
      sortedSquares,
      isAuthenticated: req.oidc.isAuthenticated(),
      user,
    });
  } catch (error) {
    next(error);
  }
});
app
  .route("/userCredentials")
  .get((req, res) => {
    res.render("pages/credentials", { state: req.query.state });
  })
  .post((req, res) => {
    res.send("OKKKKK");
  });

app.use("/squares", squaresRouter);

app.use("/items", itemsRouter);

app.use("/categories", categories);

app.use("/users", usersRouter);

app.use("/api", apiRouter);

app.use("/test", testRouter);

app.use("/admin", adminRouter);

app.use(async (error: Error, req: any, res: any, next: NextFunction) => {
  console.log(error);
  const user = req.oidc.user ? await getUserByAuth0Id(req.oidc.user.sub) : null;
  res.render("pages/error", {
    error,
    user,
    isAuthenticated: req.oidc.isAuthenticated(),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
