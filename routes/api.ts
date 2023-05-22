import express from "express";
import { getAllItems } from "../services/item";
import {
  checkIfUserJoined,
  checkIfUserLiked,
  getUserByAuth0Id,
  joinSquare,
  likeItem,
  unjoinSquare,
  unlikeItem,
} from "../services/user";

const api = express.Router();

api.get("/items", async (req, res, next) => {
  try {
    const items = await getAllItems(req.oidc.user?.sub);
    res.json(items);
  } catch (error) {
    next(error);
  }
});

api.post("/item/like", async (req, res, next) => {
  try {
    const { itemId } = req.body;
    const user = await getUserByAuth0Id(req.oidc.user?.sub);
    if (!user) throw new Error("User not found");
    const userId = user.id;
    const liked = await checkIfUserLiked(userId, +itemId);
    liked ? await unlikeItem(userId, +itemId) : await likeItem(userId, +itemId);
  } catch (error) {
    next(error);
  }
});

api.post("/square/join", async (req, res, next) => {
  try {
    const { squareId } = req.body;
    const user = await getUserByAuth0Id(req.oidc.user?.sub);
    if (!user) throw new Error("User not found");
    const userId = user.id;
    const joined = await checkIfUserJoined(userId, +squareId);
    if (!joined) {
      await joinSquare(userId, +squareId);
    }
  } catch (error) {
    next(error);
  }
});

api.post("/square/leave", async (req, res, next) => {
  try {
    const { squareId } = req.body;
    const user = await getUserByAuth0Id(req.oidc.user?.sub);
    if (!user) throw new Error("User not found");
    const userId = user.id;
    const joined = await checkIfUserJoined(userId, +squareId);
    if (joined) {
      await unjoinSquare(userId, +squareId);
    }
  } catch (error) {
    next(error);
  }
});

export default api;
