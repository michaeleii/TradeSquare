import express from "express";
import {
  getUserByAuth0Id,
  getUserById,
  editUserProfile,
} from "../services/user";

const test = express.Router();

// Do test.get(/<component name>/) for each component you want to test

test.get("/credentials", (req, res) =>
  res.render("pages/credentials", { state: null })
);

test.get("/featureMessagePage", (req, res) => {
  res.render("pages/featurePageMessage");
});

test.get("/featureLikePage", (req, res) => {
  res.render("pages/featurePageLike");
});

test.get("/preFeatureProfile", (req, res) => {
  res.render("pages/preFeatureProfilePage");
});

test.get("/editprofile/:id", async (req, res) => {
  const id = +req.params.id;
  const user = await getUserById(id);
  res.render("pages/profileform", { user });
});

test.post("/editprofile/:id", async (req, res) => {
  const id = +req.params.id;
  const newUserInfo = await editUserProfile(req.body, id);
  res.redirect(`/users/profile/${id}`);
});

export default test;
