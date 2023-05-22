import express from "express";
import multer from "multer";
import crypto from "crypto";
import { getAllSquares, getSquareById } from "../services/squares";
import { getAllPosts, createPost, getPostsBySquareId } from "../services/posts";
import { checkIfUserJoined, getUserByAuth0Id } from "../services/user";
import { Square, Category, Item, Like, User, Post } from "@prisma/client";
import { uploadFile, deleteFile, getObjectSignedUrl } from "../s3";
import { requiresAuth } from "express-openid-connect";

const squares = express.Router();

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const upload = multer({ storage: multer.memoryStorage() });

squares.get("/all", async (req, res, next) => {
  try {
    const squares = await getAllSquares();
    if (!squares) throw new Error("No squares found");
    const user = req.oidc.user
      ? await getUserByAuth0Id(req.oidc.user.sub)
      : null;
    if (!user) throw new Error("User not found");

    for (const square of squares) {
      const joined = await checkIfUserJoined(user.id, square.id);
      (
        square as Square & {
          joined: boolean;
        }
      ).joined = joined;
    }

    res.render("pages/squares", { squares, user });
  } catch (error) {
    next(error);
  }
});
squares.get("/:id", async (req, res, next) => {
  try {
    const id = +req.params.id;
    const square = await getSquareById(id);
    if (!square) throw new Error("Square not found");
    for (const post of square.posts) {
      const url = await getObjectSignedUrl(post.imageName);
      (post as any).imgUrl = url;
    }
    const user = req.oidc.user
      ? await getUserByAuth0Id(req.oidc.user.sub)
      : null;
    if (!user) throw new Error("User not found");

    (square as any).joined = await checkIfUserJoined(user.id, square.id);

    res.render("pages/singleSquare", { square, user });
  } catch (error) {
    next(error);
  }
});

squares
  .route("/create/:id")
  .get(requiresAuth(), async (req, res, next) => {
    try {
      const squareId = +req.params.id;
      const square = await getSquareById(squareId);
      if (!square) throw new Error("Square not found");
      res.render("pages/createPost", { square });
    } catch (error) {
      next(error);
    }
  })
  .post(upload.single("image"), async (req, res, next) => {
    try {
      if (!req.file) throw new Error("No file uploaded");
      const imageName = randomImageName();
      await uploadFile(req.file.buffer, imageName, req.file.mimetype);

      req.body.imageName = imageName;

      const user = await getUserByAuth0Id(req.oidc.user?.sub);
      if (!user) throw new Error("User not found");
      req.body.userId = user.id;
      req.body.squareId = +req.params.id;

      req.body.date = new Date(Date.now());

      await createPost(req.body);

      res.redirect(`/squares/${req.params.id}`);
    } catch (error) {
      next(error);
    }
  });

export default squares;
