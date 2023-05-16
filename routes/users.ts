import express from "express";
import {
  getUserByAuth0Id,
  getUserById,
  getUserLikedItems,
  getUserSquares,
} from "../services/user";
import { Category, Item } from "@prisma/client";
import { getObjectSignedUrl } from "../s3";
import { requiresAuth } from "express-openid-connect";

const users = express.Router();

// Middleware function for authentication

const authenticate = (req: any, res: any, next: any) => {
  if (req.oidc.user) {
    return next();
  }
  res.redirect(`/test/featureLikePage`);
};


// Example route that requires authentication
// users.get('/secret', authenticate, (req, res) => {
//   // This route will only be accessible to authenticated users
// })


users.get("/profile/:id", authenticate, async (req, res, next) => {
  const id = +req.params.id;
  const user = await getUserById(id);
  if (!user) {
    res.status(404).json({
      message: "User not found",
    });
    return;
  }
  res.render("pages/profile", { user });
});

users.get("/my-items", requiresAuth(), async (req, res) => {
  const user = await getUserByAuth0Id(req.oidc.user?.sub);
  if (!user) return res.status(404).send("User not found");
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

users.get("/my-squares", requiresAuth(), async (req, res) => {
  const user = await getUserByAuth0Id(req.oidc.user?.sub);
  if (!user) return res.status(404).send("User not found");
  const userSquares = await getUserSquares(user.id);
  if (!userSquares) {
    res.status(404).send("User not found");
    return;
  }
  res.render("pages/mySquares", { userSquares });
});


users.get("/likes", authenticate, async (req, res, next) => {
  try {
    const user = await getUserByAuth0Id(req.oidc.user?.sub);
    if (!user) return res.status(404).send("User not found");
    const likedItems = await getUserLikedItems(user.id);
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
  } catch (error) { }
});

// users.get("/likes", requiresAuth(), async (req, res) => {
//   try {
//     const user = await getUserByAuth0Id(req.oidc.user?.sub);
//     if (!user) return res.status(404).send("User not found");
//     const likedItems = await getUserLikedItems(user.id);
//     if (!likedItems) return res.status(404).json({ message: "User not found" });
//     for (const { item } of likedItems) {
//       const url = await getObjectSignedUrl(item.imgName);
//       (
//         item as Item & {
//           category: Category;
//           imgUrl: string;
//         }
//       ).imgUrl = url;
//     }
//     res.render("pages/likes", { likedItems });
//   } catch (error) {}
// });

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
