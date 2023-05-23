import express from "express";
import {
  getUserByAuth0Id,
  getUserById,
  editUserProfile,
} from "../services/user";

const test = express.Router();

const authenticateMessage = (req: any, res: any, next: any) =>
  !req.oidc.user ? res.redirect(`/test/featureMessagePage`) : next();

// Do test.get(/<component name>/) for each component you want to test
test.get("/mailbox", authenticateMessage, async (req, res, next) => {
  try {
    const user = req.oidc.user
      ? await getUserByAuth0Id(req.oidc.user.sub)
      : null;
    if (!user) throw new Error("User not found");
    res.render("pages/mailbox", {
      user,
      isAuthenticated: req.oidc.isAuthenticated(),
    });
  } catch (error) {
    next(error);
  }
});

test.get("/credentials", (req, res) =>
  res.render("pages/credentials", { state: null })
);

test.get("/message/:receiverAuth0Id", async (req, res, next) => {
  try {
    const user = req.oidc.user
      ? await getUserByAuth0Id(req.oidc.user.sub)
      : null;
    if (!user) throw new Error("Can't send message to invalid user");

    const receiver = await getUserByAuth0Id(req.params.receiverAuth0Id);
    (user as any).sid = req.oidc.user?.sid;
    res.render("pages/message.ejs", {
      user,
      receiver,
    });
  } catch (error) {
    next(error);
  }
});

test.get("/featureMessagePage", (req, res) => {
  res.render("pages/featurePageMessage");
});

test.get("/featureLikePage", (req, res) => {
  res.render("pages/featurePageLike");
});

test.get("/preFeatureProfile", (req, res) => {
  res.render("pages/preFeatureProfilePage");
});

test.get("/categoriesCarousel", (req, res) => {
  res.render("pages/categoriesCarousel");
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
