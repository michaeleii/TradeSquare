import express from "express";
import { getUserByAuth0Id } from "../services/user";

const admin = express.Router();

admin.get("/removeChannels", async (req, res) => {
  const user = req.oidc.user ? await getUserByAuth0Id(req.oidc.user.sub) : null;
  if (user) {
    res.render("pages/removeChannels", { user });
  } else {
    res.status(404).send("Users not found");
    return;
  }
});

export default admin;
