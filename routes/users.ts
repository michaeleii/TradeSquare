import express from "express";
import { getUserById } from "../services/user";
import { Category, Item } from "@prisma/client";
import { z } from "zod";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

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

const users = express.Router();

users.get("/profile/:id", async (req, res) => {
	const id = Number(req.params.id);
	const user = await getUserById(id);
	if (!user) {
		res.status(404).json({
			message: "User not found",
		});
		return;
	}
	res.render("pages/profile", {
		user: user,
		previousLink: req.headers.referer,
	});
});

users.get("/myLists/:id", async (req, res) => {
	const id = Number(req.params.id);
	const user = await getUserById(id);
	if (!user) {
		res.status(404).json({
			message: "User not found",
		});
		return;
	}
	const items = user.items;
	if (items) {
		for (const item of items) {
			const getObjectParams = {
				Bucket: bucketName,
				Key: item.imgName,
			};
			const command = new GetObjectCommand(getObjectParams);
			const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
			(
				item as Item & {
					category: Category;
					imgUrl: string;
				}
			).imgUrl = url;
		}
	}
	res.render("pages/myLists", { items, previousLink: req.headers.referer });
});

users.get("/likes/:id", async (req, res) => {
	const id = +req.params.id;
	const userLikedItems = await getUserLikedItems(id);
	if (userLikedItems) {
		for (const item of userLikedItems) {
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
		res.render("pages/likes", {
			userLikedItems,
			previousLink: req.headers.referer,
		});
	} else {
		res.status(404).json({
			message: "User not found",
		});
		return;
	}
});

users.get("/:id", async (req, res) => {
	const id = +req.params.id;
	const user = await getUserById(id);
	if (!user) {
		res.status(404).json({
			message: "User not found",
		});
		return;
	}
	for (const item of user.items) {
		const getObjectParams = {
			Bucket: bucketName,
			Key: item.imgName,
		};
		const command = new GetObjectCommand(getObjectParams);
		const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
		(
			item as Item & {
				category: Category;
				imgUrl: string;
			}
		).imgUrl = url;
	}

	res.render("pages/seller", { user: user });
});

export default users;
