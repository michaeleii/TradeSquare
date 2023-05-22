import express from "express";
import { getAllCategories, getItemsByCategoryId } from "../services/categories";
import { Item, User } from "@prisma/client";
import { getObjectSignedUrl } from "../s3";
import { getUserByAuth0Id } from "../services/user";

const categories = express.Router();

categories.get("/all", async (req, res) => {
  const categories = await getAllCategories();
  if (categories) {
    const user = req.oidc.user
      ? await getUserByAuth0Id(req.oidc.user.sub)
      : null;
    res.render("pages/categories", {
      categories,
      user,
    });
  } else {
    res.status(404).send("No categories found");
  }
});

categories.get("/:id", async (req, res) => {
  const categoryId = +req.params.id;
  const category = await getItemsByCategoryId(categoryId);
  if (category) {
    for (const item of category.items) {
      const url = await getObjectSignedUrl(item.imgName);
      (
        item as Item & {
          user: User | null;
          imgUrl: string;
        }
      ).imgUrl = url;
    }

    const user = req.oidc.user
      ? await getUserByAuth0Id(req.oidc.user.sub)
      : null;
    res.render("pages/category", { category, user });
  } else {
    res.status(404).send("No categories found");
  }
});

export default categories;
