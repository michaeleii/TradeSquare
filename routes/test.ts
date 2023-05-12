import express from "express";
import { getUserByAuth0Id } from "../services/user";

const test = express.Router();

// Do test.get(/<component name>/) for each component you want to test
test.get("/mailbox", async (req, res) => {
    const user = req.oidc.user ? await getUserByAuth0Id(req.oidc.user.sub) : null;    
    if(user) {
        res.render("pages/mailbox", { user });
    }
    else {
        res.status(404).send("Users not found");
        return;
    }
});

test.get("/credentials", (req, res) =>
  res.render("pages/credentials", { state: null })
);

test.get('/message', (req, res) => {
    res.render('pages/myMessage');
});

test.get('/introlikes', (req, res) => {
    res.render('pages/introLikes');

})

export default test;
