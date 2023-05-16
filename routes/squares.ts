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

squares.get("/all", async (req, res) => {
  const squares = await getAllSquares();
  if (!squares) {
    res.status(404).send("Squares not found");
    return;
  }
  const user = req.oidc.user ? await getUserByAuth0Id(req.oidc.user.sub) : null;
  if (user) {
    for (const square of squares) {
      const joined = await checkIfUserJoined(user.id, square.id);
      (
        square as Square & {
          joined: boolean;
        }
      ).joined = joined;
    }
  }
  res.render("pages/squares", { squares, user });
});
squares.get("/:id", async (req, res) => {
  const id = +req.params.id;
  const square = await getSquareById(id);
  if (!square) {
    res.status(404).send("Square not found");
    return;
  }
  for (const post of square.posts) {
    const url = await getObjectSignedUrl(post.imageName);
    (post as any).imgUrl = url;
  }
  const user = req.oidc.user ? await getUserByAuth0Id(req.oidc.user.sub) : null;
  if (user) {
    (square as any).joined = await checkIfUserJoined(user.id, square.id);
  }
  res.render("pages/singleSquare", { square, user });
});

squares
  .route("/create/:id")
  .get(requiresAuth(), async (req, res) => {
    const squareId = +req.params.id;
    const square = await getSquareById(squareId);
    if (!square) {
      res.status(404).send("Square not found");
      return;
    }

    res.render("components/createPost", { square });
  })
  .post(upload.single("image"), async (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    try {
      const imageName = randomImageName();
      await uploadFile(req.file.buffer, imageName, req.file.mimetype);

      req.body.imageName = imageName;

      const user = await getUserByAuth0Id(req.oidc.user?.sub);
      if (!user) return res.status(404).send("User not found");
      req.body.userId = user.id;
      req.body.squareId = +req.params.id;

      req.body.date = new Date(Date.now());

      await createPost(req.body);

      res.redirect(`/squares/${req.params.id}`);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

export default squares;
