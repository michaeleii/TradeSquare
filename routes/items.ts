import express from "express";
import {
  createItem,
  getAllItems,
  getItemByItemId,
  updateItem,
  deleteItem,
} from "../services/item";
import multer from "multer";
import { Item, User } from "@prisma/client";
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
          user: User;
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
      req.body.userId = 1;
      req.body.categoryId = +req.body.categoryId;
      const item = await createItem(req.body);

      res.redirect(`/items/view/${item.id}`);
    } catch (error) {
      res.status(500).send(error);
    }
  });

items.get("/my-item/:id", async (req, res) => {
  const item = await getItemByItemId(+req.params.id);
  if (!item) return res.status(404).send("Item not found");
  const url = await getObjectSignedUrl(item.imgName);
  (
    item as Item & {
      user: User;
      imgUrl: string;
    }
  ).imgUrl = url;
  res.render("pages/EditItem", { item });
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
      user: User;
      imgUrl: string;
    }
  ).imgUrl = url;
  res.render("pages/item", { item });
});

export default items;
