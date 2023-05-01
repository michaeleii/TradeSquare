import express from "express";
import {
  createItem,
  getAllItems,
  getItemByItemId,
  deleteItem,
} from "../models/item";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import multer from "multer";
import { z } from "zod";
import dotenv from "dotenv";
import crypto from "crypto";
import { Item } from "@prisma/client";
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

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
  try {
    const items = await getAllItems();

    if (!items) {
      res.status(404).json({
        message: "Items not found",
      });
      return;
    }

    for (const item of items) {
      const getObjectParams = {
        Bucket: bucketName,
        Key: item.imgName,
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      (
        item as Item & {
          imgUrl: string;
        }
      ).imgUrl = url;
    }
    res.render("pages/itemList", { items });
  } catch (error) {
    res.status(500).send(error);
  }
});

items
  .route("/create")
  .get((req, res) => {
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
    try {
      await s3.send(command);
      let formData = req.body;
      formData.imgName = params.Key;
      formData.userId = 1;
      const item = await createItem(req.body);
      res.redirect(`/items/item/${item.id}`);
    } catch (error) {
      res.status(500).send(error);
    }
  });

items.get("/categories", (req, res) => {
  res.render("pages/categories");
});

items.get("/item/:id", async (req, res) => {
  const item = await getItemByItemId(+req.params.id);
  if (item) {
    const getObjectParams = {
      Bucket: bucketName,
      Key: item.imgName,
    };
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    (
      item as Item & {
        imgUrl: string;
      }
    ).imgUrl = url;
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

items.get("/listingWithEdit/:id", async (req, res) => {
  const item = await getItemByItemId(+req.params.id);
  if (item) {
    const getObjectParams = {
      Bucket: bucketName,
      Key: item.imgName,
    };
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    (
      item as Item & {
        imgUrl: string;
      }
    ).imgUrl = url;
    res.render("pages/EditItem", { item });
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

items.get("/editListing/:id", async (req, res) => {
  res.send("This is the edit page");
});

items.get("/deleteListing/:id", async (req, res) => {
  const item = await getItemByItemId(+req.params.id);

  if (item) {
    const deleteObjectParams = {
      Bucket: bucketName,
      Key: item.imgName,
    };
    const command = new DeleteObjectCommand(deleteObjectParams);
    await s3.send(command);

    await deleteItem(+req.params.id);

    res.send("Item deleted successfully");
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

export default items;
