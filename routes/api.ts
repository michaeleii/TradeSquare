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

api.get("/items", async (req, res) => {
  const items = await getAllItems();
  res.json(items);
});

api.post("/item/like", async (req, res) => {
  const { itemId } = req.body;
  const user = await getUserByAuth0Id(req.oidc.user?.sub);
  if (!user) return res.status(404).send("User not found");
  const userId = user.id;
  const liked = await checkIfUserLiked(userId, +itemId);
  liked ? await unlikeItem(userId, +itemId) : await likeItem(userId, +itemId);
});

api.post("/square/join", async (req, res) => {
  const { squareId } = req.body;
  const user = await getUserByAuth0Id(req.oidc.user?.sub);
  if (!user) return res.status(404).send("User not found");
  const userId = user.id;
  const joined = await checkIfUserJoined(userId, +squareId);
  if (!joined) {
    await joinSquare(userId, +squareId);
  }
});

api.post("/square/leave", async (req, res) => {
  const { squareId } = req.body;
  const user = await getUserByAuth0Id(req.oidc.user?.sub);
  if (!user) return res.status(404).send("User not found");
  const userId = user.id;
  const joined = await checkIfUserJoined(userId, +squareId);
  if (joined) {
    await unjoinSquare(userId, +squareId);
  }
});

export default api;
