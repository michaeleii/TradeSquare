import express from "express";
import { getUserByAuth0Id } from "../services/user";

const test = express.Router();

// Do test.get(/<component name>/) for each component you want to test

test.get('/message', async (req, res) => {
    const user = req.oidc.user ? await getUserByAuth0Id(req.oidc.user.sub): null;
    if (!user) {
        res.status(404).send("User not found");
    } else {
        res.render('pages/myMessage');
    }
});

export default test;
