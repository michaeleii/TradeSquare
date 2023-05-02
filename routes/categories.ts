import express from "express";

import { getAllCategories, getItemsByCategoryId } from "../models/categories";

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { z } from "zod";
import { Item, User } from "@prisma/client";

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

const categories = express.Router();

categories.get("/all", async (req, res) => {
  const categories = await getAllCategories();
  if (categories) {
    res.render("pages/categories", {
      categories,
      previousLink: req.headers.referer,
    });
  } else {
    res.status(404).send("No categories found");
  }
});

categories.get("/:id", async (req, res) => {
  const categoryId = Number(req.params.id);
  const category = await getItemsByCategoryId(categoryId);
  if (category) {
    for (const item of category.items) {
      const getObjectParams = {
        Bucket: bucketName,
        Key: item.imgName,
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      (
        item as Item & {
          user: User | null;
          imgUrl: string;
        }
      ).imgUrl = url;
    }
    res.render("pages/category", { category });
  } else {
    res.status(404).send("No categories found");
  }
});

export default categories;
