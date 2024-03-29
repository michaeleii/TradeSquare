import express from "express";
import { getAllCategories, getItemsByCategoryId } from "../services/categories";
import { Item, User } from "@prisma/client";
import { getObjectSignedUrl } from "../s3";
import { getUserByAuth0Id, getUserReviews } from "../services/user";

const categories = express.Router();

categories.get("/all", async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    if (!categories) throw new Error("No categories found");
    const user = req.oidc.user
      ? await getUserByAuth0Id(req.oidc.user.sub)
      : null;
    res.render("pages/categories", {
      categories,
      user,
      isAuthenticated: req.oidc.isAuthenticated(),
    });
  } catch (error) {
    next(error);
  }
});

categories.get("/:id", async (req, res, next) => {
  try {
    const categoryId = +req.params.id;
    const category = await getItemsByCategoryId(categoryId);
    if (!category) throw new Error("No categories found");

    for (const item of category.items) {
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
          user: User | null;
          imgUrl: string;
        }
      ).imgUrl = url;
      (item as any).user.avgRatings = !sellerAvgRatings ? 0 : sellerAvgRatings;
    }

    const user = req.oidc.user
      ? await getUserByAuth0Id(req.oidc.user.sub)
      : null;
    res.render("pages/category", {
      category,
      user,
      isAuthenticated: req.oidc.isAuthenticated(),
    });
  } catch (error) {
    next(error);
  }
});

export default categories;
