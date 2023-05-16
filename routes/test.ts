import express from "express";
import { getUserByAuth0Id } from "../services/user";

const test = express.Router();

// Do test.get(/<component name>/) for each component you want to test

test.get("/message", async (req, res) => {
  const user = req.oidc.user ? await getUserByAuth0Id(req.oidc.user.sub) : null;
  if (!user) {
    res.status(404).send("User not found");
  } else {
    res.render("pages/myMessage");
  }
});

test.get("/featureMessagePage", (req, res) => {
  res.render("pages/featurePageMessage");
});

test.get("/preFeatureProfile", (req, res) => {
  res.render("pages/preFeatureProfilePage");
});

test.get("/preFeatureItem", (req, res) => {
  res.render("pages/preFeatureItemPage");
});

export default test;
