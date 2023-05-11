import express from "express";

const test = express.Router();

// Do test.get(/<component name>/) for each component you want to test

test.get('/message', (req, res) => {
    res.render('pages/myMessage');
});

export default test;
