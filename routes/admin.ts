import express from "express";
import { getUserByAuth0Id } from "../services/user";

const admin = express.Router();

admin.get("/removeChannels", async (req, res, next) => {
  try {
    const user = req.oidc.user
      ? await getUserByAuth0Id(req.oidc.user.sub)
      : null;
    if (!user) throw new Error("User not found");
    res.render("pages/removeChannels", { user });
  } catch (error) {
    next(error);
  }
});

export default admin;
