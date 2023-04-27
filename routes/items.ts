import express from "express";
import { getAllItems, getItemByItemId } from "../models/item";

import { S3Client } from "@aws-sdk/client-s3";
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const envVariables = z.object({
  BUCKET_NAME: z.string(),
  BUCKET_REGION: z.string(),
  ACCESS_KEY: z.string(),
  SECRET_ACCESS_KEY: z.string(),
});

envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {
      BUCKET_NAME: string;
      BUCKET_REGION: string;
      ACCESS_KEY: string;
      SECRET_ACCESS_KEY: string;
    }
  }
}

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

const items = express.Router();

items.get("/all", async (req, res) => {
  const items = await getAllItems();
  res.render("pages/itemList", { items });
});

items.get("/createListing", (req, res) => {
  res.render("components/createListing");
});

items.get("/:id", async (req, res) => {
  const item = await getItemByItemId(+req.params.id);
  if (item) {
    res.render("pages/item", { item });
  } else {
    res.status(404).render("pages/error", {
      message: "Item not found",
      error: {
        status: "404",
        stack: "The item you are looking for does not exist",
      },
    });
  }
});

items.get("/itemcard", (req, res) => res.render("components/itemCard"));

items.get("/searchbar", (req, res) => {});

items.get("/itempage", (req, res) => {});

items.get("/itembtns", (req, res) => {});

export default items;
