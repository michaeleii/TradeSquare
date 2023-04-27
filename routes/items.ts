import express from "express";
import { getAllItems, getItemByItemId } from "../models/item";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  S3,
} from "@aws-sdk/client-s3";
import multer from "multer";
import { z } from "zod";
import dotenv from "dotenv";
import crypto from "crypto";
import prisma from "../client";
import { Item } from "@prisma/client";
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

interface ItemWithImgUrl extends Item {
  imgUrl: string;
}
dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

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

items.get("/getImgUrl", async (req, res) => {
  const items = await prisma.item.findMany({});

  for (const item of items) {
    const getObjectParams = {
      Bucket: bucketName,
      Key: item.imgName,
    };
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    (item as ItemWithImgUrl).imgUrl = url;
  }
  res.send(items);
});

items
  .route("/createListing")
  .get(async (req, res) => {
    res.render("components/createListing");
  })
  .post(upload.single("image"), async (req, res) => {
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }
    const params = {
      Bucket: bucketName,
      Key: randomImageName(),
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);
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
