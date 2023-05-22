import express from "express";
import {
  createItem,
  getAllItems,
  getItemByItemId,
  updateItem,
  deleteItem,
} from "../services/item";
import { requiresAuth } from "express-openid-connect";

import { checkIfUserLiked, getUserByAuth0Id } from "../services/user";

import multer from "multer";
import { Category, Item, Like, User } from "@prisma/client";
import { uploadFile, deleteFile, getObjectSignedUrl } from "../s3";
import crypto from "crypto";

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const upload = multer({ storage: multer.memoryStorage() });

const items = express.Router();

items.get("/all", async (req, res) => {
  try {
    const items = await getAllItems(req.oidc.user?.sub);

    if (!items) return res.status(404).send("Items not found");

    for (const item of items) {
      const url = await getObjectSignedUrl(item.imgName);
      (
        item as Item & {
          likeCount: number;
          user: User;
          likes: Like[];
          imgUrl: string;
        }
      ).imgUrl = url;
    }

    const user = req.oidc.user
      ? await getUserByAuth0Id(req.oidc.user.sub)
      : null;
    res.render("pages/itemList", { items, user });
  } catch (error) {
    res.status(500).send(error);
  }
});

items
  .route("/create")
  .get(requiresAuth(), (req, res) => {
    res.render("pages/createListing");
  })
  .post(upload.single("image"), async (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    try {
      const imgName = randomImageName();
      await uploadFile(req.file.buffer, imgName, req.file.mimetype);
      req.body.imgName = imgName;

      const user = await getUserByAuth0Id(req.oidc.user?.sub);
      if (!user) return res.status(404).send("User not found");
      req.body.userId = user.id;
      req.body.categoryId = +req.body.categoryId;
      const item = await createItem(req.body);

      res.redirect(`/items/view/${item.id}`);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

items.get("/my-item/:id", requiresAuth(), async (req, res) => {
  const item = await getItemByItemId(+req.params.id);
  if (!item) return res.status(404).send("Item not found");
  const url = await getObjectSignedUrl(item.imgName);
  (
    item as Item & {
      category: Category;
      likeCount: number;
      user: User;
      likes: Like[];
      imgUrl: string;
    }
  ).imgUrl = url;

  const user = req.oidc.user ? await getUserByAuth0Id(req.oidc.user.sub) : null;
  if (user) {
    (
      item as Item & {
        category: Category;
        liked: boolean;
        likeCount: number;
        user: User;
        likes: Like[];
        imgUrl: string;
      }
    ).liked = await checkIfUserLiked(user.id, item.id);
  }

  res.render("pages/editItem", { item });
});

items.get("/delete/:id", requiresAuth(), async (req, res) => {
  try {
    const item = await getItemByItemId(+req.params.id);
    if (!item) return res.status(404).send("Item not found");
    await deleteFile(item.imgName);
    await deleteItem(+req.params.id);
    res.redirect("/items/all");
  } catch (error) {
    res.status(500).send(error);
  }
});

items
  .route("/edit/:id")
  .get(requiresAuth(), async (req, res) => {
    const item = await getItemByItemId(+req.params.id);
    if (!item) return res.status(404).send("Item not found");
    res.render("pages/editListing", { item });
  })
  .post(async (req, res) => {
    const [itemId, formData] = [+req.params.id, req.body];
    await updateItem(itemId, formData);
    res.redirect(`/items/my-item/${itemId}`);
  });

items.get("/view/:id", async (req, res) => {
  const item = await getItemByItemId(+req.params.id);
  if (!item) return res.status(404).send("Item not found");

  const url = await getObjectSignedUrl(item.imgName);
  (
    item as Item & {
      category: Category;
      likeCount: number;
      user: User;
      likes: Like[];
      imgUrl: string;
    }
  ).imgUrl = url;

  const user = req.oidc.user ? await getUserByAuth0Id(req.oidc.user.sub) : null;
  if (user) {
    (
      item.user as User & {
        liked: boolean;
      }
    ).liked = await checkIfUserLiked(user.id, item.id);
  }
  res.render("pages/item", { item, user });
});

export default items;
