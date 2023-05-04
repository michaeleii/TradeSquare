import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();

import { getAllItems } from "./services/item";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

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

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
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
					user: User;
					imgUrl: string;
				}
			).imgUrl = url;
		}
		res.render("pages/index", { items });
	} catch (error) {
		res.status(500).send(error);
	}
});

import squaresRouter from "./routes/squares";
import itemsRouter from "./routes/items";
import usersRouter from "./routes/users";
import categories from "./routes/categories";
import apiRouter from "./routes/api";
import { Item, User } from "@prisma/client";

app.use("/squares", squaresRouter);

app.use("/items", itemsRouter);

app.use("/categories", categories);

app.use("/users", usersRouter);

app.use("/api", apiRouter);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
