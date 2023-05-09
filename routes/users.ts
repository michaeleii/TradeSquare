import express from "express";
import { getUserById, getUserLikedItems } from "../services/user";
import { Category, Item } from "@prisma/client";
import { getObjectSignedUrl } from "../s3";
import { requiresAuth } from "express-openid-connect";

const users = express.Router();

users.get("/profile/:id", requiresAuth(), async (req, res) => {
  const id = Number(req.params.id);
  const user = await getUserById(id);
  if (!user) {
    res.status(404).json({
      message: "User not found",
    });
    return;
  }
  res.render("pages/profile", {
    user: user,
    previousLink: req.headers.referer,
  });
});

users.get("/my-items", async (req, res) => {
  const user = await getUserById(9);
  if (!user) {
    res.status(404).json({
      message: "User not found",
    });
    return;
  }
  const items = user.items;

  for (const item of items) {
    const url = await getObjectSignedUrl(item.imgName);
    (
      item as Item & {
        category: Category;
        imgUrl: string;
      }
    ).imgUrl = url;
  }

  res.render("pages/myLists", { items });
});

users.get("/likes", requiresAuth(), async (req, res) => {
  try {
    const likedItems = await getUserLikedItems(9);
    if (!likedItems) return res.status(404).json({ message: "User not found" });
    for (const { item } of likedItems) {
      const url = await getObjectSignedUrl(item.imgName);
      (
        item as Item & {
          category: Category;
          imgUrl: string;
        }
      ).imgUrl = url;
    }
    res.render("pages/likes", { likedItems });
  } catch (error) {}
});

users.get("/:id", async (req, res) => {
  const id = +req.params.id;
  const user = await getUserById(id);
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  for (const item of user.items) {
    const url = await getObjectSignedUrl(item.imgName);
    (
      item as Item & {
        category: Category;
        imgUrl: string;
      }
    ).imgUrl = url;
  }

  res.render("pages/seller", { user: user });
});

export default users;
