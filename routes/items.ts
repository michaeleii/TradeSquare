import express from "express";
import {
  createItem,
  getAllItems,
  getItemByItemId,
  updateItem,
  deleteItem,
} from "../services/item";
import { requiresAuth } from "express-openid-connect";

import {
  checkIfUserLiked,
  getUserByAuth0Id,
  getUserReviews,
} from "../services/user";

import multer from "multer";
import { Category, Item, Like, User } from "@prisma/client";
import { uploadFile, deleteFile, getObjectSignedUrl } from "../s3";
import crypto from "crypto";

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const upload = multer({ storage: multer.memoryStorage() });

const items = express.Router();

items.get("/all", async (req, res, next) => {
  try {
    const items = await getAllItems(req.oidc.user?.sub);
    if (!items) throw new Error("No items found");

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
          user: User;
          likes: Like[];
          imgUrl: string;
        }
      ).imgUrl = url;
      (item as any).user.avgRatings = !sellerAvgRatings ? 0 : sellerAvgRatings;
    }

    const user = req.oidc.user
      ? await getUserByAuth0Id(req.oidc.user.sub)
      : null;
    res.render("pages/itemList", {
      items,
      user,
      isAuthenticated: req.oidc.isAuthenticated(),
    });
  } catch (error) {
    next(error);
  }
});

items
  .route("/create")
  .get(requiresAuth(), (req, res) => {
    res.render("pages/createListing");
  })
  .post(upload.single("image"), async (req, res, next) => {
    if (!req.file) throw new Error("No file uploaded");
    try {
      const imgName = randomImageName();
      await uploadFile(req.file.buffer, imgName, req.file.mimetype);
      req.body.imgName = imgName;
      const user = await getUserByAuth0Id(req.oidc.user?.sub);
      if (!user) throw new Error("Please log in to create an item");
      req.body.userId = user.id;
      req.body.categoryId = +req.body.categoryId;
      const item = await createItem(req.body);
      res.redirect(`/items/view/${item.id}`);
    } catch (error) {
      next(error);
    }
  });

items.get("/my-item/:id", requiresAuth(), async (req, res, next) => {
  try {
    const item = await getItemByItemId(+req.params.id);
    if (!item) throw new Error("Item not found");
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

    const user = req.oidc.user
      ? await getUserByAuth0Id(req.oidc.user.sub)
      : null;
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
  } catch (error) {
    next(error);
  }
});

items.get("/delete/:id", requiresAuth(), async (req, res, next) => {
  try {
    const item = await getItemByItemId(+req.params.id);
    if (!item) throw new Error("Item not found");
    await deleteFile(item.imgName);
    await deleteItem(+req.params.id);
    res.redirect("/items/all");
  } catch (error) {
    next(error);
  }
});

items
  .route("/edit/:id")
  .get(requiresAuth(), async (req, res, next) => {
    try {
      const item = await getItemByItemId(+req.params.id);
      if (!item) throw new Error("Item not found");
      res.render("pages/editListing", { item });
    } catch (error) {
      next(error);
    }
  })
  .post(async (req, res, next) => {
    try {
      const [itemId, formData] = [+req.params.id, req.body];
      await updateItem(itemId, formData);
      res.redirect(`/items/my-item/${itemId}`);
    } catch (error) {
      next(error);
    }
  });

items.get("/view/:id", async (req, res, next) => {
  try {
    const item = await getItemByItemId(+req.params.id);
    if (!item) throw new Error("Item not found");
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
        category: Category;
        likeCount: number;
        user: User;
        likes: Like[];
        imgUrl: string;
      }
    ).imgUrl = url;
    (item as any).user.avgRatings = !sellerAvgRatings ? 0 : sellerAvgRatings;

    const user = req.oidc.user
      ? await getUserByAuth0Id(req.oidc.user.sub)
      : null;
    if (user) {
      (
        item.user as User & {
          liked: boolean;
        }
      ).liked = await checkIfUserLiked(user.id, item.id);
    }
    res.render("pages/item", {
      item,
      user,
      isAuthenticated: req.oidc.isAuthenticated(),
    });
  } catch (error) {
    next(error);
  }
});

export default items;
