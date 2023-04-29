import express from "express";
import squareList from "../models/squares";

const squares = express.Router();

squares.get("/all", (req, res) => {
  res.render("pages/squares", { squareList });
});

// squares.get("/:id", (req, res) => {
// 	res.send("Square for id: " + req.params.id);
// });

squares.get("/squaretitlecomponent", (req, res) => {
  res.render("components/Square_Title_and_Description");
});

squares.get("/joinsquarebtncomponent", (req, res) => {});

squares.get("/postcomponent", (req, res) => res.render("components/postCard"));

squares.get("/subnavcomponent", (req, res) => {
  res.render("components/subNavigation");
});

squares.get("/searchBarComponent", (req, res) => {
  res.render("components/searchBar");
});

export default squares;
