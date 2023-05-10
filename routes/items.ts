import express from "express";
import {
  createItem,
  getAllItems,
  getItemByItemId,
  updateItem,
  deleteItem,
} from "../services/item";
import { requiresAuth } from "express-openid-connect";

import { checkIfUserLiked } from "../services/user";

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
    const items = await getAllItems();

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
    res.render("pages/itemList", { items });
  } catch (error) {
    res.status(500).send(error);
  }
});

items
  .route("/create")
  .get((req, res) => {
    res.render("components/createListing");
  })
  .post(upload.single("image"), async (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    try {
      const imgName = randomImageName();
      await uploadFile(req.file.buffer, imgName, req.file.mimetype);

      req.body.imgName = imgName;
      req.body.userId = 9;
      req.body.categoryId = +req.body.categoryId;
      const item = await createItem(req.body);

      res.redirect(`/items/view/${item.id}`);
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

items.get("/my-item/:id", async (req, res) => {
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
  (
    item as Item & {
      category: Category;
      liked: boolean;
      likeCount: number;
      user: User;
      likes: Like[];
      imgUrl: string;
    }
  ).liked = await checkIfUserLiked(9, item.id);
  res.render("pages/editItem", { item });
});

items.get("/delete/:id", async (req, res) => {
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
  .get(async (req, res) => {
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

  (
    item.user as User & {
      liked: boolean;
    }
  ).liked = await checkIfUserLiked(9, item.id);

  res.render("pages/item", { item });
});

export default items;
